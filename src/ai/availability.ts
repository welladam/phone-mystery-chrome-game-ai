/**
 * Normalização das APIs experimentais.
 *
 * A especificação atual devolve "available" | "downloadable" | "downloading" |
 * "unavailable". Parte da documentação do Chrome e versões anteriores ainda
 * usam "readily" | "after-download" | "no". Tratamos os dois conjuntos aqui,
 * num lugar só, para que o resto do jogo nunca precise saber disso.
 */

export type Availability = "available" | "downloadable" | "downloading" | "unavailable";

export function normalizeAvailability(raw: unknown): Availability {
  switch (raw) {
    case "available":
    case "readily":
      return "available";
    case "downloadable":
    case "after-download":
      return "downloadable";
    case "downloading":
      return "downloading";
    case "unavailable":
    case "no":
      return "unavailable";
    default:
      return "unavailable";
  }
}

/**
 * Guarda de tempo para as consultas de disponibilidade.
 *
 * Já observamos ambientes em que `availability()` existe, não lança e nunca
 * resolve. Sem esta guarda o jogador ficaria olhando uma etapa em andamento
 * para sempre — exatamente o que a inicialização promete não fazer.
 */
export const CHECK_TIMEOUT_MS = 12_000;

export const TIMED_OUT = Symbol("availability-timeout");

export async function withTimeout<T>(
  work: Promise<T>,
  timeoutMs = CHECK_TIMEOUT_MS,
): Promise<T | typeof TIMED_OUT> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const guard = new Promise<typeof TIMED_OUT>((resolve) => {
    timer = setTimeout(() => resolve(TIMED_OUT), timeoutMs);
  });
  try {
    return await Promise.race([work, guard]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function hasLanguageModel(): boolean {
  return typeof self !== "undefined" && "LanguageModel" in self && Boolean(self.LanguageModel);
}

export function hasTranslator(): boolean {
  return typeof self !== "undefined" && "Translator" in self && Boolean(self.Translator);
}

export function isSecure(): boolean {
  return typeof window !== "undefined" && window.isSecureContext === true;
}

/** Chrome desktop é o único destino suportado hoje pelas duas APIs. */
export function inspectBrowser() {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const chromeMatch = /Chrom(?:e|ium)\/(\d+)/.exec(ua);
  const version = chromeMatch ? Number(chromeMatch[1]) : undefined;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
  const isEdge = /Edg\//.test(ua);
  const isChrome = Boolean(chromeMatch) && !/OPR\//.test(ua);

  return {
    ua,
    version,
    isChrome,
    isEdge,
    isMobile,
    /** Translator API pede 138+; o Prompt API para sites pede Chrome 148+. */
    tooOld: typeof version === "number" && version < 138,
  };
}

/** Lê o progresso do evento sabendo que ele é normalizado de 0 a 1. */
export function readProgress(event: AiDownloadProgressEvent): number | undefined {
  const loaded = event.loaded;
  if (typeof loaded !== "number" || Number.isNaN(loaded)) return undefined;
  if (loaded < 0) return 0;
  if (loaded > 1) {
    // Alguma implementação pode reportar bytes; usamos total quando existir.
    const total = event.total;
    if (typeof total === "number" && total > 0) return Math.min(1, loaded / total);
    return undefined;
  }
  return loaded;
}
