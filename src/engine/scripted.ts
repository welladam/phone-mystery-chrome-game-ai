/**
 * Falas canônicas.
 *
 * Toda linha que carrega pista é escrita à mão em português e entregue
 * diretamente, sem passar pelo modelo nem pela tradução. Isso garante três
 * coisas: o apelido sai exato, os deslizes acontecem quando devem acontecer, e
 * o desfecho não muda de forma se o modelo variar.
 *
 * A IA continua responsável por toda a conversa livre.
 */

import { getCharacter } from "../content/characters/base";
import type { IntentId } from "./intents";
import type { CharacterId, ChatState, GameState } from "./types";

export type ScriptedBeat = {
  id: string;
  lines: string[];
  clueId?: string;
  /** Silêncio narrativo depois da fala, em milissegundos. */
  silenceMs?: number;
  /** Encerra a conversa definitivamente. */
  closes?: boolean;
  /** Texto de rodapé exibido depois de fechar. */
  closingNote?: string;
};

type BeatContext = {
  state: GameState;
  chat: ChatState;
  characterId: CharacterId;
  intents: IntentId[];
  /** Quantas vezes o jogador já perguntou sobre a origem do valor. */
  sourcePresses: number;
};

/* ------------------------------------------------------------------ */
/* Respostas fixas de comportamento                                    */
/* ------------------------------------------------------------------ */

export function metaReply(characterId: CharacterId): ScriptedBeat {
  return { id: `META_${characterId}`, lines: getCharacter(characterId).metaReplies };
}

export function threatReply(characterId: CharacterId): ScriptedBeat {
  const profile = getCharacter(characterId);
  return {
    id: `THREAT_${characterId}_${Date.now()}`,
    lines: profile.threatReplies,
    silenceMs: characterId === "CHAR_003" ? 10 * 60 * 1000 : undefined,
  };
}

/* ------------------------------------------------------------------ */
/* Beats dependentes do ato                                            */
/* ------------------------------------------------------------------ */

/**
 * Beats do contato anônimo, carregados junto com o pacote do Ato 3.
 * Recebem o pacote já resolvido para não forçar import estático do conteúdo.
 */
export type UnknownPack = {
  UNKNOWN_SCRIPTED: {
    nickname: { id: string; lines: string[]; clueId: string };
    coat: { id: string; lines: string[]; clueId: string };
    amount: { id: string; lines: string[]; clueId: string };
    concession: { id: string; lines: string[]; clueId: string };
    recordings: { id: string; lines: string[]; clueId: string };
    nameRefusal: { id: string; lines: string[]; silenceMs: number };
    dialed: { id: string; lines: string[] };
  };
};

export function unknownBeat(pack: UnknownPack, context: BeatContext): ScriptedBeat | undefined {
  const beats = pack.UNKNOWN_SCRIPTED;
  const fired = new Set(context.chat.beats);
  const has = (id: string) => fired.has(id);

  // Escrever o nome da amiga faz o número sumir por seis minutos.
  if (context.intents.includes("INT_016") && !has(beats.nameRefusal.id)) {
    return { ...beats.nameRefusal };
  }

  // Concessão sobre a fonte do valor, na segunda insistência.
  if (context.sourcePresses >= 2 && has(beats.amount.id) && !has(beats.concession.id)) {
    return { ...beats.concession };
  }

  // O valor exato, quando o assunto é o conserto.
  if (context.intents.includes("INT_008") && !has(beats.amount.id)) {
    return { ...beats.amount };
  }

  // O casaco: detalhe que nunca foi divulgado.
  if (
    !has(beats.coat.id) &&
    context.intents.some((intent) => ["INT_002", "INT_003", "INT_014"].includes(intent))
  ) {
    return { ...beats.coat };
  }

  // O apelido só escapa depois de empatia genuína, duas vezes.
  const empathyCount = context.chat.intents.filter((intent) => intent === "INT_013").length;
  const empathyNow = context.intents.includes("INT_013") ? 1 : 0;
  if (!has(beats.nickname.id) && empathyCount + empathyNow >= 2) {
    return { ...beats.nickname };
  }

  // A pergunta obsessiva: aparece sozinha de tempos em tempos.
  if (!has(beats.recordings.id) && context.chat.messages.length >= 6) {
    return { ...beats.recordings };
  }

  return undefined;
}

