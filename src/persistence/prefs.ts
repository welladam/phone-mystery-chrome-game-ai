/**
 * Small preferences. Only these go to localStorage—no progress and no
 * narrative content.
 */

import type { Preferences } from "../engine/types";
import { DEFAULT_LOCALE, isPlayableLocale } from "../locales/registry";

const KEY = "clara.prefs.v1";

const DEFAULTS: Preferences = {
  reducedMotion: false,
  largeText: false,
  sound: true,
  locale: DEFAULT_LOCALE,
  localeChosen: false,
};

export function loadPrefs(): Preferences {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    const locale = isPlayableLocale(parsed.locale) ? parsed.locale : DEFAULT_LOCALE;
    return {
      reducedMotion: parsed.reducedMotion === true,
      largeText: parsed.largeText === true,
      // Sound is enabled by default and disabled only when the player chooses it.
      sound: parsed.sound !== false,
      locale,
      localeChosen: parsed.localeChosen === true && isPlayableLocale(parsed.locale),
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
    // In private browsing or with blocked storage, preferences apply only to
    // this session. That is not a reason to interrupt the game.
  }
}

export function systemPrefersReducedMotion() {
  if (typeof matchMedia !== "function") return false;
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}
