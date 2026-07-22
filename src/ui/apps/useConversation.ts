/**
 * Condução de um turno de conversa.
 *
 * Ordem das decisões — e todas as que importam são do motor, não da IA:
 *
 * 1. classificar a intenção do jogador (semântica, não frase exata);
 * 2. verificar se há uma fala canônica para este momento;
 * 3. calcular os fatos que o personagem pode usar agora;
 * 4. traduzir, perguntar ao modelo, traduzir de volta;
 * 5. registrar no estado o que foi liberado — nunca a partir do texto gerado.
 */

import { useCallback, useRef, useState } from "react";
import type { CharacterSessions } from "../../ai/characterSessions";
import { AiError } from "../../ai/errors";
import { getCharacter } from "../../content/characters/base";
import { getClue } from "../../content/manifest";
import { loadAct3, loadAct4 } from "../../content/registry";
import { allowedFacts } from "../../engine/disclosure";
import { classifyAll, classifyIntent, HOSTILE_INTENTS, type IntentId } from "../../engine/intents";
import {
  collapseBeat,
  leakWarning,
  metaReply,
  openingBeat,
  shouldLeakToShared,
  threatReply,
  unknownBeat,
  type ScriptedBeat,
} from "../../engine/scripted";
import type { CharacterId, ChatMessage, GameAction, GameState } from "../../engine/types";

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
};

export function useConversation({ state, dispatch, sessions }: Params): ConversationApi {
  const [typing, setTyping] = useState<CharacterId>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AiError>();
  const stateRef = useRef(state);
  stateRef.current = state;

  /** Entrega uma fala canônica com o ritmo do personagem. */
  const deliverBeat = useCallback(
    async (characterId: CharacterId, beat: ScriptedBeat, reduced: boolean) => {
      dispatch({ type: "CHAT_BEAT", characterId, beatId: beat.id });
      dispatch({ type: "SET_TYPING", characterId });
      setTyping(characterId);

      const profile = getCharacter(characterId);
      for (const line of beat.lines) {
        if (!reduced) {
          // Teto baixo de propósito: falas canônicas longas não podem virar
          // um minuto de espera olhando o indicador de digitação.
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
    [dispatch],
  );

  const greet = useCallback(
    async (characterId: CharacterId) => {
      const current = stateRef.current;
      const chat = current.chats[characterId];
      if (!chat || chat.messages.length > 0) return;

      const profile = getCharacter(characterId);
      if (profile.openingFromPlayer) {
        dispatch({
          type: "CHAT_APPEND",
          characterId,
          message: makeMessage("player", profile.openingFromPlayer),
        });
      }

      const beat = openingBeat(characterId);
      if (beat) await deliverBeat(characterId, beat, false);
    },
    [deliverBeat, dispatch],
  );

  const deliverCollapse = useCallback(
    async (characterId: CharacterId) => {
      const pack = await loadAct4();
      await deliverBeat(characterId, collapseBeat(pack, characterId), false);
    },
    [deliverBeat],
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
      const intents = classifyAll(trimmed);
      const primary = classifyIntent(trimmed);

      dispatch({
        type: "CHAT_APPEND",
        characterId,
        message: makeMessage("player", trimmed, clueId ? { clueId } : undefined),
      });
      intents.forEach((intent) => dispatch({ type: "CHAT_INTENT", characterId, intent }));
      if (clueId) dispatch({ type: "CHAT_PRESENT", characterId, clueId });

      // O que o jogador conta a um personagem pode chegar a outro — mas só
      // pela via narrativa, nunca por leitura de sessão.
      if (shouldLeakToShared(intents)) {
        intents.forEach((intent) => dispatch({ type: "LEAK", token: intent }));
      }

      try {
        // 2a. Metalinguagem e ameaça têm resposta canônica, em personagem.
        if (intents.includes("INT_021")) {
          dispatch({ type: "META_ATTEMPT" });
          await deliverBeat(characterId, metaReply(characterId), false);
          return;
        }
        if (intents.includes("INT_015")) {
          await deliverBeat(characterId, threatReply(characterId), false);
          return;
        }

        // 2b. O contato anônimo tem uma trilha própria de deslizes.
        if (characterId === "CHAR_005") {
          const pack = await loadAct3();
          const sourcePresses = chat.intents.filter((intent) => intent === "INT_008").length + (intents.includes("INT_008") ? 1 : 0);
          const beat = unknownBeat(pack, {
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

        // 2c. Contar do atropelamento tem consequência declarada em tela.
        const leak = leakWarning(characterId, intents as IntentId[]);
        if (leak && !chat.beats.includes(leak.id)) {
          await deliverBeat(characterId, leak, false);
          return;
        }

        // 3. Fatos permitidos agora. Nada além disto chega à sessão.
        const { ids, facts } = allowedFacts(current, characterId, chat, intents as IntentId[]);

        if (!sessions) {
          throw new AiError("SESSION_FAILED");
        }

        setTyping(characterId);
        dispatch({ type: "SET_TYPING", characterId });

        const clue = clueId ? getClue(clueId) : undefined;
        const result = await sessions.ask({
          characterId,
          playerText: trimmed,
          facts,
          attachedEvidence: clue ? `${clue.label} — ${clue.summary}` : undefined,
          act: current.act,
        });

        dispatch({ type: "CHAT_DISCLOSE", characterId, factIds: ids });

        const profile = getCharacter(characterId);
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

        // Perguntar por gravações à melhor amiga tem custo narrativo visível.
        if (characterId === "CHAR_004" && intents.includes("INT_011")) {
          dispatch({ type: "LEAK", token: "gravacao" });
        }
        // A intenção principal fica registrada para as dicas.
        dispatch({ type: "CHAT_INTENT", characterId, intent: primary.id });
      } catch (caught) {
        const mapped = caught instanceof AiError ? caught : new AiError("SESSION_FAILED");
        setError(mapped);
        dispatch({
          type: "CHAT_APPEND",
          characterId,
          message: makeMessage(
            "system",
            "A conversa falhou por um instante. Nada do que você descobriu foi perdido — tente enviar de novo.",
          ),
        });
      } finally {
        setTyping(undefined);
        dispatch({ type: "SET_TYPING", characterId: undefined });
        setBusy(false);
      }
    },
    [busy, deliverBeat, dispatch, sessions],
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
