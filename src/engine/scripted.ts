/**
 * Canonical lines.
 *
 * Every clue-bearing line is hand-written in Portuguese and delivered directly,
 * without passing through the model or translation. This guarantees that the
 * nickname is exact, slips happen at the intended moment, and the ending does
 * not change shape when the model varies.
 *
 * AI remains responsible for all free-form conversation.
 */

import { getCharacter } from "../content/characters/base";
import type { IntentId } from "./intents";
import type { CharacterId, ChatState, GameState } from "./types";

export type ScriptedBeat = {
  id: string;
  lines: string[];
  clueId?: string;
  /** Narrative silence after the line, in milliseconds. */
  silenceMs?: number;
  /** Permanently ends the conversation. */
  closes?: boolean;
  /** Footer text displayed after closing. */
  closingNote?: string;
};

type BeatContext = {
  state: GameState;
  chat: ChatState;
  characterId: CharacterId;
  intents: IntentId[];
  /** Number of times the player has asked about the source of the amount. */
  sourcePresses: number;
};

/* ------------------------------------------------------------------ */
/* Fixed behavioral responses                                         */
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
/* Act-dependent beats                                                 */
/* ------------------------------------------------------------------ */

/**
 * Anonymous-contact beats loaded with the Act 3 package. They receive the
 * resolved package to avoid forcing a static content import.
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

  // Writing the friend's name makes the number disappear for six minutes.
  if (context.intents.includes("INT_016") && !has(beats.nameRefusal.id)) {
    return { ...beats.nameRefusal };
  }

  // Concession about the source of the amount after the second insistence.
  if (context.sourcePresses >= 2 && has(beats.amount.id) && !has(beats.concession.id)) {
    return { ...beats.concession };
  }

  // The exact amount when the subject is the repair.
  if (context.intents.includes("INT_008") && !has(beats.amount.id)) {
    return { ...beats.amount };
  }

  // The coat: a detail that was never disclosed.
  if (
    !has(beats.coat.id) &&
    context.intents.some((intent) => ["INT_002", "INT_003", "INT_014"].includes(intent))
  ) {
    return { ...beats.coat };
  }

  // The nickname slips out only after genuine empathy, twice.
  const empathyCount = context.chat.intents.filter((intent) => intent === "INT_013").length;
  const empathyNow = context.intents.includes("INT_013") ? 1 : 0;
  if (!has(beats.nickname.id) && empathyCount + empathyNow >= 2) {
    return { ...beats.nickname };
  }

  // The obsessive question appears on its own from time to time.
  if (!has(beats.recordings.id) && context.chat.messages.length >= 6) {
    return { ...beats.recordings };
  }

  return undefined;
}

/* ------------------------------------------------------------------ */
/* Collapses                                                           */
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
/* Opening                                                             */
/* ------------------------------------------------------------------ */

export function openingBeat(characterId: CharacterId): ScriptedBeat | undefined {
  const profile = getCharacter(characterId);
  if (!profile.openingLines.length) return undefined;
  return { id: `OPEN_${characterId}`, lines: profile.openingLines };
}

/* ------------------------------------------------------------------ */
/* Cross-character leak warning                                       */
/* ------------------------------------------------------------------ */

/**
 * Telling the boyfriend about the hit-and-run has consequences: he calls the
 * friend and warns her that the investigator called. This is how the anonymous
 * contact learns the investigation advanced—without either AI session seeing
 * the other's conversation.
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
/* The volunteered theory                                              */
/* ------------------------------------------------------------------ */

/**
 * The friend tearfully offers the path of suspicion against the mother once.
 * It is hand-written because it carries a clue—and because the gesture itself
 * is the clue: she is the only person who offers a theory without being asked.
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
