import { INITIAL_APPS } from "../content/manifest";
import type { CharacterId, ChatState, GameState } from "./types";

export const SAVE_VERSION = 3;

export const PLAYABLE_CHARACTERS: CharacterId[] = ["CHAR_002", "CHAR_003", "CHAR_004"];
export const LATE_CHARACTER: CharacterId = "CHAR_005";

function emptyChat(): ChatState {
  return { messages: [], disclosed: [], beats: [], presented: [], intents: [] };
}

export function createInitialState(): GameState {
  const now = new Date().toISOString();
  return {
    saveVersion: SAVE_VERSION,
    difficulty: "normal",
    difficultyChosen: false,
    act: 1,
    phoneUnlocked: false,
    unlockedApps: [...INITIAL_APPS],
    solvedLocks: [],
    lockAttempts: {},
    cluesFound: [],
    cluesExamined: [],
    memories: [],
    eventsFired: [],
    chats: {
      CHAR_002: emptyChat(),
      CHAR_003: emptyChat(),
      CHAR_004: emptyChat(),
    },
    sharedLeak: [],
    unknownEntered: false,
    unknownRead: false,
    notificationsSeen: [],
    zoomed: [],
    playedVoices: [],
    accusation: {},
    accusationAttempts: [],
    hintsUsed: {},
    metaAttempts: 0,
    revealShown: false,
    sentAudioToDiego: false,
    startedAt: now,
    lastSavedAt: now,
    actEnteredAt: Date.now(),
  };
}

export function ensureChat(state: GameState, characterId: CharacterId): ChatState {
  return state.chats[characterId] ?? emptyChat();
}