/* ------------------------------------------------------------------ */
/* Colapsos                                                            */
/* ------------------------------------------------------------------ */

export type CollapsePack = {
  COLLAPSE_LINES: Array<{ at: string; text: string }>;
  COLLAPSE_CLOSING: string;
  COLLAPSE_SILENCE_MS: number;
  UNKNOWN_COLLAPSE_LINES: Array<{ at: string; text: string }>;
  UNKNOWN_COLLAPSE_CLOSING: string;
};

export function collapseBeat(pack: CollapsePack, characterId: CharacterId): ScriptedBeat {
  if (characterId === "CHAR_005") {
    return {
      id: "BEAT_COLLAPSE_UNKNOWN",
      lines: pack.UNKNOWN_COLLAPSE_LINES.map((line) => line.text),
      closes: true,
      closingNote: pack.UNKNOWN_COLLAPSE_CLOSING,
    };
  }
  return {
    id: "BEAT_COLLAPSE",
    lines: pack.COLLAPSE_LINES.map((line) => line.text),
    closes: true,
    closingNote: pack.COLLAPSE_CLOSING,
  };
}

/* ------------------------------------------------------------------ */
/* Abertura                                                            */
/* ------------------------------------------------------------------ */

export function openingBeat(characterId: CharacterId): ScriptedBeat | undefined {
  const profile = getCharacter(characterId);
  if (!profile.openingLines.length) return undefined;
  return { id: `OPEN_${characterId}`, lines: profile.openingLines };
}

/* ------------------------------------------------------------------ */
/* Aviso de vazamento entre personagens                                */
/* ------------------------------------------------------------------ */

/**
 * Contar o atropelamento ao namorado tem consequência: ele liga para a amiga
 * e avisa o perito que ligou. É assim que o contato anônimo fica sabendo que a
 * investigação avançou — sem nenhuma sessão de IA ver a conversa da outra.
 */
export function leakWarning(characterId: CharacterId, intents: IntentId[]): ScriptedBeat | undefined {
  const touched = intents.some((intent) => ["INT_005", "INT_006", "INT_007"].includes(intent));
  if (!touched) return undefined;

  if (characterId === "CHAR_003") {
    return {
      id: "BEAT_LEAK_THEO",
      lines: [
        "cara eu liguei pra lice agora",
        "desculpa",
        "eu surtei, eu precisava falar com alguém",
      ],
      clueId: "CLUE_063",
    };
  }
  if (characterId === "CHAR_002") {
    return {
      id: "BEAT_LEAK_REGINA",
      lines: ["Falei com a Alice hoje.", "Ela tá arrasada. Ela pergunta de você toda hora."],
      clueId: "CLUE_063",
    };
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* A versão oferecida                                                  */
/* ------------------------------------------------------------------ */

/**
 * A amiga entrega, uma vez só e chorando, o caminho de suspeita contra a mãe.
 * É escrito à mão porque carrega pista — e porque o gesto em si é a pista: a
 * única pessoa que oferece uma tese sem ser perguntada é ela.
 */
export function friendSteerBeat(
  characterId: CharacterId,
  context: Pick<BeatContext, "state" | "chat" | "intents">,
): ScriptedBeat | undefined {
  if (characterId !== "CHAR_004") return undefined;
  if (context.state.act < 2) return undefined;
  if (context.chat.beats.includes("BEAT_MOTHER_STEER")) return undefined;

  const asked = context.intents.some((intent) => ["INT_001", "INT_022", "INT_023"].includes(intent));
  const shown = context.chat.presented.some((clue) =>
    ["CLUE_070", "CLUE_071", "CLUE_072", "CLUE_075"].includes(clue),
  );
  if (!asked && !shown) return undefined;

  return {
    id: "BEAT_MOTHER_STEER",
    clueId: "CLUE_074",
    lines: [
      "eu não queria falar isso pra você.",
      "a dona Regina sabia desde janeiro. a Clara contou pra ela e ela mandou a Clara esquecer.",
      "eu só tô falando porque você me perguntou do domingo….",
      "esquece que eu falei, tá? ela já perdeu a filha.",
    ],
  };
}

export function shouldLeakToShared(intents: IntentId[]) {
  return intents.some((intent) => ["INT_005", "INT_006", "INT_007", "INT_011"].includes(intent));
}
