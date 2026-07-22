/**
 * Preferências pequenas. Só isto vai para localStorage — nada de progresso,
 * nada de conteúdo narrativo.
 */

import type { Preferences } from "../engine/types";

const KEY = "clara.prefs.v1";

const DEFAULTS: Preferences = { reducedMotion: false, largeText: false };

export function loadPrefs(): Preferences {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      reducedMotion: parsed.reducedMotion === true,
      largeText: parsed.largeText === true,
      lastApp: typeof parsed.lastApp === "string" ? (parsed.lastApp as Preferences["lastApp"]) : undefined,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function savePrefs(prefs: Preferences) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // Navegação privada ou armazenamento bloqueado: as preferências valem só
    // para esta sessão. Não é motivo para interromper o jogo.
  }
}

export function systemPrefersReducedMotion() {
  if (typeof matchMedia !== "function") return false;
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}
