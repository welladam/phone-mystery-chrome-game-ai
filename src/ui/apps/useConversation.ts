/**
 * Conversation-turn orchestration.
 *
 * Decision order—all consequential decisions belong to the engine, not AI:
 *
 * 1. classify the player's intent (semantics, not an exact phrase);
 * 2. check for a canonical line for this moment;
 * 3. calculate the facts the character may use now;
 * 4. translate, prompt the model, and translate back;
 * 5. record released information in state—never from generated text.
 */

import { useCallback, useRef, useState } from "react";
import type { CharacterSessions } from "../../ai/characterSessions";
import { AiError } from "../../ai/errors";
import { loadAct3, loadAct4 } from "../../content/registry";
import { logDiagnostic } from "../../persistence/diagnostics";
import { HOSTILE_INTENTS, type IntentId } from "../../engine/intents";
import type { ScriptedBeat } from "../../engine/scripted";
import type { CharacterId, ChatMessage, GameAction, GameState } from "../../engine/types";
import type { LocaleId } from "../../locales/types";
import { getLocaleChat } from "../../locales/chatRegistry";

let messageSeq = 0;
function makeMessage(role: ChatMessage["role"], text: string, extra?: Partial<ChatMessage>): ChatMessage {
  messageSeq += 1;
  return {
    id: `m${Date.now().toString(36)}${messageSeq.toString(36)}`,
    role,
    text,
    at: new Date().toISOString(),
    ...extra,
  };
}

export type ConversationApi = {
  send: (characterId: CharacterId, text: string, clueId?: string) => Promise<void>;
  greet: (characterId: CharacterId) => Promise<void>;
  deliverCollapse: (characterId: CharacterId) => Promise<void>;
  typing?: CharacterId;
  busy: boolean;
  error?: AiError;
  clearError: () => void;
};

type Params = {
  state: GameState;
  dispatch: (action: GameAction) => void;
  sessions?: CharacterSessions;
  localeId: LocaleId;
};

