import type { ActNumber, CharacterId } from "../engine/types";

export type PersonKnowledge = {
  /** First act in which the character may speak naturally about the name. */
  fromAct: ActNumber;
  /** The character knows the person but must pretend not to. */
  conceals?: boolean;
};

export type CanonicalPerson = {
  id: string;
  name: string;
  aliases: string[];
  /**
   * Who this person is, in the model's language, so a character can place the
   * name when the examiner says it.
   *
   * Identity only. No dates, no amounts, no relationship that has to be earned,
   * and never the name of someone the reader of this line may not know yet —
   * a roster entry is ungated, so anything gated belongs in `disclosure.ts`.
   */
  role: string;
  knowledge: Partial<Record<CharacterId, PersonKnowledge>>;
};

/**
 * Canonical list of people who may be mentioned in chats.
 *
 * Narrative sources: `docs/BASE_STORY_PART_01.md`, sections 7 and 13, and
 * `docs/BASE_STORY_PART_04.md`, section 25. A name absent from this list is
 * outside the case and must never receive a model-invented biography.
 */
export const CANONICAL_PEOPLE: CanonicalPerson[] = [
  {
    id: "CHAR_001",
    name: "Clara Mendonça Vasques",
    aliases: ["Clara", "Clara Mendonça", "Clara Vasques", "Cacau"],
    role: "the woman who died on 8 March 2026, aged 24, a journalism student and freelance video editor",
    knowledge: {
      CHAR_002: { fromAct: 1 },
      CHAR_003: { fromAct: 1 },
      CHAR_004: { fromAct: 1 },
      CHAR_005: { fromAct: 3 },
    },
  },
  {
    id: "CHAR_002",
    name: "Regina Aparecida Mendonça",
    aliases: ["Regina", "Regina Mendonça", "dona Regina", "mãe da Clara"],
    role: "Clara's mother, 51, a nursing assistant who works night shifts at a hospital",
    knowledge: {
      CHAR_002: { fromAct: 1 },
      CHAR_003: { fromAct: 1 },
      CHAR_004: { fromAct: 1 },
      CHAR_005: { fromAct: 3 },
    },
  },
  {
    id: "CHAR_003",
    name: "Théo Barcellos Ramalho",
    aliases: ["Théo", "Theo", "Théo Barcellos", "Theo Barcellos", "namorado da Clara"],
    role: "Clara's boyfriend of two years and four months, 27, a rideshare driver",
    knowledge: {
      CHAR_002: { fromAct: 1 },
      CHAR_003: { fromAct: 1 },
      CHAR_004: { fromAct: 1 },
      CHAR_005: { fromAct: 3 },
    },
  },
  {
    id: "CHAR_004",
    name: "Alice Bittencourt Fontoura",
    aliases: ["Alice", "Alice Bittencourt", "Alice Fontoura", "Lice", "melhor amiga da Clara"],
    role: "Clara's best friend since they were both thirteen, 24, a newly qualified lawyer",
    knowledge: {
      CHAR_002: { fromAct: 1 },
      CHAR_003: { fromAct: 1 },
      CHAR_004: { fromAct: 1 },
      // The Unknown is Alice but must never acknowledge that connection.
      CHAR_005: { fromAct: 3, conceals: true },
    },
  },
  {
    id: "CHAR_006",
    name: "Wesley Andrade da Silva",
    aliases: ["Wesley", "Wesley Andrade", "Wesley Andrade da Silva"],
    role: "a delivery rider, 27, killed by a car on Barao do Cristal avenue in June 2025",
    knowledge: {
      CHAR_004: { fromAct: 1, conceals: true },
      CHAR_005: { fromAct: 3 },
    },
  },
  {
    id: "CHAR_007",
    name: "Diego Andrade da Silva",
    aliases: ["Diego", "Diego Andrade", "Diego Andrade da Silva", "irmão de Wesley"],
    role: "a man of 31 who drives a school van",
    knowledge: {
      CHAR_004: { fromAct: 3 },
      CHAR_005: { fromAct: 3 },
    },
  },
  {
    id: "CHAR_008",
    name: "Marlene Andrade da Silva",
    aliases: ["Marlene", "Marlene Andrade", "Marlene A da Silva", "mãe de Wesley"],
    role: "a woman of 58 who lives in Juiz de Fora",
    knowledge: {
      CHAR_003: { fromAct: 2 },
      CHAR_004: { fromAct: 2, conceals: true },
      CHAR_005: { fromAct: 3, conceals: true },
    },
  },
  {
    id: "CHAR_009",
    name: "Dra. Yara Trindade",
    aliases: ["Yara", "Yara Trindade", "Dra. Yara", "Dra. Yara Trindade"],
    role: "a criminal lawyer in Juiz de Fora, 44",
    knowledge: {
      CHAR_002: { fromAct: 2 },
      CHAR_004: { fromAct: 2, conceals: true },
      CHAR_005: { fromAct: 3 },
    },
  },
  {
    id: "CHAR_010",
    name: "Lucas Barcellos",
    aliases: ["Lucas", "Lucas Barcellos", "primo do Théo", "primo do Theo"],
    role: "Theo's cousin, 24",
    knowledge: {
      CHAR_003: { fromAct: 2 },
    },
  },
  {
    id: "CHAR_011",
    name: "Delegado Ubiratan Peçanha",
    aliases: ["Ubiratan", "Ubiratan Peçanha", "Delegado Ubiratan", "delegado Peçanha"],
    role: "the police chief who closed the investigation, 55",
    knowledge: {
      CHAR_002: { fromAct: 1 },
      CHAR_003: { fromAct: 1 },
      CHAR_004: { fromAct: 1 },
      CHAR_005: { fromAct: 3 },
    },
  },
  {
    id: "CHAR_012",
    name: "Anselmo Vasques",
    aliases: ["Anselmo", "Anselmo Vasques", "pai da Clara"],
    role: "Clara's father, 56, separated from her mother since 2010 and living in Belo Horizonte",
    knowledge: {
      CHAR_002: { fromAct: 1 },
      CHAR_003: { fromAct: 1 },
      CHAR_004: { fromAct: 1 },
    },
  },
  {
    id: "CHAR_013",
    name: "José Nilton",
    aliases: ["José Nilton", "Jose Nilton", "Zé do Bloco", "Ze do Bloco"],
    role: "a panel beater, 61, who runs a body shop in Benfica",
    knowledge: {
      CHAR_003: { fromAct: 2 },
      CHAR_004: { fromAct: 2, conceals: true },
      CHAR_005: { fromAct: 3 },
    },
  },
  {
    id: "CONTACT_005",
    name: "Nayara",
    aliases: ["Nayara", "Nau"],
    role: "a friend of Clara's from the bar",
    knowledge: {
      CHAR_004: { fromAct: 1 },
    },
  },
  {
    id: "CONTACT_008",
    name: "Dr. Rangel",
    aliases: ["Rangel", "Dr. Rangel", "doutor Rangel", "psiquiatra da Clara"],
    role: "Clara's psychiatrist",
    knowledge: {
      CHAR_002: { fromAct: 1 },
      CHAR_003: { fromAct: 1 },
      CHAR_004: { fromAct: 1 },
    },
  },
  {
    id: "CONTACT_009",
    name: "Tia Sônia",
    aliases: ["Sônia", "Sonia", "Tia Sônia", "Tia Sonia"],
    role: "Clara's aunt",
    knowledge: {
      CHAR_002: { fromAct: 1 },
      CHAR_004: { fromAct: 1 },
    },
  },
  {
    id: "PET_001",
    name: "Fumaça",
    aliases: ["Fumaça", "Fumaca"],
    role: "Clara's stray dog, dead since 2020",
    knowledge: {
      CHAR_002: { fromAct: 1 },
      CHAR_003: { fromAct: 1 },
      CHAR_004: { fromAct: 1 },
    },
  },
];

/**
 * People this character can already put a name to, right now.
 *
 * This table was only ever read as a blocklist. Nothing ever told the model who
 * the permitted people were, and the system prompts name nobody: they say "the
 * boyfriend" and "her best friend". Combined with the rule that forbids stating
 * anything not listed under FACTS YOU MAY USE, a mother asked about her
 * daughter's boyfriend by name answered that she had never heard of him.
 *
 * Recognising a name is not the same as having something to say about it. What
 * a character may reveal is still decided entirely by `disclosure.ts`.
 */
export function knownPeopleFor(characterId: CharacterId, act: ActNumber): string[] {
  return CANONICAL_PEOPLE.filter((person) => {
    // The character does not need to be introduced to themselves.
    if (person.id === characterId) return false;
    const knowledge = person.knowledge[characterId];
    if (!knowledge || act < knowledge.fromAct) return false;
    // Someone the character has to pretend not to know stays off the roster:
    // listing them is an invitation to volunteer the connection. The denial is
    // handled by the name guard when the examiner raises the name.
    return !knowledge.conceals;
  }).map((person) => `${person.name} — ${person.role}`);
}
