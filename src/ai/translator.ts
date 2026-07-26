/**
 * Translator API adapter.
 *
 * Two non-trivial concerns the game depends on:
 *
 * 1. PROTECTED GLOSSARY. "Cacau" is a clue—the nickname that reveals who is
 *    behind the anonymous number. Translation would turn it into "cocoa" and
 *    destroy the clue. Proper names, nicknames, and fictional brands are
 *    replaced with sentinels before translation and restored afterward in
 *    both directions.
 *
 * 2. MESSAGE SHAPE. Characters write in fragments, with emoji and line breaks.
 *    Translating the entire block flattens that style. Each line is translated
 *    separately, preserving blank lines and restoring edge emoji and punctuation.
 */

import { AiError, toAiError } from "./errors";
import {
  TIMED_OUT,
  normalizeAvailability,
  readDownloadProgress,
  withTimeout,
  type Availability,
  type DownloadProgressSample,
} from "./availability";

/** Terms that must never be translated. */
const GLOSSARY = [
  "Cacau",
  "Lice",
  "Clara",
  "Alice",
  "Théo",
  "Theo",
  "Regina",
  "Wesley",
  "Diego",
  "Marlene",
  "Yara",
  "Fumaça",
  "Fumaca",
  "Pedra Lascada",
  "Santa Clarice",
  "Bom Pastor",
  "Clínica Médica",
  "Clinica Medica",
  "Barão do Cristal",
  "Barao do Cristal",
  "Poço Fundo",
  "Poco Fundo",
  "Bar Nau",
  "Chat",
  "E-mail",
  "Drive",
  "Rede Social",
  "Autenticador",
  "Nimbo",
  "Banco",
  "Zé do Bloco",
  "Ze do Bloco",
  "Juiz de Fora",
  "OAB",
  "Pix",
];

/** Sentinels that survive translation because they do not look like words. */
function token(index: number) {
  return `zqx${index}qzx`;
}

type Shield = { text: string; restore: (translated: string) => string };

function shield(input: string): Shield {
  const used: string[] = [];
  let output = input;

  GLOSSARY.forEach((term) => {
    const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    if (!pattern.test(output)) return;
    pattern.lastIndex = 0;
    const index = used.length;
    let firstMatch = term;
    output = output.replace(pattern, (match) => {
      firstMatch = match;
      return token(index);
    });
    used.push(firstMatch);
  });

  return {
    text: output,
    restore(translated: string) {
      let result = translated;
      used.forEach((original, index) => {
        const pattern = new RegExp(token(index), "gi");
        result = result.replace(pattern, original);
      });
      return result;
    },
  };
}

/** Separates edge emoji and punctuation so they are not rewritten. */
const EDGE = new RegExp(
  "^([\\s]*)([\\s\\S]*?)([\\s]*)$",
);

function splitEdges(line: string) {
  const match = EDGE.exec(line);
  if (!match) return { lead: "", core: line, tail: "" };
  return { lead: match[1] ?? "", core: match[2] ?? "", tail: match[3] ?? "" };
}

const EMOJI_TAIL = new RegExp("([\\u2190-\\u2BFF\\uD800-\\uDFFF\\uFE0F\\u200D\\s]+)$", "u");

function pullEmoji(core: string) {
  const match = EMOJI_TAIL.exec(core);
  if (!match) return { body: core, emoji: "" };
  const emoji = match[1] ?? "";
  // Only treat it as an edge when something falls outside the ASCII range.
  if (!/[^\x00-\x7F]/.test(emoji)) return { body: core, emoji: "" };
  return { body: core.slice(0, core.length - emoji.length), emoji };
}

export type TranslatorPair = {
  translate(text: string): Promise<string>;
  destroy(): void;
};

export type TranslatorSpec = {
  sourceLanguage: string;
  targetLanguage: string;
  failCode: "TRANSLATE_TO_MODEL_FAILED" | "TRANSLATE_FROM_MODEL_FAILED";
};

export function createIdentityTranslator(): TranslatorPair {
  return {
    async translate(text: string) {
      return text;
    },
    destroy() {},
  };
}

const cache = new Map<string, string>();
const CACHE_LIMIT = 300;

function remember(key: string, value: string) {
  if (cache.size >= CACHE_LIMIT) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  cache.set(key, value);
}

export async function translatorAvailability(
  sourceLanguage: string,
  targetLanguage: string,
): Promise<Availability | "timeout"> {
  if (sourceLanguage === targetLanguage) return "available";
  if (!self.Translator) return "unavailable";
  try {
    const raw = await withTimeout(self.Translator.availability({ sourceLanguage, targetLanguage }));
    if (raw === TIMED_OUT) return "timeout";
    return normalizeAvailability(raw);
  } catch {
    return "unavailable";
  }
}

export async function createTranslator(
  spec: TranslatorSpec,
  onProgress?: (sample: DownloadProgressSample) => void,
): Promise<TranslatorPair> {
  const { sourceLanguage, targetLanguage, failCode } = spec;
  if (sourceLanguage === targetLanguage) return createIdentityTranslator();
  if (!self.Translator) {
    throw new AiError("TRANSLATOR_API_ABSENT");
  }

  const build = async (): Promise<TranslatorInstance> => {
    try {
      return await self.Translator!.create({
        sourceLanguage,
        targetLanguage,
        monitor(monitor) {
          monitor.addEventListener("downloadprogress", (event) => {
            onProgress?.(readDownloadProgress(event));
          });
        },
      });
    } catch (error) {
      throw toAiError(error, failCode);
    }
  };

  let instance = await build();

  /**
   * A single translation attempt without recreation. `withTimeout` does not
   * cancel the actual call—it keeps running in the browser after JavaScript
   * stops waiting. This is acceptable because the late result is discarded.
   */
  async function attempt(text: string): Promise<string> {
    const raced = await withTimeout(instance.translate(text), 20_000);
    if (raced === TIMED_OUT) throw new AiError(failCode, "translate-timeout");
    return raced;
  }

  async function translateLine(line: string): Promise<string> {
    if (!line.trim()) return line;

    const cacheKey = `${sourceLanguage}-${targetLanguage}:${line}`;
    const cached = cache.get(cacheKey);
    if (cached !== undefined) return cached;

    const { lead, core, tail } = splitEdges(line);
    const { body, emoji } = pullEmoji(core);
    if (!body.trim()) return line;

    const guarded = shield(body);
    let translated: string;
    try {
      translated = await attempt(guarded.text);
    } catch (error) {
      // Translation can fail when the browser recycles the on-device engine
      // mid-turn (observed as a spontaneous AbortError unrelated to our own
      // timeout). One recreation and retry resolves it without losing the
      // conversation, matching the handling used by the conversation session.
      try {
        instance.destroy?.();
      } catch {
        /* already closed */
      }
      try {
        instance = await build();
        translated = await attempt(guarded.text);
      } catch (retryError) {
        throw toAiError(retryError, failCode);
      }
    }

    const result = `${lead}${guarded.restore(translated).trim()}${emoji}${tail}`;
    remember(cacheKey, result);
    return result;
  }

  return {
    async translate(text: string) {
      if (!text.trim()) return text;
      const lines = text.split("\n");
      const out: string[] = [];
      for (const line of lines) {
        out.push(await translateLine(line));
      }
      return out.join("\n");
    },
    destroy() {
      try {
        instance.destroy?.();
      } catch {
        // Destroying an already closed session is not a player-facing problem.
      }
    },
  };
}
