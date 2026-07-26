/**
 * Name guard.
 *
 * Decides whether a name written by the player may reach the model. The cost of
 * the two possible mistakes is not symmetric:
 *
 * - A missed name lets an unverified claim through, where the grounding rules
 *   in the system prompt still apply and the character is told to invent nothing.
 * - A false positive makes the character deny a word that was never a name.
 *   "A Alice é amiga dela" answered with "Dela? Não conheço ninguém com esse
 *   nome" is the whole illusion collapsing in one line.
 *
 * So detection is deliberately conservative. Capitalisation is the primary
 * signal, and only a candidate that actually looks like a name may be declared
 * foreign to the story.
 */

import { CANONICAL_PEOPLE, type CanonicalPerson } from "../content/people";
import { normalizeText } from "./text";
import type { ActNumber, CharacterId } from "./types";

export type GuardedName = {
  name: string;
  reason: "outside-story" | "unknown-to-character" | "concealed";
};

/**
 * Words that are never a person.
 *
 * The first block is story vocabulary: places, brands, apps and roles that the
 * player types capitalised. The second is the closed class of Portuguese
 * function words, which is finite and therefore worth listing.
 *
 * Verbs are deliberately absent. They used to leak through the context patterns
 * below ("o namorado dela sabia?" produced the name "Sabia"), and no list of
 * Portuguese verb forms would ever be complete. That leak is closed by
 * requiring capitalisation instead.
 */
const NON_PERSON_WORDS = new Set(
  [
    /* Story vocabulary. */
    "boa", "bom", "noite", "dia", "tarde", "senhor", "senhora",
    "obrigado", "obrigada", "desculpa", "claro", "certo",
    "hoje", "ontem", "amanha", "domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado",
    "janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro",
    "outubro", "novembro", "dezembro", "policia", "delegado", "doutora", "doutor", "dra", "dr",
    "amante", "namorado", "namorada", "amigo", "amiga", "irmao", "irma", "mae", "pai", "advogada",
    "clara", "juiz", "fora", "barao", "cristal", "pedra", "lascada", "mirante", "poco", "fundo",
    "hospital", "santa", "clarice", "ufjf", "barbacena", "benfica", "rodoviaria", "chrome",
    "vinculo", "galeria", "agenda", "telefone", "pulso", "ajustes", "correio", "orbita", "bloco",
    "rumo", "nimbo", "drive", "banco", "aurora", "vello", "fluxo", "chave", "feito", "notificacoes",
    "avenida", "rua", "bar", "bairro", "praca", "estrada", "rodovia", "coronel", "vidal", "mariano",
    "sete", "lagoas", "pastor", "terezinha", "espirito", "santo", "sao", "mateus", "ato", "app",
    "aplicativo", "foto", "audio", "honda", "fit", "renault", "kwid", "fiat", "mobi", "pix", "cpf",
    "pin", "gps", "oab", "whatsapp", "instagram", "tribuna", "vale", "funilaria",

    /* Personal pronouns and preposition contractions. */
    "eu", "tu", "voce", "voces", "ele", "ela", "eles", "elas", "nos", "vos",
    "dele", "dela", "deles", "delas", "nele", "nela", "neles", "nelas",
    "mim", "ti", "lhe", "lhes", "comigo", "contigo", "consigo", "conosco", "convosco",
    "meu", "minha", "meus", "minhas", "teu", "tua", "teus", "tuas",
    "seu", "sua", "seus", "suas", "nosso", "nossa", "nossos", "nossas",

    /* Demonstratives and their contractions. */
    "este", "esta", "estes", "estas", "isto", "esse", "essa", "esses", "essas", "isso",
    "aquele", "aquela", "aqueles", "aquelas", "aquilo",
    "deste", "desta", "destes", "destas", "disto", "desse", "dessa", "desses", "dessas", "disso",
    "daquele", "daquela", "daqueles", "daquelas", "daquilo",
    "neste", "nesta", "nestes", "nestas", "nisto", "nesse", "nessa", "nesses", "nessas", "nisso",
    "naquele", "naquela", "naqueles", "naquelas", "naquilo",

    /* Indefinites and quantifiers. */
    "alguem", "ninguem", "algo", "nada", "tudo", "todo", "toda", "todos", "todas",
    "outro", "outra", "outros", "outras", "qualquer", "quaisquer", "cada",
    "algum", "alguma", "alguns", "algumas", "nenhum", "nenhuma", "nenhuns", "nenhumas",
    "muito", "muita", "muitos", "muitas", "pouco", "pouca", "poucos", "poucas",
    "varios", "varias", "tanto", "tanta", "tantos", "tantas",
    "mesmo", "mesma", "mesmos", "mesmas", "proprio", "propria", "proprios", "proprias",

    /* Interrogatives, relatives and connectives. */
    "que", "quem", "qual", "quais", "quanto", "quanta", "quantos", "quantas",
    "onde", "aonde", "como", "quando", "porque", "porquê", "cujo", "cuja", "cujos", "cujas",
    "sim", "nao", "talvez", "ainda", "entao", "tambem", "nunca", "sempre", "agora",
    "primeiro", "primeiramente", "gostaria", "quero", "posso", "pode", "preciso", "acabei",
  ].map(normalizeText),
);

