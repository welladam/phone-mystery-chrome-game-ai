/**
 * Redutor único do jogo.
 *
 * Toda progressão passa por aqui. A interface nunca desbloqueia conteúdo
 * mexendo em estado local, e a IA nunca escreve neste redutor — respostas do
 * modelo entram apenas como texto de mensagem, através de CHAT_APPEND.
 */

import { getClue, getLock, isKnownClue } from "../content/manifest";
import { ensureChat } from "./initialState";
import { EVENTS, appsUnlockedForAct, deriveMemories, nextAct } from "./rules";
import type { ActNumber, AppId, ChatState, GameAction, GameState } from "./types";

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function withChat(state: GameState, characterId: string, patch: Partial<ChatState>): GameState {
  const current = ensureChat(state, characterId as never);
  return {
    ...state,
    chats: { ...state.chats, [characterId]: { ...current, ...patch } },
  };
}

/** Aplica avanço de ato e deduções derivadas depois de qualquer mudança. */
function settle(state: GameState): GameState {
  let next = { ...state, memories: unique([...state.memories, ...deriveMemories(state)]) };

  const promoted = nextAct(next);
  if (promoted && promoted > next.act) {
    const act = promoted as ActNumber;
    const eventId =
      act === 2 ? EVENTS.ACT2 : act === 3 ? EVENTS.ACT3 : act === 4 ? EVENTS.ACT4 : undefined;

    next = {
      ...next,
      act,
      actEnteredAt: Date.now(),
      unlockedApps: unique([...next.unlockedApps, ...appsUnlockedForAct(act)]),
      eventsFired: eventId ? unique([...next.eventsFired, eventId]) : next.eventsFired,
    };
    // Um ato pode habilitar outro imediatamente (jogador que já tinha tudo).
    const again = nextAct(next);
    if (again && again > next.act) {
      return settle(next);
    }
  }

  return next;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "RESTORE":
      return settle(action.state);

    case "UNLOCK_PHONE":
      if (state.phoneUnlocked) return state;
      return settle({
        ...state,
        phoneUnlocked: true,
        solvedLocks: unique([...state.solvedLocks, "LOCK_001"]),
      });

    case "OPEN_APP": {
      if (!state.unlockedApps.includes(action.appId)) return state;
      return state;
    }

    case "FIND_CLUE": {
      if (!isKnownClue(action.clueId)) return state;
      if (state.cluesFound.includes(action.clueId)) return state;
      return settle({ ...state, cluesFound: [...state.cluesFound, action.clueId] });
    }

    case "EXAMINE_CLUE": {
      if (!isKnownClue(action.clueId)) return state;
      const found = state.cluesFound.includes(action.clueId)
        ? state.cluesFound
        : [...state.cluesFound, action.clueId];
      const examined = state.cluesExamined.includes(action.clueId)
        ? state.cluesExamined
        : [...state.cluesExamined, action.clueId];
      if (found === state.cluesFound && examined === state.cluesExamined) return state;
      return settle({ ...state, cluesFound: found, cluesExamined: examined });
    }

    case "ZOOM_PHOTO":
      if (state.zoomed.includes(action.photoId)) return state;
      return { ...state, zoomed: [...state.zoomed, action.photoId] };

    case "PLAY_VOICE":
      if (state.playedVoices.includes(action.voiceId)) return state;
      return { ...state, playedVoices: [...state.playedVoices, action.voiceId] };

    case "SOLVE_LOCK": {
      const lock = getLock(action.lockId);
      if (!lock) return state;
      if (state.solvedLocks.includes(action.lockId)) return state;

      const grantedClues = (lock.grantsClues ?? []).filter((clue) => isKnownClue(clue));
      const grantedApps = (lock.unlocksApps ?? []) as AppId[];

      return settle({
        ...state,
        solvedLocks: [...state.solvedLocks, action.lockId],
        cluesFound: unique([...state.cluesFound, ...grantedClues]),
        unlockedApps: unique([...state.unlockedApps, ...grantedApps]),
      });
    }

    case "FAIL_LOCK":
      return {
        ...state,
        lockAttempts: {
          ...state.lockAttempts,
          [action.lockId]: (state.lockAttempts[action.lockId] ?? 0) + 1,
        },
      };

    case "SEE_NOTIFICATION":
      if (state.notificationsSeen.includes(action.notificationId)) return state;
      return { ...state, notificationsSeen: [...state.notificationsSeen, action.notificationId] };

    case "CHAT_APPEND": {
      const chat = ensureChat(state, action.characterId);
      return withChat(state, action.characterId, {
        messages: [...chat.messages, action.message],
      });
    }

    case "CHAT_DISCLOSE": {
      const chat = ensureChat(state, action.characterId);
      return withChat(state, action.characterId, {
        disclosed: unique([...chat.disclosed, ...action.factIds]),
      });
    }

    case "CHAT_BEAT": {
      const chat = ensureChat(state, action.characterId);
      if (chat.beats.includes(action.beatId)) return state;
      return withChat(state, action.characterId, { beats: [...chat.beats, action.beatId] });
    }

    case "CHAT_INTENT": {
      const chat = ensureChat(state, action.characterId);
      return withChat(state, action.characterId, {
        intents: unique([...chat.intents, action.intent]),
      });
    }

    case "CHAT_PRESENT": {
      if (!state.cluesFound.includes(action.clueId)) return state;
      const chat = ensureChat(state, action.characterId);
      return withChat(state, action.characterId, {
        presented: unique([...chat.presented, action.clueId]),
      });
    }

    case "CHAT_SILENCE":
      return withChat(state, action.characterId, { silentUntil: action.untilMs });

    case "CHAT_COLLAPSE":
      return settle({
        ...withChat(state, action.characterId, { collapsed: true }),
        eventsFired: unique([...state.eventsFired, EVENTS.COLLAPSE]),
      });

    case "SET_TYPING":
      return { ...state, typingLock: action.characterId };

    case "MARK_UNKNOWN_READ":
      if (state.unknownRead) return state;
      return { ...state, unknownRead: true };

    case "LEAK":
      if (state.sharedLeak.includes(action.token)) return state;
      return { ...state, sharedLeak: [...state.sharedLeak, action.token] };

    case "FIRE_EVENT": {
      if (state.eventsFired.includes(action.eventId)) return state;
      const base: GameState = { ...state, eventsFired: [...state.eventsFired, action.eventId] };
      if (action.eventId === EVENTS.UNKNOWN) {
        return settle({
          ...base,
          unknownEntered: true,
          chats: {
            ...base.chats,
            CHAR_005: ensureChat(base, "CHAR_005"),
          },
        });
      }
      return settle(base);
    }

    case "PLACE_NODE": {
      if (!state.cluesFound.includes(action.clueId)) return state;
      return { ...state, timeline: { ...state.timeline, [action.node]: action.clueId } };
    }

    case "CLEAR_NODE": {
      const timeline = { ...state.timeline };
      delete timeline[action.node];
      return { ...state, timeline };
    }

    case "SET_ACCUSATION":
      return { ...state, accusation: { ...state.accusation, ...action.patch } };

    // As alternâncias são calculadas aqui, e não na interface, para que
    // cliques rápidos em sequência não percam nada por ler um estado antigo.
    case "TOGGLE_SEQUENCE": {
      const current = state.accusation.sequencia;
      const sequencia = current.includes(action.cardId)
        ? current.filter((item) => item !== action.cardId)
        : [...current, action.cardId];
      return { ...state, accusation: { ...state.accusation, sequencia } };
    }

    case "TOGGLE_EVIDENCE": {
      if (!state.cluesFound.includes(action.clueId)) return state;
      const current = state.accusation.evidencias;
      const evidencias = current.includes(action.clueId)
        ? current.filter((item) => item !== action.clueId)
        : [...current, action.clueId];
      return { ...state, accusation: { ...state.accusation, evidencias } };
    }

    case "RECORD_ACCUSATION": {
      const next: GameState = {
        ...state,
        accusationAttempts: [...state.accusationAttempts, action.attempt],
      };
      if (action.attempt.outcome === "aceita") {
        return settle({ ...next, eventsFired: unique([...next.eventsFired, EVENTS.ACCUSED]) });
      }
      return next;
    }

    case "SHOW_REVEAL":
      return { ...state, revealShown: true };

    case "SEND_AUDIO_TO_DIEGO":
      if (state.sentAudioToDiego) return state;
      return {
        ...state,
        sentAudioToDiego: true,
        eventsFired: unique([...state.eventsFired, EVENTS.AUDIO_SENT]),
      };

    case "USE_HINT":
      return {
        ...state,
        hintsUsed: {
          ...state.hintsUsed,
          [action.obstacleId]: (state.hintsUsed[action.obstacleId] ?? 0) + 1,
        },
      };

    case "META_ATTEMPT":
      return { ...state, metaAttempts: state.metaAttempts + 1 };

    case "TOUCH_SAVE":
      return { ...state, lastSavedAt: new Date().toISOString() };

    default:
      return state;
  }
}

/** Conveniência para a UI: a pista existe e já foi encontrada? */
export function clueLabel(clueId: string) {
  return getClue(clueId)?.label ?? clueId;
}
