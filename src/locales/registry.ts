import { enUSExample } from "./en-US.example";
import { ptBR } from "./pt-BR";
import type { LocaleBundle, LocaleId } from "./types";

export const DEFAULT_LOCALE: LocaleId = "pt-BR";

export const LOCALES: Record<LocaleId, LocaleBundle> = {
  "pt-BR": ptBR,
  "en-US": enUSExample,
};

export const LOCALE_LIST = Object.values(LOCALES);

export function isLocaleId(value: unknown): value is LocaleId {
  return typeof value === "string" && value in LOCALES;
}

export function isPlayableLocale(value: unknown): value is LocaleId {
  return isLocaleId(value) && LOCALES[value].meta.enabled;
}

export function getLocale(id: LocaleId) {
  return LOCALES[id] ?? LOCALES[DEFAULT_LOCALE];
}
