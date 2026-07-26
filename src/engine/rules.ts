/**
 * Deterministic progression rules.
 *
 * Nothing here depends on AI. The language model interprets questions and
 * portrays characters; this file decides whether a clue was found, a password
 * was accepted, an act advanced, or the game ended.
 */

import { CLUES, CONTRADICTIONS, MEMORIES, appsForAct } from "../content/manifest";
import type { ActNumber, AppId, EventId, GameState, MemoryId } from "./types";

/** Delay before anti-blocking fallbacks become available (8 minutes). */
export const FALLBACK_DELAY_MS = 8 * 60 * 1000;

export const EVENTS = {
  /** End of Act 1: the player realized the phone was used after the death. */
  ACT2: "EVENT_005",
  /** End of Act 2: the June crime was established. */
  ACT3: "EVENT_011",
  /** Anonymous contact entry. */
  UNKNOWN: "EVENT_012",
  /** End of Act 3: the recording was opened. */
  ACT4: "EVENT_018",
  /** The boyfriend provides the ride history. */
  ALIBI: "EVENT_016",
  /** The player planted exclusive information in the anonymous channel. */
  TRAP: "EVENT_024",
  /** Confrontation with the recording. */
  COLLAPSE: "EVENT_027",
  /** Accusation accepted. */
  ACCUSED: "EVENT_030",
  /** Audio sent to the victim's brother. */
  AUDIO_SENT: "EVENT_033",
} as const;

/* ------------------------------------------------------------------ */
/* Deductions                                                          */
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
/* Act transitions                                                     */
/* ------------------------------------------------------------------ */

/**
 * Each act has more than one entry point, exactly as required by the narrative
 * document: no progression depends on a single clue.
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
/* Anonymous contact entry                                             */
/* ------------------------------------------------------------------ */

const CRIME_CLUES = ["CLUE_011", "CLUE_012", "CLUE_013", "CLUE_014", "CLUE_054", "CLUE_024"];

/** Intents that reach the anonymous contact when said to any character. */
const LEAK_INTENTS = ["INT_005", "INT_006", "INT_007", "INT_008"];

export type UnknownGate = {
  ready: boolean;
  /** First-message variant. */
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
/* Content availability                                                */
/* ------------------------------------------------------------------ */

export function clueIsReachable(state: GameState, clueId: string) {
  const clue = CLUES.find((item) => item.id === clueId);
  if (!clue) return false;
  return state.unlockedApps.includes(clue.app);
}

export function hasEvent(state: GameState, eventId: EventId) {
  return state.eventsFired.includes(eventId);
}