export function useConversation({ state, dispatch, sessions, localeId }: Params): ConversationApi {
  const chatLocale = getLocaleChat(localeId);
  const [typing, setTyping] = useState<CharacterId>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AiError>();
  const stateRef = useRef(state);
  stateRef.current = state;

  /** Delivers a canonical line using the character's rhythm. */
  const deliverBeat = useCallback(
    async (characterId: CharacterId, beat: ScriptedBeat, reduced: boolean) => {
      dispatch({ type: "CHAT_BEAT", characterId, beatId: beat.id });
      dispatch({ type: "SET_TYPING", characterId });
      setTyping(characterId);

      const profile = chatLocale.getCharacter(characterId);
      for (const line of beat.lines) {
        if (!reduced) {
          // Deliberately low ceiling: long canonical lines must not become a
          // minute of waiting while staring at the typing indicator.
          const wait = Math.min(1500, profile.minDelayMs + line.length * profile.typingSpeed);
          await new Promise((resolve) => setTimeout(resolve, wait));
        }
        dispatch({
          type: "CHAT_APPEND",
          characterId,
          message: makeMessage("character", line, { scripted: true }),
        });
      }

      if (beat.clueId) dispatch({ type: "FIND_CLUE", clueId: beat.clueId });

      if (beat.closingNote) {
        dispatch({
          type: "CHAT_APPEND",
          characterId,
          message: makeMessage("system", beat.closingNote, { scripted: true }),
        });
      }
      if (beat.closes) dispatch({ type: "CHAT_COLLAPSE", characterId });
      if (beat.silenceMs) {
        dispatch({ type: "CHAT_SILENCE", characterId, untilMs: Date.now() + beat.silenceMs });
      }

      dispatch({ type: "SET_TYPING", characterId: undefined });
      setTyping(undefined);
    },
    [chatLocale, dispatch],
  );

  const greet = useCallback(
    async (characterId: CharacterId) => {
      const current = stateRef.current;
      const chat = current.chats[characterId];
      if (!chat || chat.messages.length > 0) return;

      const profile = chatLocale.getCharacter(characterId);
      if (profile.openingFromPlayer) {
        dispatch({
          type: "CHAT_APPEND",
          characterId,
          message: makeMessage("player", profile.openingFromPlayer),
        });
      }

      const beat = chatLocale.openingBeat(characterId);
      if (beat) await deliverBeat(characterId, beat, false);
    },
    [deliverBeat, dispatch],
  );

  const deliverCollapse = useCallback(
    async (characterId: CharacterId) => {
      const pack = await loadAct4(localeId);
      await deliverBeat(characterId, chatLocale.collapseBeat(pack, characterId), false);
    },
    [deliverBeat, localeId],
  );

  const send = useCallback(
    async (characterId: CharacterId, text: string, clueId?: string) => {
      if (busy) return;
      const current = stateRef.current;
      const chat = current.chats[characterId];
      if (!chat || chat.collapsed) return;

      setBusy(true);
      setError(undefined);

      const trimmed = text.trim();
      const intents = chatLocale.classifyAll(trimmed);
      const primary = chatLocale.classifyIntent(trimmed);

      dispatch({
        type: "CHAT_APPEND",
        characterId,
        message: makeMessage("player", trimmed, clueId ? { clueId } : undefined),
      });
      intents.forEach((intent) => dispatch({ type: "CHAT_INTENT", characterId, intent }));
      if (clueId) dispatch({ type: "CHAT_PRESENT", characterId, clueId });

      // What the player tells one character may reach another, but only through
      // the narrative path, never by reading another session.
      if (chatLocale.shouldLeakToShared(intents)) {
        intents.forEach((intent) => dispatch({ type: "LEAK", token: intent }));
      }

      try {
        // 2a. Metalinguistic attempts and threats receive canonical in-character responses.
        if (intents.includes("INT_021")) {
          dispatch({ type: "META_ATTEMPT" });
          await deliverBeat(characterId, chatLocale.metaReply(characterId), false);
          return;
        }
        if (intents.includes("INT_015")) {
          await deliverBeat(characterId, chatLocale.threatReply(characterId), false);
          return;
        }

        // 2b. The anonymous contact has a dedicated sequence of slips.
        if (characterId === "CHAR_005") {
          const pack = await loadAct3(localeId);
          const sourcePresses = chat.intents.filter((intent) => intent === "INT_008").length + (intents.includes("INT_008") ? 1 : 0);
          const beat = chatLocale.unknownBeat(pack, {
            state: current,
            chat,
            characterId,
            intents: intents as IntentId[],
            sourcePresses,
          });
          if (beat) {
            await deliverBeat(characterId, beat, false);
            return;
          }
        }

        // 2c. The friend offers a theory about someone else only once. Evidence
        // presented now counts, so it enters the list before the check.
        const steer = chatLocale.friendSteerBeat(characterId, {
          state: current,
          chat: clueId ? { ...chat, presented: [...chat.presented, clueId] } : chat,
          intents: intents as IntentId[],
        });
        if (steer) {
          await deliverBeat(characterId, steer, false);
          return;
        }

        // 2d. Revealing the hit-and-run has an on-screen consequence.
        const leak = chatLocale.leakWarning(characterId, intents as IntentId[]);
        if (leak && !chat.beats.includes(leak.id)) {
          await deliverBeat(characterId, leak, false);
          return;
        }

        // 3. Facts allowed now. Nothing beyond these reaches the session.
        const { ids, facts } = chatLocale.allowedFacts(current, characterId, chat, intents as IntentId[]);

        // Names asserted by the player do not become character memories. If a
        // name is outside the case, cannot be known yet, or must be concealed,
        // the engine answers and the claim never reaches the model.
        const guardedName = chatLocale.guardPersonMention(trimmed, characterId, current.act, facts);
        if (guardedName) {
          await deliverBeat(
            characterId,
            {
              id: `NAME_GUARD_${guardedName.reason}_${guardedName.name}`,
              lines: chatLocale.guardedNameReply(characterId, guardedName.name),
            },
            false,
          );
          return;
        }

        if (!sessions) {
          throw new AiError("SESSION_FAILED");
        }

        setTyping(characterId);
        dispatch({ type: "SET_TYPING", characterId });

        const clue = clueId ? chatLocale.getClue(clueId) : undefined;
        const result = await sessions.ask({
          characterId,
          playerText: trimmed,
          facts,
          attachedEvidence: clue ? `${clue.label} — ${clue.summary}` : undefined,
          act: current.act,
        });

        dispatch({ type: "CHAT_DISCLOSE", characterId, factIds: ids });

        const profile = chatLocale.getCharacter(characterId);
        const lines = result.lines.length ? result.lines : ["…"];
        for (const line of lines) {
          const wait = Math.min(2200, profile.minDelayMs + line.length * profile.typingSpeed);
          await new Promise((resolve) => setTimeout(resolve, wait));
          dispatch({
            type: "CHAT_APPEND",
            characterId,
            message: makeMessage("character", line),
          });
        }

        // Asking the best friend about recordings has a visible narrative cost.
        if (characterId === "CHAR_004" && intents.includes("INT_011")) {
          dispatch({ type: "LEAK", token: "gravacao" });
        }
        // The primary intent is recorded for hints.
        dispatch({ type: "CHAT_INTENT", characterId, intent: primary.id });
      } catch (caught) {
        const mapped =
          caught instanceof AiError
            ? caught
            : new AiError("SESSION_FAILED", caught instanceof Error ? `${caught.name}: ${caught.message}` : String(caught));
        setError(mapped);

        // Without this, a real AI failure leaves no trace, even in diagnostics.
        // Only the code and technical details go there; the player still sees
        // only the Portuguese explanation.
        void logDiagnostic({
          category: "chat",
          code: mapped.code,
          details: { characterId, technical: mapped.technical },
        });

        const base =
          "A conversa falhou por um instante. Nada do que você descobriu foi perdido — tente enviar de novo.";
        const detail = mapped.technical ?? mapped.info.cause;
        const withCause = detail ? `${base} [${mapped.code}: ${detail}]` : `${base} [${mapped.code}]`;

        dispatch({
          type: "CHAT_APPEND",
          characterId,
          message: makeMessage("system", import.meta.env.DEV ? withCause : base),
        });
      } finally {
        setTyping(undefined);
        dispatch({ type: "SET_TYPING", characterId: undefined });
        setBusy(false);
      }
    },
    [busy, chatLocale, deliverBeat, dispatch, localeId, sessions],
  );

  return {
    send,
    greet,
    deliverCollapse,
    typing,
    busy,
    error,
    clearError: () => setError(undefined),
  };
}

export { HOSTILE_INTENTS };
