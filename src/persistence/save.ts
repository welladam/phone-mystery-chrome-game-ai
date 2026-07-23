/**
 * Save do jogo: versão, checksum, sanitização e migração.
 *
 * O save guarda apenas IDs e estados já alcançados. Não há texto de solução,
 * não há segredo bloqueado e nenhuma chave tem nome revelador. Um save
 * adulterado é recusado com mensagem amigável, nunca com stack trace.
 */

import { APPS, LOCKS, isKnownClue } from "../content/manifest";
import { SAVE_VERSION, createInitialState } from "../engine/initialState";
import { fnv1a } from "../engine/text";
import type { ActNumber, AppId, ChatState, GameState, LockId } from "../engine/types";
import { StorageError, withStore } from "./db";

const SAVE_KEY = "slot-principal";

export type SaveEnvelope = {
  v: number;
  checksum: string;
  savedAt: string;
  state: GameState;
};

export type LoadResult =
  | { kind: "vazio" }
  | { kind: "ok"; state: GameState; savedAt: string }
  | { kind: "migrado"; state: GameState; savedAt: string; from: number }
  | { kind: "recusado"; reason: "checksum" | "formato" | "versao" };

const VALID_APPS = new Set<string>(APPS.map((app) => app.id));
const VALID_LOCKS = new Set<string>(LOCKS.map((lock) => lock.id));

/** Campos que entram no checksum — só progressão, nunca conteúdo. */
function checksumInput(state: GameState) {
  return [
    state.saveVersion,
    state.act,
    state.phoneUnlocked ? 1 : 0,
    [...state.unlockedApps].sort().join(","),
    [...state.solvedLocks].sort().join(","),
    [...state.cluesFound].sort().join(","),
    [...state.cluesExamined].sort().join(","),
    [...state.memories].sort().join(","),
    [...state.eventsFired].sort().join(","),
    state.unknownEntered ? 1 : 0,
    state.revealShown ? 1 : 0,
  ].join("|");
}

export function signState(state: GameState) {
  return fnv1a(checksumInput(state));
}

function sanitizeChat(raw: unknown): ChatState {
  const base: ChatState = { messages: [], disclosed: [], beats: [], presented: [], intents: [] };
  if (!raw || typeof raw !== "object") return base;
  const chat = raw as Partial<ChatState>;

  return {
    messages: Array.isArray(chat.messages)
      ? chat.messages
          .filter(
            (message) =>
              message &&
              typeof message.id === "string" &&
              typeof message.text === "string" &&
              (message.role === "player" || message.role === "character" || message.role === "system"),
          )
          .slice(-120)
      : [],
    disclosed: Array.isArray(chat.disclosed) ? chat.disclosed.filter((id) => typeof id === "string") : [],
    beats: Array.isArray(chat.beats) ? chat.beats.filter((id) => typeof id === "string") : [],
    presented: Array.isArray(chat.presented) ? chat.presented.filter(isKnownClue) : [],
    intents: Array.isArray(chat.intents) ? chat.intents.filter((id) => typeof id === "string") : [],
    silentUntil: typeof chat.silentUntil === "number" ? chat.silentUntil : undefined,
    collapsed: chat.collapsed === true,
  };
}

/**
 * Remove qualquer coisa que não exista no registro atual e garante que a
 * progressão seja coerente. Um save que aponte para um ato impossível ou para
 * pistas inexistentes é normalizado, não aceito às cegas.
 */
