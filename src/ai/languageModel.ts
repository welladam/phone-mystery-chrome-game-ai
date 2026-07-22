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
        const answer = await session.prompt(text, signal ? { signal } : undefined);
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
          return session.prompt(text, signal ? { signal } : undefined);
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
