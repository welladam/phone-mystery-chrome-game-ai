/**
 * Character sessions.
 *
 * Each character has a dedicated Prompt API session, created only when the
 * player opens that conversation. Sessions never overlap:
 *
 * - a dedicated system prompt;
 * - dedicated history maintained by the session itself;
 * - allowed facts calculated by the engine and injected one by one.
 *
 * Native sessions do not survive a reload, but the saved conversation does. On
 * first use the visible history is translated and replayed into the new
 * session, so the character never answers a restored conversation as if it were
 * the first message.
 *
 * Nothing the character is not yet allowed to say is sent here. From the
 * session's perspective, a locked fact simply does not exist.
 */

import type { CharacterId } from "../engine/types";
import type { LocaleBundle } from "../locales/types";
import { getLocaleChat } from "../locales/chatRegistry";
import type { BootRuntime } from "./bootstrap";
import { AiError, toAiError } from "./errors";
import { createSession, type ModelSession } from "./languageModel";

export type DialogueTurn = { role: "player" | "character"; text: string };

export type TurnInput = {
  characterId: CharacterId;
  /** Player message in Portuguese. */
  playerText: string;
  /** Facts released by the engine, already in English. */
  facts: string[];
  /** Clue attached by the player, described neutrally in English. */
  attachedEvidence?: string;
  /** Canonical messages delivered outside the model but required for continuity. */
  scriptedContext: DialogueTurn[];
  /**
   * Visible conversation so far, oldest first. Used only when the session has
   * to be created, to restore what the player can already read on screen.
   */
  history?: DialogueTurn[];
  act: number;
};

export type TurnResult = {
  /** Portuguese lines ready to become chat bubbles. */
  lines: string[];
  raw: string;
};

const MAX_LINES = 4;

/**
 * Turns replayed when a session is recreated for a conversation that already
 * has history. Each one costs a translation before the first answer, so the
 * window is short enough not to be felt and long enough to hold the thread.
 */
const SEED_MESSAGES = 12;

export class CharacterSessions {
  private sessions = new Map<CharacterId, ModelSession>();
  private creating = new Map<CharacterId, Promise<ModelSession>>();

  constructor(private runtime: BootRuntime, private locale: LocaleBundle) {}

  /** Opens the session on demand. Called from a player click. */
  async ensure(characterId: CharacterId, history: DialogueTurn[] = []): Promise<ModelSession> {
    const existing = this.sessions.get(characterId);
    if (existing) return existing;

    const pending = this.creating.get(characterId);
    if (pending) return pending;

    const profile = getLocaleChat(this.locale.meta.id).getCharacter(characterId);
    const job = this.seedFrom(history)
      .then((seedHistory) => createSession(profile.systemPrompt, undefined, seedHistory))
      .then((session) => {
        this.sessions.set(characterId, session);
        this.creating.delete(characterId);
        return session;
      })
      .catch((error) => {
        this.creating.delete(characterId);
        throw toAiError(error, "SESSION_FAILED");
      });

    this.creating.set(characterId, job);
    return job;
  }

  /**
   * Translates the recent conversation into the model's language. A failure
   * here must not block the turn: the session simply starts without the recall.
   */
  private async seedFrom(history: DialogueTurn[]): Promise<AiPromptMessage[]> {
    const recent = history.slice(-SEED_MESSAGES).filter((turn) => turn.text.trim());
    if (recent.length === 0) return [];

    try {
      const translated = await Promise.all(
        recent.map((turn) => this.runtime.toModel.translate(turn.text)),
      );
      return recent.map((turn, index) => ({
        role: turn.role === "player" ? ("user" as const) : ("assistant" as const),
        content: translated[index],
      }));
    } catch {
      return [];
    }
  }

  async ask(input: TurnInput): Promise<TurnResult> {
    const session = await this.ensure(input.characterId, input.history);

    let englishInput: string;
    let canonicalContext: DialogueTurn[];
    try {
      englishInput = await this.runtime.toModel.translate(input.playerText);
      canonicalContext = await Promise.all(
        input.scriptedContext.map(async (message) => ({
          role: message.role,
          text: await this.runtime.toModel.translate(message.text),
        })),
      );
    } catch (error) {
      throw toAiError(error, "TRANSLATE_TO_MODEL_FAILED");
    }

    const turn = getLocaleChat(this.locale.meta.id).buildTurnPrompt({
      facts: input.facts,
      attachedEvidence: input.attachedEvidence,
      canonicalContext,
      translatedPlayerText: englishInput,
      sourceLanguageName: this.locale.meta.nativeName,
    });

    let english: string;
    try {
      english = await session.prompt(turn);
    } catch (error) {
      throw toAiError(error, "SESSION_FAILED");
    }

    let localized: string;
    try {
      localized = await this.runtime.fromModel.translate(english);
    } catch (error) {
      throw toAiError(error, "TRANSLATE_FROM_MODEL_FAILED");
    }

    return { lines: splitLines(localized), raw: english };
  }

  usage(characterId: CharacterId) {
    return this.sessions.get(characterId)?.usage() ?? {};
  }

  async reset(characterId: CharacterId) {
    const session = this.sessions.get(characterId);
    if (!session) return;
    await session.reset();
  }

  destroy(characterId?: CharacterId) {
    if (characterId) {
      this.sessions.get(characterId)?.destroy();
      this.sessions.delete(characterId);
      return;
    }
    this.sessions.forEach((session) => session.destroy());
    this.sessions.clear();
  }
}

/** Splits the response into short bubbles and discards formatting noise. */
export function splitLines(text: string): string[] {
  const cleaned = text
    .replace(/\r/g, "")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^\s*(?:[A-ZÁÂÃÉÊÍÓÔÕÚÇ][\w .'-]{0,24}):\s+/gm, "");

  const lines = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];
  if (lines.length <= MAX_LINES) return lines;

  // Merge overflow into the last bubble instead of discarding content.
  const head = lines.slice(0, MAX_LINES - 1);
  const tail = lines.slice(MAX_LINES - 1).join(" ");
  return [...head, tail];
}

export { AiError };
