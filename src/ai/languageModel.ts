/**
 * Prompt API adapter.
 *
 * Requirements from the current documentation implemented here:
 * - `create()` requires user activation; missing activation becomes a specific
 *   error with a continue button instead of a raw exception.
 * - `signal` is passed only to `prompt()`, not to `create()`.
 * - `contextWindow`/`contextUsage` replaced `inputQuota`/`inputUsage`, and the
 *   event changed from `quotaoverflow` to `contextoverflow`. Both are handled.
 *
 * The session owns the only copy of its history that the model can see, and
 * that copy dies with the page. A rolling transcript is kept here so the two
 * moments that would otherwise erase the character's memory—a context overflow
 * and a reload—can replay recent turns through `initialPrompts`.
 */

import {
  TIMED_OUT,
  normalizeAvailability,
  readDownloadProgress,
  withTimeout,
  type Availability,
  type DownloadProgressSample,
} from "./availability";
import { AiError, toAiError } from "./errors";

const MODEL_OPTIONS: LanguageModelCreateOptions = {
  expectedInputs: [{ type: "text", languages: ["en"] }],
  expectedOutputs: [{ type: "text", languages: ["en"] }],
};

/**
 * Maximum wait for a model response. Without it, a call that never resolves
 * (already observed with these experimental APIs) would lock the conversation
 * forever. The deadline turns it into a recoverable error so the player can
 * retry. The first response can be slow while the model loads into memory.
 */
const PROMPT_TIMEOUT_MS = 55_000;

/** Turns kept in memory for replay. Beyond this the oldest ones are dropped. */
const TRANSCRIPT_LIMIT = 16;

/**
 * Turns replayed after a context overflow. Deliberately smaller than the
 * transcript: the session overflowed once already, so the rebuild has to fit.
 */
const REPLAY_MESSAGES = 8;

/**
 * `initialPrompts` is rejected by some Chrome builds when two messages share a
 * role in sequence. Merging runs keeps a replay valid without dropping content.
 */
function normalizeHistory(messages: AiPromptMessage[]): AiPromptMessage[] {
  const merged: AiPromptMessage[] = [];
  for (const message of messages) {
    const content = message.content.trim();
    if (!content) continue;
    const last = merged[merged.length - 1];
    if (last && last.role === message.role) {
      last.content = `${last.content}\n${content}`;
      continue;
    }
    merged.push({ role: message.role, content });
  }
  return merged;
}

async function promptWithDeadline(
  session: LanguageModelSession,
  text: string,
  signal?: AbortSignal,
): Promise<string> {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onAbort, { once: true });
  }

  const raced = await withTimeout(
    session.prompt(text, { signal: controller.signal }),
    PROMPT_TIMEOUT_MS,
  );

  if (signal) signal.removeEventListener("abort", onAbort);

  if (raced === TIMED_OUT) {
    // Abort the pending call so work does not leak into the background.
    controller.abort();
    throw new AiError("SESSION_FAILED", "prompt-timeout");
  }
  return raced;
}

export async function modelAvailability(): Promise<Availability | "timeout"> {
  if (!self.LanguageModel) return "unavailable";
  try {
    const raw = await withTimeout(self.LanguageModel.availability(MODEL_OPTIONS));
    if (raw === TIMED_OUT) return "timeout";
    return normalizeAvailability(raw);
  } catch {
    return "unavailable";
  }
}

export type ModelSession = {
  prompt(text: string, signal?: AbortSignal): Promise<string>;
  usage(): { used?: number; window?: number };
  destroy(): void;
  /** Recreates the session from scratch, dropping the history it had. */
  reset(): Promise<void>;
};

export async function createSession(
  systemPrompt: string,
  onProgress?: (sample: DownloadProgressSample) => void,
  /** Prior turns, already in the model's language, replayed on creation. */
  seedHistory: AiPromptMessage[] = [],
): Promise<ModelSession> {
  if (!self.LanguageModel) {
    throw new AiError("PROMPT_API_ABSENT");
  }

  let transcript = normalizeHistory(seedHistory).slice(-TRANSCRIPT_LIMIT);

  const build = async (replay: AiPromptMessage[]): Promise<LanguageModelSession> => {
    try {
      return await self.LanguageModel!.create({
        ...MODEL_OPTIONS,
        initialPrompts: [{ role: "system", content: systemPrompt }, ...replay],
        monitor(monitor) {
          monitor.addEventListener("downloadprogress", (event) => {
            onProgress?.(readDownloadProgress(event));
          });
        },
      });
    } catch (error) {
      throw toAiError(error, "SESSION_FAILED");
    }
  };

  /** Replays what it can; a rejected history costs memory, never the session. */
  const buildWithHistory = async (history: AiPromptMessage[]): Promise<LanguageModelSession> => {
    const replay = normalizeHistory(history);
    if (replay.length === 0) return build([]);
    try {
      return await build(replay);
    } catch {
      return build([]);
    }
  };

  let session = await buildWithHistory(transcript);
  let overflowed = false;

  const attachOverflow = (current: LanguageModelSession) => {
    const handler = () => {
      overflowed = true;
    };
    try {
      current.addEventListener("contextoverflow", handler);
      // Legacy alias still present in older Chrome versions.
      current.addEventListener("quotaoverflow", handler);
    } catch {
      // Session without a complete EventTarget: continue without the early warning.
    }
  };

  attachOverflow(session);

  const closeSession = () => {
    try {
      session.destroy?.();
    } catch {
      /* already closed */
    }
  };

  const remember = (...messages: AiPromptMessage[]) => {
    transcript = [...transcript, ...messages].slice(-TRANSCRIPT_LIMIT);
  };

  return {
    async prompt(text: string, signal?: AbortSignal) {
      let answer: string;
      try {
        answer = await promptWithDeadline(session, text, signal);
      } catch (error) {
        const mapped = toAiError(error, "SESSION_FAILED");
        if (mapped.code !== "CONTEXT_OVERFLOW" && !overflowed) throw mapped;

        // Restart the session and retry. Game state lives elsewhere, and recent
        // turns are replayed so the character does not lose the thread.
        closeSession();
        session = await buildWithHistory(transcript.slice(-REPLAY_MESSAGES));
        attachOverflow(session);
        overflowed = false;

        try {
          answer = await promptWithDeadline(session, text, signal);
        } catch (retryError) {
          const retryMapped = toAiError(retryError, "SESSION_FAILED");
          if (retryMapped.code !== "CONTEXT_OVERFLOW" && !overflowed) throw retryMapped;

          // The replay itself did not fit. Start clean rather than leaving the
          // conversation unusable.
          closeSession();
          transcript = [];
          session = await build([]);
          attachOverflow(session);
          overflowed = false;
          answer = await promptWithDeadline(session, text, signal);
        }
      }

      remember({ role: "user", content: text }, { role: "assistant", content: answer });
      return answer;
    },
    usage() {
      return {
        used: session.contextUsage ?? session.inputUsage,
        window: session.contextWindow ?? session.inputQuota,
      };
    },
    async reset() {
      closeSession();
      transcript = [];
      session = await build([]);
      attachOverflow(session);
      overflowed = false;
    },
    destroy() {
      closeSession();
    },
  };
}
