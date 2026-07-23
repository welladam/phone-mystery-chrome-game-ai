/** Avaliação mínima da acusação final, sem oferecer uma lista de suspeitos. */

import { normalizeText } from "./text";
import type { AccusationDraft } from "./types";

export type Verdict = {
  outcome: "aceita" | "rejeitada";
  feedbackId: "FB_ACEITA" | "FB_REJEITADA";
};

const ACCEPTED_NAMES = new Set([
  "alice",
  "lice",
  "alice bittencourt",
  "alice bittencourt fontoura",
]);

export function evaluate(draft: AccusationDraft): Verdict {
  const answer = normalizeText(draft.responsavel ?? "");
  return ACCEPTED_NAMES.has(answer)
    ? { outcome: "aceita", feedbackId: "FB_ACEITA" }
    : { outcome: "rejeitada", feedbackId: "FB_REJEITADA" };
}
