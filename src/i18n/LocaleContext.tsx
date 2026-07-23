import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { getLocale } from "../locales/registry";
import type { LocaleBundle, LocaleId, MessageValues } from "../locales/types";
import type { ptBR } from "../locales/pt-BR";

export type LocaleMessageKey = keyof typeof ptBR.messages;

type LocaleContextValue = {
  locale: LocaleBundle;
  localeId: LocaleId;
  t: (key: LocaleMessageKey, values?: MessageValues) => string;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

function interpolate(template: string, values?: MessageValues) {
  if (!values) return template;
  return template.replace(/\{([\w.-]+)\}/g, (token, key: string) => {
    const value = values[key];
    return value === undefined || value === null ? token : String(value);
  });
}

export function LocaleProvider({ localeId, children }: { localeId: LocaleId; children: ReactNode }) {
  const locale = getLocale(localeId);
  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    localeId,
    t(key, values) {
      const fallback = getLocale("pt-BR").messages[key] ?? key;
      return interpolate(locale.messages[key] ?? fallback, values);
    },
  }), [locale, localeId]);

  useEffect(() => {
    document.documentElement.lang = locale.meta.htmlLang;
    document.title = locale.meta.title;
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}