const CONTEXT_NAME_PATTERNS = [
  /(?:conhece(?:u|ia)?|sobre|chamad[oa]|nome (?:é|e|eh|era))(?:\s+(?:o|a))?\s*[,.:;–—-]?\s*([\p{L}'’-]{3,})/giu,
  /(?:amante|namorad[oa]|amig[oa]|irm[aã]o|advogad[oa])(?:\s+(?:dela|dele|da clara|de clara))?\s*[,.:;–—-]?\s+([\p{L}'’-]{3,})/giu,
  /^([\p{L}'’-]{3,})\s+(?:era|é|e|eh|foi|estava|matou|namorava|conhecia)\b/giu,
  /^([\p{L}'’-]{3,})\s+(?:me\s+)?(?:falou|disse|contou|mandou|ligou|conhece|conheceu|viu|sabe)\b/giu,
];

/**
 * A candidate strong enough to be treated as a name on its own.
 *
 * Weak candidates come from the context patterns above without capitalisation.
 * They may still confirm someone the case already knows — the player often
 * types "conhece wesley?" in lower case — but they can never establish that a
 * new person exists.
 */
type Candidate = { value: string; strong: boolean };

function titleCase(value: string) {
  return value.charAt(0).toLocaleUpperCase("pt-BR") + value.slice(1).toLocaleLowerCase("pt-BR");
}

/** Honorifics that precede a name in the canonical list and are not the name. */
const TITLES = new Set(
  ["dr", "dra", "doutor", "doutora", "sr", "sra", "senhor", "senhora", "dona", "dom",
   "delegado", "delegada", "tia", "tio", "professor", "professora", "padre", "seu"].map(normalizeText),
);

/**
 * The name the character says out loud. Taking the first token blindly turned
 * "Dra. Yara Trindade" into a character denying ever having heard of "Dra.".
 */
function spokenName(person: CanonicalPerson): string {
  const parts = person.name.split(/\s+/).filter(Boolean);
  const first = parts.find((part) => !TITLES.has(normalizeText(part.replace(/\.$/, ""))));
  return first ?? parts[0] ?? person.name;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function canonicalFor(value: string): CanonicalPerson | undefined {
  const normalized = normalizeText(value);
  return CANONICAL_PEOPLE.find((person) =>
    person.aliases.some((alias) => normalizeText(alias) === normalized),
  );
}

/**
 * Word-boundary match on normalized text. Padding with spaces used to miss any
 * alias touching punctuation, so "conhece wesley?" went undetected.
 */
function mentionsAlias(normalizedText: string, alias: string): boolean {
  const normalizedAlias = normalizeText(alias);
  if (normalizedAlias.length < 3) return false;
  const pattern = new RegExp(`(?<![\\p{L}\\d])${escapeRegExp(normalizedAlias)}(?![\\p{L}\\d])`, "u");
  return pattern.test(normalizedText);
}

function candidatesFrom(text: string): Candidate[] {
  const normalizedText = normalizeText(text);
  const found = new Map<string, Candidate>();

  const add = (value: string, strong: boolean) => {
    const key = normalizeText(value);
    if (!key || NON_PERSON_WORDS.has(key)) return;
    // "Nau" is Nayara's nickname, but "Bar Nau" is a venue.
    if (key === "nau" && mentionsAlias(normalizedText, "bar nau")) return;

    const existing = found.get(key);
    if (existing) {
      // Seen capitalised anywhere in the message is enough to promote it.
      if (strong) existing.strong = true;
      return;
    }
    found.set(key, { value, strong });
  };

  for (const match of text.matchAll(/\b[\p{Lu}][\p{L}'’-]{2,}\b/gu)) {
    const candidate = match[0];
    const prefix = text.slice(0, match.index ?? 0);
    const startsSentence = !prefix.trim() || /[.!?]\s*$/.test(prefix);
    const isOnlyWord = normalizeText(text) === normalizeText(candidate);

    // Sentence-initial capitalization is grammatical, not evidence of a name.
    // Canonical names and explicit name contexts are still collected below.
    if (!startsSentence || isOnlyWord || canonicalFor(candidate)) add(candidate, true);
  }

  for (const pattern of CONTEXT_NAME_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const captured = match[1];
      if (!captured) continue;
      // These patterns fire on "amiga dela contou" exactly as readily as on
      // "amiga Nayara". Lower case here is a pronoun or a verb far more often
      // than it is a name, so it only counts as a hint.
      add(captured, /^\p{Lu}/u.test(captured));
    }
  }

  // Canonical names typed entirely in lower case are always recognized.
  for (const person of CANONICAL_PEOPLE) {
    for (const alias of person.aliases) {
      if (mentionsAlias(normalizedText, alias)) {
        add(alias, true);
        break;
      }
    }
  }

  return [...found.values()];
}

/** Returns the first name that cannot reach the model as a trusted fact. */
export function guardPersonMention(
  text: string,
  characterId: CharacterId,
  act: ActNumber,
  facts: string[],
): GuardedName | undefined {
  const candidates = candidatesFrom(text);

  // People the case knows come first. A message that names someone real has to
  // be judged by what this character may say about them, not derailed by some
  // unrelated token sitting elsewhere in the same sentence.
  for (const candidate of candidates) {
    const person = canonicalFor(candidate.value);
    if (!person) continue;

    // A fact released by the engine always overrides the static list.
    if (factsMention(person, facts)) continue;

    const knowledge = person.knowledge[characterId];
    if (!knowledge || act < knowledge.fromAct) {
      return { name: spokenName(person), reason: "unknown-to-character" };
    }
    if (knowledge.conceals) {
      return { name: spokenName(person), reason: "concealed" };
    }
  }

  // Declaring a word foreign to the story produces a flat denial, so it takes a
  // candidate that genuinely looks like a name. Anything weaker goes to the
  // model, where the grounding rules already forbid inventing people.
  for (const candidate of candidates) {
    if (!candidate.strong) continue;
    if (canonicalFor(candidate.value)) continue;
    return { name: titleCase(candidate.value), reason: "outside-story" };
  }

  return undefined;
}

function factsMention(person: CanonicalPerson, facts: string[]) {
  const normalizedFacts = normalizeText(facts.join(" "));
  return person.aliases.some((alias) => normalizedFacts.includes(normalizeText(alias)));
}

/**
 * Instruction injected as a fact so the denial is performed by the character
 * instead of replayed from a fixed line.
 *
 * Only names that already exist in the case reach this function. A name from
 * outside the story keeps the deterministic reply, because there the risk is
 * not repetition—it is the model inventing a biography for someone who does
 * not exist.
 */
export function guardedNameFact(guarded: GuardedName): string {
  if (guarded.reason === "concealed") {
    return [
      `The examiner has named ${guarded.name}. You do know who that is, and you must never admit it.`,
      "Deny the connection in your own voice and move the conversation somewhere else.",
      "Vary the deflection every single time: a name you half recognise, someone from work, someone you might have crossed paths with once, a client, a name you have heard around. Never reuse a denial you have already given in this conversation.",
      "If the examiner says they have seen messages, photos or proof, do not concede anything: ask what exactly they saw and who handed it to them.",
      "Never explain how you know the name, never say when you last saw them, and never volunteer any detail about this person.",
    ].join(" ");
  }
  return [
    `The examiner has named ${guarded.name}. You have never heard this name and it means nothing to you.`,
    "Say so in your own voice, phrased differently each time, and ask where it came from.",
    "Invent nothing about this person: no age, no job, no relationship, no story, not even a guess.",
  ].join(" ");
}

/** Deterministic response; no invented detail is sent or accepted. */
export function guardedNameReply(characterId: CharacterId, name: string): string[] {
  switch (characterId) {
    case "CHAR_002":
      return [`${name}? Não conheço ninguém com esse nome ligado à Clara.`, "De onde saiu essa informação?"];
    case "CHAR_003":
      return [`${name.toLocaleLowerCase("pt-BR")} quem`, "nunca ouvi a clara falar desse nome", "de onde vc tirou isso"];
    case "CHAR_004":
      return [`${name.toLocaleLowerCase("pt-BR")}? ai, não conheço ninguém com esse nome, amor`, "quem te falou isso?"];
    case "CHAR_005":
      return ["Esse nome não me diz nada.", "Por que você está perguntando?"];
  }
}
