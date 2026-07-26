import type { ReactNode } from "react";

export type LocaleId = "pt-BR" | "en-US";

export type LocaleDescriptor = {
  id: LocaleId;
  /** Name shown in the selector, always written in its own language. */
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
  /** "How it works" checklist items on the entry screen. */
  bootHowItems: string[];
  /** Atmospheric quotes shown with a typing effect during loading. */
  bootAtmosphere: string[];
  errors?: Record<string, {
    title: string;
    cause: string;
    action: string;
    retryable: boolean;
    keepsProgress: boolean;
  }>;
  /** Text used to verify translation into the model language. */
  modelProbe: string;
};
