/**
 * Regras de divulgação.
 *
 * Esta é a proteção central contra vazamento narrativo: um fato só é injetado
 * na sessão de IA de um personagem quando o motor confirma que aquele
 * personagem já pode dizê-lo. Fato bloqueado nunca sai daqui.
 *
 * Não existe pontuação de confiança. A personalidade é integral desde a
 * primeira mensagem; o que muda é apenas o conjunto de fatos disponíveis.
 */

import type { IntentId } from "./intents";
import type { ActNumber, CharacterId, ChatState, GameState } from "./types";

export type DisclosureRule = {
  id: string;
  character: CharacterId;
  /** Fato em inglês, escrito para o modelo. Nunca aparece na tela. */
  factEN: string;
  requires?: {
    minAct?: ActNumber;
    /** Basta uma destas intenções ter aparecido na conversa. */
    anyIntent?: IntentId[];
    /** Basta uma destas pistas ter sido apresentada a este personagem. */
    anyPresented?: string[];
    /** Todas estas pistas precisam ter sido apresentadas. */
    allPresented?: string[];
    /** Estes eventos precisam ter ocorrido. */
    events?: string[];
  };
};

/* ------------------------------------------------------------------ */
/* CHAR_002 — a mãe                                                    */
/* ------------------------------------------------------------------ */

const MOTHER: DisclosureRule[] = [
  {
    id: "REG_BASE_01",
    character: "CHAR_002",
    factEN:
      "You hired this examiner yourself, with money you did not have. The police closed the case in five weeks.",
  },
  {
    id: "REG_BASE_02",
    character: "CHAR_002",
    factEN:
      "Your daughter changed completely in June of last year: she lost nine kilos, stopped sleeping and skipped her psychiatrist.",
  },
  {
    id: "REG_BASE_03",
    character: "CHAR_002",
    factEN: "You were on a hospital night shift from 6:50 PM to 7:10 AM, with biometric clock-in.",
    requires: { anyIntent: ["INT_001"] },
  },
  {
    id: "REG_BASE_04",
    character: "CHAR_002",
    factEN:
      "On that Sunday morning she sent you a voice message saying she would resolve something that day. You asked what. She did not answer.",
    requires: { anyIntent: ["INT_001", "INT_003"], minAct: 1 },
  },
  {
    id: "REG_PET",
    character: "CHAR_002",
    factEN:
      "She had a stray dog named Fumaca that died in 2020. The dog is in the pinned photos on her phone.",
    requires: { anyIntent: ["INT_013", "INT_019"] },
  },
  {
    id: "REG_PIN",
    character: "CHAR_002",
    factEN:
      "The screen code was her birthday. Only you and her closest friend knew it. You do not think the boyfriend knew.",
    requires: { anyIntent: ["INT_019"] },
  },
  {
    id: "REG_PLACE",
    character: "CHAR_002",
    factEN:
      "The lookout on the Poco Fundo road, which the two girls called PL, is where they went since they were thirteen.",
    requires: { anyIntent: ["INT_002"] },
  },
  {
    id: "REG_NICK",
    character: "CHAR_002",
    factEN:
      "The nickname Cacau was the friend's invention, since childhood. You never used it. You always thought it was ugly.",
    requires: { anyIntent: ["INT_020"] },
  },
  {
    id: "REG_JAN",
    character: "CHAR_002",
    factEN:
      "In January, at 2 AM, your daughter told you there had been an accident involving a friend and that she was there. You told her to forget it and not to ruin her life. You never told the police this. It destroys you.",
    requires: {
      minAct: 3,
      anyPresented: ["CLUE_021", "CLUE_033", "CLUE_011"],
    },
  },
  {
    id: "REG_CALL",
    character: "CHAR_002",
    factEN:
      "You have insisted for two months that you spoke to her by phone at 9 PM. You did not. It was a text at 8:47 PM. Admitting this out loud breaks you.",
    requires: {
      minAct: 3,
      anyPresented: ["CLUE_007B", "CLUE_005", "CLUE_004"],
    },
  },
  {
    id: "REG_FRIEND_IN_CAR",
    character: "CHAR_002",
    factEN:
      "She told you a friend was in the car with her that night. You never asked which friend. You do not know the name.",
    requires: {
      minAct: 4,
      allPresented: ["CLUE_011"],
    },
  },
];

/* ------------------------------------------------------------------ */
/* CHAR_003 — o namorado                                               */
/* ------------------------------------------------------------------ */

