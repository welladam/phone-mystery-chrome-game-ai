import type { LocaleBundle } from "./types";

/**
 * Exemplo deliberadamente incompleto. Ele documenta o contrato de um locale,
 * mas permanece bloqueado até receber toda a narrativa e todos os áudios.
 */
export const enUSExample = {
  meta: {
    id: "en-US",
    nativeName: "English (United States)",
    htmlLang: "en-US",
    translatorLanguage: "en",
    modelLanguage: "en",
    audioDirectory: "en-US",
    enabled: false,
    title: "The Clara Mystery",
    unavailableLabel: "In preparation",
  },
  modelProbe: "Reply with only the word ready.",
  messages: {
    "language.eyebrow": "INVESTIGATION LANGUAGE",
    "language.title": "How do you want to open the case?",
    "language.description": "The language controls text, AI conversations, audio and saved progress.",
    "language.continue": "Continue in {language}",
    "language.unavailable": "In preparation",
    "language.savedSeparately": "Each language keeps a separate investigation in this browser.",
    "common.close": "Close",
    "common.cancel": "Cancel",
    "common.unavailable": "Unavailable",
  },
} satisfies LocaleBundle;

