/**
 * Avaliação da acusação final.
 *
 * O gabarito vive no pacote do Ato 4 e é passado como parâmetro: assim ele não
 * entra no bundle inicial. Este arquivo contém apenas a lógica de julgamento.
 */

import { evidenceCoverage } from "./selectors";
import type { AccusationDraft, GameState } from "./types";

export type AccusationPack = {
  ACCUSATION_FIELDS: Array<{ id: string; correct: string }>;
  DESCONHECIDA_FIELD: { correct: string };
  SEQUENCE_CORRECT: string[];
};

export type Verdict = {
  outcome: "aceita" | "parcial" | "rejeitada";
  feedbackId: string;
  /** Campos que precisam ser revistos, para destaque na interface. */
  problems: string[];
  /** Pista que a interface deve destacar no caderno. */
  highlight?: string;
};

const WRONG_TARGET_FEEDBACK: Record<string, { id: string; highlight?: string }> = {
  R_NAMORADO: { id: "FB_THEO", highlight: "CLUE_041" },
  R_MAE: { id: "FB_MAE" },
  R_IRMAO: { id: "FB_IRMAO", highlight: "CLUE_036" },
  R_NINGUEM: { id: "FB_SUICIDIO", highlight: "CLUE_005" },
};

export function evaluate(
  pack: AccusationPack,
  draft: AccusationDraft,
  state: GameState,
): Verdict {
  const answers: Record<string, string | undefined> = {
    responsavel: draft.responsavel,
    motivo: draft.motivo,
    metodo: draft.metodo,
    oportunidade: draft.oportunidade,
    contradicao: draft.contradicao,
  };

  const correctById = new Map(pack.ACCUSATION_FIELDS.map((field) => [field.id, field.correct]));

  // 1. Alvo errado tem feedback próprio, específico e dirigido.
  const target = draft.responsavel;
  if (!target) {
    return { outcome: "parcial", feedbackId: "FB_PARCIAL", problems: ["responsavel"] };
  }
  if (target !== correctById.get("responsavel")) {
    const feedback = WRONG_TARGET_FEEDBACK[target] ?? { id: "FB_PARCIAL" };
    return {
      outcome: "rejeitada",
      feedbackId: feedback.id,
      problems: ["responsavel"],
      highlight: feedback.highlight,
    };
  }

  const problems: string[] = [];

  // 2. Campos de múltipla escolha.
  (["motivo", "metodo", "oportunidade"] as const).forEach((field) => {
    if (answers[field] !== correctById.get(field)) problems.push(field);
  });

  // 3. Contradição: as quatro explicações oferecidas são verdadeiras, mas é
  //    preciso escolher alguma.
  if (!draft.contradicao) problems.push("contradicao");

  // 4. Sequência dos acontecimentos.
  const sequenceOk =
    draft.sequencia.length === pack.SEQUENCE_CORRECT.length &&
    draft.sequencia.every((item, index) => item === pack.SEQUENCE_CORRECT[index]);
  if (!sequenceOk) problems.push("sequencia");

  // 5. Evidências: mínimo de três, cobrindo os três blocos probatórios.
  const coverage = evidenceCoverage(draft.evidencias);
  const enoughEvidence = draft.evidencias.length >= 3 && coverage.complete;
  if (!enoughEvidence) problems.push("evidencias");

  // 6. Papel do contato anônimo.
  const unknownOk = draft.desconhecida === pack.DESCONHECIDA_FIELD.correct;
  if (!unknownOk) problems.push("desconhecida");

  if (problems.length === 0) {
    return { outcome: "aceita", feedbackId: "FB_ACEITA", problems: [] };
  }

  // Prova insuficiente tem retorno próprio, porque é o erro mais instrutivo.
  if (problems.length === 1 && problems[0] === "evidencias") {
    return { outcome: "parcial", feedbackId: "FB_PROVA_FRACA", problems };
  }
  if (problems.length === 1 && problems[0] === "desconhecida") {
    return {
      outcome: "parcial",
      feedbackId: "FB_DESCONHECIDA",
      problems,
      highlight: "CLUE_028",
    };
  }

  return { outcome: "parcial", feedbackId: "FB_PARCIAL", problems };
}

/** Resumo legível dos blocos ainda descobertos, para a interface. */
export function missingBlocks(clueIds: string[]) {
  const { blocks } = evidenceCoverage(clueIds);
  const names: Record<string, string> = {
    A: "que alguém esteve no mirante",
    B: "que ela já estava morta quando o telefone foi usado",
    C: "por que alguém faria isso",
  };
  return (["A", "B", "C"] as const).filter((block) => !blocks.includes(block)).map((block) => names[block]);
}
