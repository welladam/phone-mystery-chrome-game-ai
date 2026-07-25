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
    "chat.historyDivider": "End of history · new messages",
    "boot.actionRequired": "Your action is required",
    "boot.attentionRequired": "Setup needs your attention",
    "boot.phoneWaitsForInstall": "The phone will turn on only after this step is complete.",
    "boot.startingInstall": "Starting installation…",
    "boot.acceptDownload": "Accept and start download",
    "boot.acceptContinue": "Accept and continue",
    "boot.acceptingDownload": "Authorizing download…",
    "boot.tryAgain": "Try again",
    "boot.retrying": "Trying again…",
  },
  bootHowItems: [
    "The investigation runs entirely in your browser. No data leaves the device.",
    "You talk to the three people closest to Clara through an AI that runs on your own machine.",
    "Write in your own language: translation happens locally, no external service or API key.",
    "Search the apps, crack the passwords and write the final accusation.",
  ],
  bootAtmosphere: [
    "Her phone is still on.",
    "Someone kept typing after she died.",
    "\"Monday I'll tell you everything.\" She never reached Monday.",
    "Everything you need is inside the device.",
  ],
} satisfies LocaleBundle;
