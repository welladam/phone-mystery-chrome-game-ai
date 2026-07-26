/**
 * Experimental API normalization.
 *
 * The current specification returns "available" | "downloadable" | "downloading" |
 * "unavailable". Some Chrome documentation and older versions still use
 * "readily" | "after-download" | "no". Both sets are handled here so the
 * rest of the game never needs to know about the difference.
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
 * Timeout guard for availability checks.
 *
 * We have observed environments where `availability()` exists, does not throw,
 * and never resolves. Without this guard, the player would stare at a running
 * step forever—exactly what the startup flow promises to prevent.
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

/** Chrome desktop is currently the only target supported by both APIs. */
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
    /** Translator API requires 138+; the Prompt API for websites requires Chrome 148+. */
    tooOld: typeof version === "number" && version < 138,
  };
}

export type DownloadProgressSample = {
  /** Progress normalized from 0 to 1. */
  progress?: number;
  /** Defensive compatibility with implementations that expose bytes. */
  loadedBytes?: number;
  totalBytes?: number;
};

/**
 * Reads progress without treating the standard fraction as a byte count.
 *
 * The current contract uses `loaded` between 0 and 1 and `total === 1`, so it
 * cannot be used to calculate MB or MB/s. Real counters are still accepted in
 * case an implementation provides them in the future.
 */
export function readDownloadProgress(event: AiDownloadProgressEvent): DownloadProgressSample {
  const loaded = event.loaded;
  const total = event.total;
  if (typeof loaded !== "number" || !Number.isFinite(loaded)) return {};

  if (typeof total === "number" && Number.isFinite(total) && total > 1) {
    const safeLoaded = Math.max(0, loaded);
    return {
      progress: Math.min(1, safeLoaded / total),
      loadedBytes: safeLoaded,
      totalBytes: total,
    };
  }

  return { progress: Math.min(1, Math.max(0, loaded)) };
}
