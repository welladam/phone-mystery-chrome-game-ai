import { CANONICAL_PEOPLE, type CanonicalPerson } from "../content/people";
import { normalizeText } from "./text";
import type { ActNumber, CharacterId } from "./types";

export type GuardedName = {
  name: string;
  reason: "outside-story" | "unknown-to-character" | "concealed";
};

const NON_PERSON_WORDS = new Set(
  [
    "boa", "bom", "noite", "dia", "tarde", "voce", "voces", "senhor", "senhora", "ela", "ele",
    "isso", "essa", "esse", "aquela", "aquele", "como", "quem", "onde", "quando", "porque", "qual",
    "ainda", "gostaria", "primeiro", "primeiramente", "talvez", "nunca", "entao", "tambem", "sim", "nao",
    "obrigado", "obrigada", "desculpa", "claro", "certo", "quero", "posso", "pode", "preciso", "acabei",
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
  ].map(normalizeText),
);

const CONTEXT_NAME_PATTERNS = [
  /(?:conhece(?:u|ia)?|sobre|chamad[oa]|nome (?:é|e|eh|era))(?:\s+(?:o|a))?\s*[,.:;–—-]?\s*([\p{L}'’-]{3,})/giu,
  /(?:amante|namorad[oa]|amig[oa]|irm[aã]o|advogad[oa])(?:\s+(?:dela|dele|da clara|de clara))?\s*[,.:;–—-]?\s+([\p{L}'’-]{3,})/giu,
  /^([\p{L}'’-]{3,})\s+(?:era|é|e|eh|foi|estava|matou|namorava|conhecia)\b/giu,
  /^([\p{L}'’-]{3,})\s+(?:me\s+)?(?:falou|disse|contou|mandou|ligou|conhece|conheceu|viu|sabe)\b/giu,
];

function titleCase(value: string) {
  return value.charAt(0).toLocaleUpperCase("pt-BR") + value.slice(1).toLocaleLowerCase("pt-BR");
}

function canonicalFor(value: string): CanonicalPerson | undefined {
  const normalized = normalizeText(value);
  return CANONICAL_PEOPLE.find((person) =>
    person.aliases.some((alias) => normalizeText(alias) === normalized),
  );
}

function candidatesFrom(text: string): string[] {
  const candidates: string[] = [];

  for (const match of text.matchAll(/\b[\p{Lu}][\p{L}'’-]{2,}\b/gu)) {
    const candidate = match[0];
    const prefix = text.slice(0, match.index ?? 0);
    const startsSentence = !prefix.trim() || /[.!?]\s*$/.test(prefix);
    const isOnlyWord = normalizeText(text) === normalizeText(candidate);

    // Sentence-initial capitalization is grammatical, not evidence of a name.
    // Canonical names and explicit name contexts are still collected below.
    if (!startsSentence || isOnlyWord || canonicalFor(candidate)) candidates.push(candidate);
  }
  for (const pattern of CONTEXT_NAME_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      if (match[1]) candidates.push(match[1]);
    }
  }

  // Also recognizes canonical names typed entirely in lowercase.
  const normalizedText = ` ${normalizeText(text)} `;
  for (const person of CANONICAL_PEOPLE) {
    for (const alias of person.aliases) {
      const normalizedAlias = normalizeText(alias);
      if (normalizedAlias.length >= 3 && normalizedText.includes(` ${normalizedAlias} `)) {
        candidates.push(alias);
        break;
      }
    }
  }

  return [...new Map(candidates.map((candidate) => [normalizeText(candidate), candidate])).values()]
    .filter((candidate) => {
      const normalized = normalizeText(candidate);
      if (NON_PERSON_WORDS.has(normalized)) return false;
      // "Nau" is Nayara's nickname, but "Bar Nau" is a venue.
      if (normalized === "nau" && normalizedText.includes(" bar nau ")) return false;
      return true;
    });
}

function factsMention(person: CanonicalPerson, facts: string[]) {
  const normalizedFacts = normalizeText(facts.join(" "));
  return person.aliases.some((alias) => normalizedFacts.includes(normalizeText(alias)));
}

/** Returns the first name that cannot reach the model as a trusted fact. */
export function guardPersonMention(
  text: string,
  characterId: CharacterId,
  act: ActNumber,
  facts: string[],
): GuardedName | undefined {
  for (const candidate of candidatesFrom(text)) {
    const person = canonicalFor(candidate);
    if (!person) {
      return { name: titleCase(candidate), reason: "outside-story" };
    }

    // A fact released by the engine always overrides the static list.
    if (factsMention(person, facts)) continue;

    const knowledge = person.knowledge[characterId];
    if (!knowledge || act < knowledge.fromAct) {
      return { name: person.name.split(" ")[0], reason: "unknown-to-character" };
    }
    if (knowledge.conceals) {
      return { name: person.name.split(" ")[0], reason: "concealed" };
    }
  }
  return undefined;
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