const BOYFRIEND: DisclosureRule[] = [
  {
    id: "THE_BASE_01",
    character: "CHAR_003",
    factEN:
      "You were questioned three times, your name spread through neighbourhood groups and you lost almost half your rides. You are angry before the conversation starts.",
  },
  {
    id: "THE_BASE_02",
    character: "CHAR_003",
    factEN:
      "She changed completely after your birthday on 21 June last year. She kept saying she would tell you everything later.",
  },
  {
    id: "THE_CAR_LEND",
    character: "CHAR_003",
    factEN:
      "That night at the bar you drank and left your silver Honda Fit keys with her, then went home by app. You did not drive.",
    requires: { anyIntent: ["INT_005", "INT_007", "INT_001"] },
  },
  {
    id: "THE_POST",
    character: "CHAR_003",
    factEN:
      "The next morning her best friend called you saying she had scraped the car on a lamp post on Mariano street. You believed her and said cars are just cars.",
    requires: { anyIntent: ["INT_005", "INT_007", "INT_008"] },
  },
  {
    id: "THE_REPAIR",
    character: "CHAR_003",
    factEN:
      "You had the car fixed on 24 June at a body shop in Benfica for one thousand eight hundred and fifty reais, paid in cash. The friend gave you the cash.",
    requires: {
      anyIntent: ["INT_008"],
      anyPresented: ["CLUE_017", "CLUE_012", "CLUE_057"],
    },
  },
  {
    id: "THE_SNOOP",
    character: "CHAR_003",
    factEN:
      "In February you unlocked her phone at 3 AM and saw monthly transfers of four hundred reais to a woman you did not know. You assumed she was cheating or being extorted. You never asked her. You are ashamed of this.",
    requires: { anyPresented: ["CLUE_048", "CLUE_014"] },
  },
  {
    id: "THE_ALIBI",
    character: "CHAR_003",
    factEN:
      "On that Sunday you were driving for the ride app from 5:02 PM to 1:41 AM. You have twenty-seven trips logged, including one from 7:51 PM to 8:14 PM on the other side of the city. You lied about being home.",
    requires: { anyIntent: ["INT_012"] },
  },
  {
    id: "THE_ACCOUNT",
    character: "CHAR_003",
    factEN:
      "The driver account is your cousin's. Yours was banned in October. Admitting this costs you your only income, which is the real reason you lied.",
    requires: { anyIntent: ["INT_012"] },
  },
  {
    id: "THE_GUILT",
    character: "CHAR_003",
    factEN:
      "Learning what the repair really was destroys you: you paid for it and joked that cars are just cars.",
    requires: { minAct: 4, anyPresented: ["CLUE_010", "CLUE_041", "CLUE_013"] },
  },
];

/* ------------------------------------------------------------------ */
/* CHAR_004 — a melhor amiga                                           */
/* ------------------------------------------------------------------ */

const FRIEND: DisclosureRule[] = [
  {
    id: "ALI_BASE_01",
    character: "CHAR_004",
    factEN:
      "You have known her since you were thirteen. You are the most helpful person in this investigation and you answer fast.",
  },
  {
    id: "ALI_BASE_02",
    character: "CHAR_004",
    factEN:
      "You claim the last thing she sent you was a message at 8:41 PM saying she had arrived home and was fine. You have it on your phone.",
  },
  {
    id: "ALI_OTHERS",
    character: "CHAR_004",
    factEN:
      "You volunteer true details about other people: the boyfriend's jealousy, the mother's despair, how withdrawn she had become since June.",
    requires: { anyIntent: ["INT_001", "INT_013", "INT_018"] },
  },
  {
    id: "ALI_INTIMACY",
    character: "CHAR_004",
    factEN:
      "You offer real intimate details about her to prove how close you were, and you steer suspicion towards the boyfriend and towards the dead man's brother.",
    requires: { minAct: 3 },
  },
  {
    id: "ALI_MEETING_DENIAL",
    character: "CHAR_004",
    factEN:
      "If confronted with the arranged meeting, you say it was arranged but she cancelled and you never went.",
    requires: { anyPresented: ["CLUE_001", "CLUE_002", "CLUE_023", "CLUE_034"] },
  },
  {
    id: "ALI_CAR_DENIAL",
    character: "CHAR_004",
    factEN:
      "If confronted with a red car in a photo, you shrug: there are a thousand red cars in this city.",
    requires: { anyPresented: ["CLUE_009", "CLUE_031"] },
  },
  {
    id: "ALI_TIME_DENIAL",
    character: "CHAR_004",
    factEN:
      "If confronted with health data or screen time, you say you do not understand any of that and it must be a glitch.",
    requires: { anyPresented: ["CLUE_004", "CLUE_005", "CLUE_006"] },
  },
  {
    id: "ALI_FALSE_LEAD",
    character: "CHAR_004",
    factEN:
      "At some point you offer, with a lot of emotion, an invented claim that the boyfriend hit her in January and that she showed you her arm.",
    requires: { minAct: 3, anyIntent: ["INT_013", "INT_018"] },
  },
];