export function sanitizeState(raw: unknown): GameState | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const input = raw as Partial<GameState>;
  const fresh = createInitialState();

  const act = ([1, 2, 3, 4] as ActNumber[]).includes(input.act as ActNumber)
    ? (input.act as ActNumber)
    : 1;

  const cluesFound = Array.isArray(input.cluesFound) ? input.cluesFound.filter(isKnownClue) : [];
  const cluesExamined = Array.isArray(input.cluesExamined)
    ? input.cluesExamined.filter((id) => isKnownClue(id) && cluesFound.includes(id))
    : [];

  const solvedLocks = Array.isArray(input.solvedLocks)
    ? (input.solvedLocks.filter((id) => VALID_LOCKS.has(id)) as LockId[])
    : [];

  const unlockedApps = Array.isArray(input.unlockedApps)
    ? (input.unlockedApps.filter((id) => VALID_APPS.has(id)) as AppId[])
    : fresh.unlockedApps;

  const chats: GameState["chats"] = {};
  const rawChats = (input.chats ?? {}) as Record<string, unknown>;
  ["CHAR_002", "CHAR_003", "CHAR_004", "CHAR_005"].forEach((id) => {
    if (id === "CHAR_005" && input.unknownEntered !== true) return;
    chats[id] = sanitizeChat(rawChats[id]);
  });

  const timeline: GameState["timeline"] = {};
  const rawTimeline = (input.timeline ?? {}) as Record<string, unknown>;
  Object.entries(rawTimeline).forEach(([node, clue]) => {
    if (typeof clue === "string" && isKnownClue(clue) && cluesFound.includes(clue)) {
      timeline[node as keyof GameState["timeline"]] = clue;
    }
  });

  return {
    ...fresh,
    saveVersion: SAVE_VERSION,
    act,
    phoneUnlocked: input.phoneUnlocked === true,
    unlockedApps: [...new Set([...fresh.unlockedApps, ...unlockedApps])],
    solvedLocks,
    lockAttempts:
      input.lockAttempts && typeof input.lockAttempts === "object" ? { ...input.lockAttempts } : {},
    cluesFound,
    cluesExamined,
    memories: Array.isArray(input.memories) ? input.memories.filter((id) => typeof id === "string") : [],
    eventsFired: Array.isArray(input.eventsFired)
      ? input.eventsFired.filter((id) => typeof id === "string")
      : [],
    chats,
    sharedLeak: Array.isArray(input.sharedLeak) ? input.sharedLeak.filter((id) => typeof id === "string") : [],
    unknownEntered: input.unknownEntered === true,
    unknownRead: input.unknownRead === true,
    notificationsSeen: Array.isArray(input.notificationsSeen)
      ? input.notificationsSeen.filter((id) => typeof id === "string")
      : [],
    zoomed: Array.isArray(input.zoomed) ? input.zoomed.filter((id) => typeof id === "string") : [],
    playedVoices: Array.isArray(input.playedVoices)
      ? input.playedVoices.filter((id) => typeof id === "string")
      : [],
    timeline,
    accusation: {
      responsavel: typeof input.accusation?.responsavel === "string" ? input.accusation.responsavel : undefined,
      motivo: typeof input.accusation?.motivo === "string" ? input.accusation.motivo : undefined,
      metodo: typeof input.accusation?.metodo === "string" ? input.accusation.metodo : undefined,
      oportunidade:
        typeof input.accusation?.oportunidade === "string" ? input.accusation.oportunidade : undefined,
      sequencia: Array.isArray(input.accusation?.sequencia)
        ? input.accusation.sequencia.filter((id) => typeof id === "string")
        : [],
      evidencias: Array.isArray(input.accusation?.evidencias)
        ? input.accusation.evidencias.filter((id) => isKnownClue(id) && cluesFound.includes(id))
        : [],
      contradicao:
        typeof input.accusation?.contradicao === "string" ? input.accusation.contradicao : undefined,
      desconhecida:
        typeof input.accusation?.desconhecida === "string" ? input.accusation.desconhecida : undefined,
    },
    accusationAttempts: Array.isArray(input.accusationAttempts)
      ? input.accusationAttempts.slice(-20)
      : [],
    hintsUsed: input.hintsUsed && typeof input.hintsUsed === "object" ? { ...input.hintsUsed } : {},
    metaAttempts: typeof input.metaAttempts === "number" ? input.metaAttempts : 0,
    revealShown: input.revealShown === true,
    sentAudioToDiego: input.sentAudioToDiego === true,
    startedAt: typeof input.startedAt === "string" ? input.startedAt : fresh.startedAt,
    lastSavedAt: typeof input.lastSavedAt === "string" ? input.lastSavedAt : fresh.lastSavedAt,
    actEnteredAt: typeof input.actEnteredAt === "number" ? input.actEnteredAt : Date.now(),
  };
}

/**
 * Migração de versões.
 * A v1 é o protótipo antigo de chat único, cuja história não existe mais.
 * Ele é descartado de propósito — manter aquele progresso significaria
 * ressuscitar um caso que contradiz este.
 */
function migrate(envelope: SaveEnvelope): { state: GameState; from: number } | undefined {
  if (envelope.v === SAVE_VERSION) return undefined;
  if (envelope.v < SAVE_VERSION) {
    return { state: createInitialState(), from: envelope.v };
  }
  return undefined;
}

export async function loadSave(): Promise<LoadResult> {
  let envelope: SaveEnvelope | undefined;
  try {
    envelope = await withStore<SaveEnvelope | undefined>("saves", "readonly", (store) => store.get(SAVE_KEY));
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError("UNKNOWN");
  }

  if (!envelope) return { kind: "vazio" };
  if (typeof envelope.v !== "number" || typeof envelope.checksum !== "string") {
    return { kind: "recusado", reason: "formato" };
  }

  const migrated = migrate(envelope);
  if (migrated) {
    return {
      kind: "migrado",
      state: migrated.state,
      savedAt: envelope.savedAt ?? new Date().toISOString(),
      from: migrated.from,
    };
  }

  const sanitized = sanitizeState(envelope.state);
  if (!sanitized) return { kind: "recusado", reason: "formato" };

  if (signState(sanitized) !== envelope.checksum) {
    return { kind: "recusado", reason: "checksum" };
  }

  return { kind: "ok", state: sanitized, savedAt: envelope.savedAt };
}

export async function writeSave(state: GameState): Promise<void> {
  const envelope: SaveEnvelope = {
    v: SAVE_VERSION,
    checksum: signState(state),
    savedAt: new Date().toISOString(),
    state,
  };
  await withStore<IDBValidKey>("saves", "readwrite", (store) => store.put(envelope, SAVE_KEY));
}

export async function clearSave(): Promise<void> {
  await withStore<undefined>("saves", "readwrite", (store) => store.delete(SAVE_KEY));
}

/** Escrita com atraso, para não gravar a cada tecla. */
export function createAutoSaver(delayMs = 400) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: GameState | undefined;
  let onError: ((error: unknown) => void) | undefined;

  const flush = async () => {
    if (!pending) return;
    const snapshot = pending;
    pending = undefined;
    try {
      await writeSave(snapshot);
    } catch (error) {
      onError?.(error);
    }
  };

  return {
    onError(handler: (error: unknown) => void) {
      onError = handler;
    },
    schedule(state: GameState) {
      pending = state;
      if (timer) clearTimeout(timer);
      timer = setTimeout(flush, delayMs);
    },
    flushNow() {
      if (timer) clearTimeout(timer);
      return flush();
    },
    cancel() {
      if (timer) clearTimeout(timer);
      timer = undefined;
      pending = undefined;
    },
  };
}
