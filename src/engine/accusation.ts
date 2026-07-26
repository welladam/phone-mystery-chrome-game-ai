/** Minimal final-accusation evaluation without offering a suspect list. */

import { normalizeText } from "./text";
import type { AccusationDraft } from "./types";

export type Verdict = {
  outcome: "aceita" | "rejeitada";
  feedbackId: string;
};

const ACCEPTED_NAMES = new Set([
  "alice",
  "lice",
  "alice bittencourt",
  "alice bittencourt fontoura",
  "alice fontoura",
]);

/**
 * Every incorrect name the player might consider has a response written by
 * the lawyer in `act4.ts`. A wrong answer does not return a generic warning;
 * it returns the fact that disproves that specific theory.
 */
const NAMED_REJECTIONS: Array<{ feedbackId: string; names: string[] }> = [
  {
    feedbackId: "FB_MAE",
    names: [
      "regina",
      "dona regina",
      "mae",
      "a mae",
      "mae da clara",
      "regina mendonca",
      "regina aparecida",
      "regina aparecida mendonca",
    ],
  },
  {
    feedbackId: "FB_THEO",
    names: ["theo", "theo barcellos", "theo barcellos ramalho", "namorado", "o namorado"],
  },
  {
    feedbackId: "FB_IRMAO",
    names: ["diego", "diego andrade", "diego andrade da silva", "irmao", "o irmao", "irmao da vitima"],
  },
  {
    feedbackId: "FB_SUICIDIO",
    names: ["ninguem", "nenhum", "suicidio", "ela mesma", "clara", "a propria clara"],
  },
  {
    feedbackId: "FB_DESCONHECIDA",
    names: ["desconhecido", "desconhecida", "o desconhecido", "numero desconhecido"],
  },
];

export function evaluate(draft: AccusationDraft): Verdict {
  const answer = normalizeText(draft.responsavel ?? "");
  if (ACCEPTED_NAMES.has(answer)) {
    return { outcome: "aceita", feedbackId: "FB_ACEITA" };
  }
  const named = NAMED_REJECTIONS.find((entry) => entry.names.includes(answer));
  return { outcome: "rejeitada", feedbackId: named?.feedbackId ?? "FB_REJEITADA" };
}
