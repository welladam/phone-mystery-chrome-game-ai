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

  /** Entrega uma fala canônica com o ritmo do personagem. */
  const deliverBeat = useCallback(
    async (characterId: CharacterId, beat: ScriptedBeat, reduced: boolean) => {
      dispatch({ type: "CHAT_BEAT", characterId, beatId: beat.id });
      dispatch({ type: "SET_TYPING", characterId });
      setTyping(characterId);

      const profile = chatLocale.getCharacter(characterId);
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

      // O que o jogador conta a um personagem pode chegar a outro — mas só
      // pela via narrativa, nunca por leitura de sessão.
      if (chatLocale.shouldLeakToShared(intents)) {
        intents.forEach((intent) => dispatch({ type: "LEAK", token: intent }));
      }

      try {
        // 2a. Metalinguagem e ameaça têm resposta canônica, em personagem.
        if (intents.includes("INT_021")) {
          dispatch({ type: "META_ATTEMPT" });
          await deliverBeat(characterId, chatLocale.metaReply(characterId), false);
          return;
        }
        if (intents.includes("INT_015")) {
          await deliverBeat(characterId, chatLocale.threatReply(characterId), false);
          return;
        }

        // 2b. O contato anônimo tem uma trilha própria de deslizes.
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

        // 2c. A amiga oferece uma tese sobre outra pessoa — uma vez só. A prova
        // apresentada agora conta, por isso ela entra na lista antes da checagem.
        const steer = chatLocale.friendSteerBeat(characterId, {
          state: current,
          chat: clueId ? { ...chat, presented: [...chat.presented, clueId] } : chat,
          intents: intents as IntentId[],
        });
        if (steer) {
          await deliverBeat(characterId, steer, false);
          return;
        }

        // 2d. Contar do atropelamento tem consequência declarada em tela.
        const leak = chatLocale.leakWarning(characterId, intents as IntentId[]);
        if (leak && !chat.beats.includes(leak.id)) {
          await deliverBeat(characterId, leak, false);
          return;
        }

        // 3. Fatos permitidos agora. Nada além disto chega à sessão.
        const { ids, facts } = chatLocale.allowedFacts(current, characterId, chat, intents as IntentId[]);

        // Nomes afirmados pelo jogador não viram memórias do personagem. Se o
        // nome não existe no caso, ainda não pode ser conhecido ou precisa ser
        // ocultado, a resposta sai do motor e a alegação nem chega ao modelo.
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

        // Perguntar por gravações à melhor amiga tem custo narrativo visível.
        if (characterId === "CHAR_004" && intents.includes("INT_011")) {
          dispatch({ type: "LEAK", token: "gravacao" });
        }
        // A intenção principal fica registrada para as dicas.
        dispatch({ type: "CHAT_INTENT", characterId, intent: primary.id });
      } catch (caught) {
        const mapped =
          caught instanceof AiError
            ? caught
            : new AiError("SESSION_FAILED", caught instanceof Error ? `${caught.name}: ${caught.message}` : String(caught));
        setError(mapped);

        // Sem isto, uma falha real de IA não deixa rastro nenhum — nem no
        // painel de diagnóstico. O código e o detalhe técnico vão só para lá;
        // o jogador continua vendo apenas a explicação em português.
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
