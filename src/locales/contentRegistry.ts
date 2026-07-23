import { ptBRContent, type PtBRContent } from "./pt-BR/core";
import type { LocaleId } from "./types";

const CONTENT: Partial<Record<LocaleId, PtBRContent>> = {
  "pt-BR": ptBRContent,
};

export function getLocaleContent(locale: LocaleId): PtBRContent {
  const content = CONTENT[locale];
  if (!content) throw new Error(`Conteúdo indisponível para o locale ${locale}`);
  return content;
}

