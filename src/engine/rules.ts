/**
 * Regras determinísticas de progressão.
 *
 * Nada aqui depende da IA. O modelo de linguagem interpreta perguntas e
 * representa personagens; quem decide se uma pista foi encontrada, se uma
 * senha foi aceita, se um ato avançou ou se o jogo terminou é este arquivo.
 */

import { CLUES, CONTRADICTIONS, MEMORIES, appsForAct } from "../content/manifest";
import type { ActNumber, AppId, EventId, GameState, MemoryId } from "./types";

/** Espera antes de liberar os fallbacks anti-bloqueio (8 minutos). */
export const FALLBACK_DELAY_MS = 8 * 60 * 1000;

export const EVENTS = {
  /** Fim do Ato 1: o jogador percebeu que o telefone foi usado após a morte. */
  ACT2: "EVENT_005",
  /** Fim do Ato 2: o crime de junho foi estabelecido. */
  ACT3: "EVENT_011",
  /** Entrada do contato anônimo. */
  UNKNOWN: "EVENT_012",
  /** Fim do Ato 3: a gravação foi aberta. */
  ACT4: "EVENT_018",
  /** O namorado entrega o histórico de corridas. */
  ALIBI: "EVENT_016",
  /** O jogador plantou informação exclusiva no canal anônimo. */
  TRAP: "EVENT_024",
  /** Confronto com a gravação. */
  COLLAPSE: "EVENT_027",
  /** Acusação aceita. */
  ACCUSED: "EVENT_030",
  /** Áudio enviado ao irmão da vítima. */
  AUDIO_SENT: "EVENT_033",
} as const;

/* ------------------------------------------------------------------ */
/* Deduções                                                            */
/* ------------------------------------------------------------------ */

function memoryUnlocked(state: GameState, id: MemoryId) {
  const memory = MEMORIES.find((item) => item.id === id);
  if (!memory) return false;

  const seen = new Set([...state.cluesExamined, ...state.cluesFound]);

  if (memory.requiresAllOf?.some((clue) => !seen.has(clue))) {
    return false;
  }
  if (memory.requiresAnyOf) {
    const hits = memory.requiresAnyOf.filter((clue) => seen.has(clue)).length;
    if (hits < (memory.requiresCount ?? 1)) return false;
  }
  return true;
}

export function deriveMemories(state: GameState): MemoryId[] {
  return MEMORIES.filter((memory) => memoryUnlocked(state, memory.id)).map((memory) => memory.id);
}

export function deriveContradictions(state: GameState) {
  const seen = new Set(state.cluesExamined);
  return CONTRADICTIONS.filter(({ pair }) => seen.has(pair[0]) && seen.has(pair[1]));
}

/* ------------------------------------------------------------------ */
/* Transição de atos                                                   */
/* ------------------------------------------------------------------ */

/**
 * Cada ato tem mais de uma porta de entrada, exatamente como previsto no
 * documento narrativo: nenhuma progressão depende de uma única pista.
 */
export function nextAct(state: GameState): ActNumber | undefined {
  const memories = new Set(deriveMemories(state));

  if (state.act === 1 && memories.has("MEMORY_001")) {
    return 2;
  }
  if (state.act === 2 && memories.has("MEMORY_002")) {
    return 3;
  }
  if (state.act === 3 && state.cluesFound.includes("CLUE_010")) {
    return 4;
  }
  return undefined;
}

export function appsUnlockedForAct(act: ActNumber): AppId[] {
  return appsForAct(act).map((app) => app.id);
}

/* ------------------------------------------------------------------ */
/* Entrada do contato anônimo                                          */
/* ------------------------------------------------------------------ */

const CRIME_CLUES = ["CLUE_011", "CLUE_012", "CLUE_013", "CLUE_014", "CLUE_054", "CLUE_024"];

/** Intenções que, ditas a qualquer personagem, chegam ao contato anônimo. */
const LEAK_INTENTS = ["INT_005", "INT_006", "INT_007", "INT_008"];

export type UnknownGate = {
  ready: boolean;
  /** Variante da primeira mensagem. */
  variant: "informado" | "fallback";
};

export function evaluateUnknownGate(state: GameState, nowMs: number): UnknownGate {
  if (state.unknownEntered) return { ready: false, variant: "informado" };
  if (state.act < 3) return { ready: false, variant: "informado" };

  const found = CRIME_CLUES.filter((clue) => state.cluesFound.includes(clue)).length;
  if (found < 2) return { ready: false, variant: "informado" };

  const mentioned = Object.values(state.chats).some((chat) =>
    chat.intents.some((intent) => LEAK_INTENTS.includes(intent)),
  );
  if (mentioned) return { ready: true, variant: "informado" };

  const waited = nowMs - state.actEnteredAt >= FALLBACK_DELAY_MS;
  return { ready: waited, variant: "fallback" };
}

export function canAccuse(state: GameState) {
  return state.act >= 4;
}

/* ------------------------------------------------------------------ */
/* Disponibilidade de conteúdo                                         */
/* ------------------------------------------------------------------ */

export function clueIsReachable(state: GameState, clueId: string) {
  const clue = CLUES.find((item) => item.id === clueId);
  if (!clue) return false;
  return state.unlockedApps.includes(clue.app);
}

export function hasEvent(state: GameState, eventId: EventId) {
  return state.eventsFired.includes(eventId);
}
