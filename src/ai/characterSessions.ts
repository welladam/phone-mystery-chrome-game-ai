/**
 * Sessões de personagem.
 *
 * Cada personagem tem uma sessão própria do Prompt API, criada só quando o
 * jogador abre aquela conversa. As sessões nunca se cruzam:
 *
 * - prompt de sistema próprio;
 * - histórico próprio, mantido pela própria sessão;
 * - fatos permitidos calculados pelo motor e injetados um a um.
 *
 * Nada que o personagem ainda não possa dizer é enviado para cá. Um fato
 * bloqueado simplesmente não existe do ponto de vista da sessão.
 */

import type { CharacterId } from "../engine/types";
import type { LocaleBundle } from "../locales/types";
import { getLocaleChat } from "../locales/chatRegistry";
import type { BootRuntime } from "./bootstrap";
import { AiError, toAiError } from "./errors";
import { createSession, type ModelSession } from "./languageModel";

export type TurnInput = {
  characterId: CharacterId;
  /** Mensagem do jogador, em português. */
  playerText: string;
  /** Fatos liberados pelo motor, já em inglês. */
  facts: string[];
  /** Pista anexada pelo jogador, descrita em inglês de forma neutra. */
  attachedEvidence?: string;
  act: number;
};

export type TurnResult = {
  /** Linhas em português, prontas para virar balões. */
  lines: string[];
  raw: string;
};

const MAX_LINES = 4;

export class CharacterSessions {
  private sessions = new Map<CharacterId, ModelSession>();
  private creating = new Map<CharacterId, Promise<ModelSession>>();

  constructor(private runtime: BootRuntime, private locale: LocaleBundle) {}

  /** Abre a sessão sob demanda. Chamado a partir de um clique do jogador. */
  async ensure(characterId: CharacterId): Promise<ModelSession> {
    const existing = this.sessions.get(characterId);
    if (existing) return existing;

    const pending = this.creating.get(characterId);
    if (pending) return pending;

    const profile = getLocaleChat(this.locale.meta.id).getCharacter(characterId);
    const job = createSession(profile.systemPrompt)
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

  async ask(input: TurnInput): Promise<TurnResult> {
    const session = await this.ensure(input.characterId);

    let englishInput: string;
    try {
      englishInput = await this.runtime.toModel.translate(input.playerText);
    } catch (error) {
      throw toAiError(error, "TRANSLATE_TO_MODEL_FAILED");
    }

    const turn = getLocaleChat(this.locale.meta.id).buildTurnPrompt({
      facts: input.facts,
      attachedEvidence: input.attachedEvidence,
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

/** Quebra a resposta em balões curtos e descarta ruído de formatação. */
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

  // Junta o excedente na última bolha em vez de descartar conteúdo.
  const head = lines.slice(0, MAX_LINES - 1);
  const tail = lines.slice(MAX_LINES - 1).join(" ");
  return [...head, tail];
}

export { AiError };
