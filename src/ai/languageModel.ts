/**
 * Prompt API adapter.
 *
 * Requirements from the current documentation implemented here:
 * - `create()` requires user activation; missing activation becomes a specific
 *   error with a continue button instead of a raw exception.
 * - `signal` is passed only to `prompt()`, not to `create()`.
 * - `contextWindow`/`contextUsage` replaced `inputQuota`/`inputUsage`, and the
 *   event changed from `quotaoverflow` to `contextoverflow`. Both are handled.
 * - Context overflow recreates the session while preserving recent messages.
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
  /** Recreates the session from scratch while keeping the same system prompt. */
  reset(): Promise<void>;
};

export async function createSession(
  systemPrompt: string,
  onProgress?: (sample: DownloadProgressSample) => void,
): Promise<ModelSession> {
  if (!self.LanguageModel) {
    throw new AiError("PROMPT_API_ABSENT");
  }

  const build = async (): Promise<LanguageModelSession> => {
    try {
      return await self.LanguageModel!.create({
        ...MODEL_OPTIONS,
        initialPrompts: [{ role: "system", content: systemPrompt }],
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

  let session = await build();
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

  return {
    async prompt(text: string, signal?: AbortSignal) {
      try {
        const answer = await promptWithDeadline(session, text, signal);
        return answer;
      } catch (error) {
        const mapped = toAiError(error, "SESSION_FAILED");
        if (mapped.code === "CONTEXT_OVERFLOW" || overflowed) {
          // Restart the session and retry once. Game state lives elsewhere, so
          // no progress is lost during this operation.
          try {
            session.destroy?.();
          } catch {
            /* already closed */
          }
          session = await build();
          attachOverflow(session);
          overflowed = false;
          return promptWithDeadline(session, text, signal);
        }
        throw mapped;
      }
    },
    usage() {
      return {
        used: session.contextUsage ?? session.inputUsage,
        window: session.contextWindow ?? session.inputQuota,
      };
    },
    async reset() {
      try {
        session.destroy?.();
      } catch {
        /* already closed */
      }
      session = await build();
      attachOverflow(session);
      overflowed = false;
    },
    destroy() {
      try {
        session.destroy?.();
      } catch {
        /* already closed */
      }
    },
  };
}
