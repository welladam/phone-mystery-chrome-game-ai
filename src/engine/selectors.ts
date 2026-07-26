import { APPS, CLUES, MEMORIES, getClue, getLock } from "../content/manifest";
import { deriveContradictions } from "./rules";
import type { AppId, CharacterId, GameState, LockId } from "./types";

export function visibleApps(state: GameState) {
  return APPS.filter((app) => state.unlockedApps.includes(app.id));
}

export function appIsLocked(state: GameState, appId: AppId) {
  const app = APPS.find((item) => item.id === appId);
  if (!app?.lock) return false;
  return !state.solvedLocks.includes(app.lock);
}

export function lockSolved(state: GameState, lockId: LockId) {
  return state.solvedLocks.includes(lockId);
}

export function lockNeedsHint(state: GameState, lockId: LockId) {
  return (state.lockAttempts[lockId] ?? 0) >= 6;
}

export function foundClues(state: GameState) {
  return CLUES.filter((clue) => state.cluesFound.includes(clue.id));
}

export function clueCount(state: GameState) {
  return { found: state.cluesFound.length, total: CLUES.length };
}

export function knownMemories(state: GameState) {
  return MEMORIES.filter((memory) => state.memories.includes(memory.id));
}

export function contradictions(state: GameState) {
  return deriveContradictions(state);
}

export function presentableClues(state: GameState, characterId: CharacterId) {
  const chat = state.chats[characterId];
  const presented = new Set(chat?.presented ?? []);
  return foundClues(state).filter((clue) => !presented.has(clue.id));
}

export function activeCharacters(state: GameState): CharacterId[] {
  const base: CharacterId[] = ["CHAR_002", "CHAR_003", "CHAR_004"];
  return state.unknownEntered ? ["CHAR_005", ...base] : base;
}

export function unreadCount(state: GameState, characterId: CharacterId) {
  const chat = state.chats[characterId];
  if (!chat) return 0;
  return chat.messages.filter((message) => message.role === "character" && !message.id.startsWith("seen")).length;
}

export function lockLabel(lockId: LockId) {
  return getLock(lockId)?.prompt ?? "Senha";
}

export function describeClue(clueId: string) {
  const clue = getClue(clueId);
  if (!clue) return { label: clueId, summary: "" };
  return { label: clue.label, summary: clue.summary };
}

/** Evidentiary blocks covered by the evidence selected for the accusation. */
export function evidenceCoverage(clueIds: string[]) {
  const blocks = new Set<string>();
  clueIds.forEach((id) => {
    const block = getClue(id)?.block;
    if (block) blocks.add(block);
  });
  return { blocks: [...blocks], complete: ["A", "B", "C"].every((block) => blocks.has(block)) };
}
