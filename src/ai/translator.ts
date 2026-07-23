/**
 * Adaptador da Translator API.
 *
 * Duas preocupações que não são triviais e que o jogo depende:
 *
 * 1. GLOSSÁRIO PROTEGIDO. "Cacau" é uma pista — é o apelido que denuncia
 *    quem está do outro lado do número anônimo. Traduzido, viraria "cocoa" e
 *    a pista morreria. Nomes próprios, apelidos e marcas fictícias são
 *    trocados por sentinelas antes da tradução e restaurados depois, nos dois
 *    sentidos.
 *
 * 2. FORMA DA MENSAGEM. Os personagens escrevem fragmentado, com emoji e
 *    quebras de linha. Traduzir o bloco inteiro achata isso. Traduzimos linha
 *    a linha, preservando linhas vazias, e devolvemos emoji e pontuação de
 *    borda no lugar.
 */

import { AiError, toAiError } from "./errors";
import {
  TIMED_OUT,
  normalizeAvailability,
  readProgress,
  withTimeout,
  type Availability,
} from "./availability";

/** Termos que nunca podem ser traduzidos. */
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
  "Barão do Cristal",
  "Barao do Cristal",
  "Poço Fundo",
  "Poco Fundo",
  "Bar Nau",
  "Vínculo",
  "Vinculo",
  "Nimbo",
  "Vello",
  "Fluxo",
  "Órbita",
  "Orbita",
  "Pulso",
  "Banco Aurora",
  "Zé do Bloco",
  "Ze do Bloco",
  "Juiz de Fora",
  "OAB",
  "Pix",
];

/** Sentinelas que sobrevivem à tradução por não parecerem palavras. */
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

/** Separa emoji e pontuação de borda para que não sejam reescritos. */
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
  // Só considera se realmente houver algo fora do padrão ASCII.
  if (!/[^\x00-\x7F]/.test(emoji)) return { body: core, emoji: "" };
  return { body: core.slice(0, core.length - emoji.length), emoji };
}

export type TranslatorPair = {
  translate(text: string): Promise<string>;
  destroy(): void;
};

export type TranslatorDirection = "pt-en" | "en-pt";

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
  direction: TranslatorDirection,
): Promise<Availability | "timeout"> {
  if (!self.Translator) return "unavailable";
  const [sourceLanguage, targetLanguage] = direction === "pt-en" ? ["pt", "en"] : ["en", "pt"];
  try {
    const raw = await withTimeout(self.Translator.availability({ sourceLanguage, targetLanguage }));
    if (raw === TIMED_OUT) return "timeout";
    return normalizeAvailability(raw);
  } catch {
    return "unavailable";
  }
}

export async function createTranslator(
  direction: TranslatorDirection,
  onProgress?: (value: number | undefined) => void,
): Promise<TranslatorPair> {
  if (!self.Translator) {
    throw new AiError("TRANSLATOR_API_ABSENT");
  }

  const [sourceLanguage, targetLanguage] = direction === "pt-en" ? ["pt", "en"] : ["en", "pt"];
  const failCode = direction === "pt-en" ? "TRANSLATE_PT_EN_FAILED" : "TRANSLATE_EN_PT_FAILED";

  const build = async (): Promise<TranslatorInstance> => {
    try {
      return await self.Translator!.create({
        sourceLanguage,
        targetLanguage,
        monitor(monitor) {
          monitor.addEventListener("downloadprogress", (event) => {
            onProgress?.(readProgress(event));
          });
        },
      });
    } catch (error) {
      throw toAiError(error, failCode);
    }
  };

  let instance = await build();

  /**
   * Uma única tentativa de tradução, sem recriação. `withTimeout` não cancela
   * a chamada real — ela continua rodando no navegador mesmo depois que o JS
   * para de esperar. Isso é aceitável: o resultado tardio é só descartado.
   */
  async function attempt(text: string): Promise<string> {
    const raced = await withTimeout(instance.translate(text), 20_000);
    if (raced === TIMED_OUT) throw new AiError(failCode, "translate-timeout");
    return raced;
  }

  async function translateLine(line: string): Promise<string> {
    if (!line.trim()) return line;

    const cacheKey = `${direction}:${line}`;
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
      // A tradução pode falhar porque o motor on-device foi reciclado pelo
      // navegador no meio do turno (já observado: AbortError espontâneo,
      // sem relação com o nosso próprio teto de tempo). Uma única
      // recriação + nova tentativa resolve isso sem perder a conversa —
      // o mesmo tratamento que a sessão de conversa já recebe.
      try {
        instance.destroy?.();
      } catch {
        /* já encerrada */
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
        // Destruir uma sessão já encerrada não é um problema do jogador.
      }
    },
  };
}
