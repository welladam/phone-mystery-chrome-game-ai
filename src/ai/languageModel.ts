/**
 * Adaptador da Prompt API.
 *
 * Pontos que a documentação atual exige e que estão implementados aqui:
 * - `create()` precisa de ativação do usuário; a falta dela vira um erro
 *   específico com botão de continuar, não uma exceção crua.
 * - `signal` não é passado para `create()`, apenas para `prompt()`.
 * - `contextWindow`/`contextUsage` substituíram `inputQuota`/`inputUsage`, e o
 *   evento passou de `quotaoverflow` para `contextoverflow`. Lemos os dois.
 * - Estouro de contexto recria a sessão preservando as mensagens recentes.
 */

import {
  TIMED_OUT,
  normalizeAvailability,
  readProgress,
  withTimeout,
  type Availability,
} from "./availability";
import { AiError, toAiError } from "./errors";

const MODEL_OPTIONS: LanguageModelCreateOptions = {
  expectedInputs: [{ type: "text", languages: ["en"] }],
  expectedOutputs: [{ type: "text", languages: ["en"] }],
};

/**
 * Teto de tempo para uma resposta do modelo. Sem isto, uma chamada que nunca
 * resolve (já observado com estas APIs experimentais) deixa a conversa
 * travada para sempre, e o jogador não consegue mais falar com ninguém. Com o
 * teto, a chamada vira um erro recuperável e o jogador pode tentar de novo.
 * A primeira resposta pode ser lenta porque o modelo carrega na memória.
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
    // Encerra a chamada pendente para não vazar trabalho em segundo plano.
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
  /** Recria a sessão do zero, mantendo o mesmo prompt de sistema. */
  reset(): Promise<void>;
};

export async function createSession(
  systemPrompt: string,
  onProgress?: (value: number | undefined) => void,
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
            onProgress?.(readProgress(event));
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
      // Alias legado, ainda presente em versões mais antigas do Chrome.
      current.addEventListener("quotaoverflow", handler);
    } catch {
      // Sessão sem EventTarget completo: seguimos sem o aviso antecipado.
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
          // Recomeça a sessão e repete uma única vez. O estado do jogo vive
          // fora daqui, então nada de progresso se perde nesta operação.
          try {
            session.destroy?.();
          } catch {
            /* já encerrada */
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
        /* já encerrada */
      }
      session = await build();
      attachOverflow(session);
      overflowed = false;
    },
    destroy() {
      try {
        session.destroy?.();
      } catch {
        /* já encerrada */
      }
    },
  };
}