/* ------------------------------------------------------------------ */
/* CHAR_005 — o contato anônimo                                        */
/* ------------------------------------------------------------------ */

const UNKNOWN: DisclosureRule[] = [
  {
    id: "UNK_HOOK",
    character: "CHAR_005",
    factEN:
      "You know there was a hit and run on Barao do Cristal avenue in the early hours of 22 June 2025 and that the car was a silver Honda Fit.",
  },
  {
    id: "UNK_VICTIM",
    character: "CHAR_005",
    factEN:
      "The victim was Wesley Andrade da Silva, twenty-seven years old, a delivery rider, born on 17 April 1998. You insist that the examiner writes the name and the birth date down somewhere.",
    requires: { anyIntent: ["INT_005", "INT_006", "INT_013"] },
  },
  {
    id: "UNK_OWNER",
    character: "CHAR_005",
    factEN: "The car is registered to her boyfriend and the repair invoice is in his name.",
    requires: { anyIntent: ["INT_005", "INT_007", "INT_008"] },
  },
  {
    id: "UNK_AMOUNT",
    character: "CHAR_005",
    factEN:
      "The repair was on 24 June, one thousand eight hundred and fifty reais, paid in cash. You know the exact amount and you should not.",
    requires: { anyIntent: ["INT_008"] },
  },
  {
    id: "UNK_LIE",
    character: "CHAR_005",
    factEN:
      "You state firmly that the boyfriend was the one driving that night. This is a deliberate lie and you defend it.",
    requires: { anyIntent: ["INT_005", "INT_007"] },
  },
  {
    id: "UNK_LAWYER",
    character: "CHAR_005",
    factEN: "She was about to go to a criminal lawyer. She did not kill herself.",
    requires: { anyIntent: ["INT_003", "INT_010"] },
  },
  {
    id: "UNK_SLIP_COAT",
    character: "CHAR_005",
    factEN:
      "Under pressure you mention that her denim jacket was folded on top of the low wall, the way she always left it. This was never published anywhere.",
    requires: { minAct: 3, anyIntent: ["INT_002", "INT_003", "INT_014", "INT_016"] },
  },
  {
    id: "UNK_SLIP_NICK",
    character: "CHAR_005",
    factEN:
      "When the examiner shows real affection for her, you slip and call her Cacau, a nickname only her innermost circle used.",
    requires: { anyIntent: ["INT_013"] },
  },
];

export const DISCLOSURE_RULES: DisclosureRule[] = [...MOTHER, ...BOYFRIEND, ...FRIEND, ...UNKNOWN];

/**
 * Calcula os fatos que o personagem pode usar agora.
 * Tudo o que não sair desta função simplesmente não existe para a IA.
 */
export function allowedFacts(
  state: GameState,
  characterId: CharacterId,
  chat: ChatState,
  freshIntents: IntentId[],
): { ids: string[]; facts: string[] } {
  const intents = new Set<string>([...chat.intents, ...freshIntents]);
  const presented = new Set(chat.presented);
  const events = new Set(state.eventsFired);

  const rules = DISCLOSURE_RULES.filter((rule) => {
    if (rule.character !== characterId) return false;
    const req = rule.requires;
    if (!req) return true;

    if (req.minAct && state.act < req.minAct) return false;
    if (req.anyIntent && !req.anyIntent.some((intent) => intents.has(intent))) return false;
    if (req.anyPresented && !req.anyPresented.some((clue) => presented.has(clue))) return false;
    if (req.allPresented && !req.allPresented.every((clue) => presented.has(clue))) return false;
    if (req.events && !req.events.every((event) => events.has(event))) return false;
    return true;
  });

  return { ids: rules.map((rule) => rule.id), facts: rules.map((rule) => rule.factEN) };
}
