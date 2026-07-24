import type { ReactNode } from "react";

export type LocaleId = "pt-BR" | "en-US";

export type LocaleDescriptor = {
  id: LocaleId;
  /** Nome apresentado no seletor, sempre escrito no próprio idioma. */
  nativeName: string;
  htmlLang: string;
  translatorLanguage: string;
  modelLanguage: "en";
  audioDirectory: string;
  enabled: boolean;
};

export type MessageValues = Record<string, ReactNode | string | number>;

export type LocaleBundle = {
  meta: LocaleDescriptor & {
    title: string;
    unavailableLabel?: string;
  };
  messages: Record<string, string>;
  /** Itens do checklist "como funciona" na tela de entrada. */
  bootHowItems: string[];
  /** Citações atmosféricas exibidas "digitando" durante o carregamento. */
  bootAtmosphere: string[];
  errors?: Record<string, {
    title: string;
    cause: string;
    action: string;
    retryable: boolean;
    keepsProgress: boolean;
  }>;
  /** Texto usado na verificação de ida até o idioma do modelo. */
  modelProbe: string;
};
