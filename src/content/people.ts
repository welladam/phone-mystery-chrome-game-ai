import type { ActNumber, CharacterId } from "../engine/types";

export type PersonKnowledge = {
  /** Primeiro ato em que o personagem pode falar naturalmente sobre o nome. */
  fromAct: ActNumber;
  /** O personagem conhece a pessoa, mas precisa fingir que não conhece. */
  conceals?: boolean;
};

export type CanonicalPerson = {
  id: string;
  name: string;
  aliases: string[];
  knowledge: Partial<Record<CharacterId, PersonKnowledge>>;
};

/**
 * Lista canônica de pessoas mencionáveis nos chats.
 *
 * Fonte narrativa: `docs/BASE_STORY_PART_01.md`, seções 7 e 13, e
 * `docs/BASE_STORY_PART_04.md`, seção 25. Um nome ausente daqui é externo ao
 * caso e nunca deve ganhar biografia improvisada do modelo.
 */
export const CANONICAL_PEOPLE: CanonicalPerson[] = [
  {
    id: "CHAR_001",
    name: "Clara Mendonça Vasques",
    aliases: ["Clara", "Clara Mendonça", "Clara Vasques", "Cacau"],
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
    knowledge: {
      CHAR_002: { fromAct: 1 },
      CHAR_003: { fromAct: 1 },
      CHAR_004: { fromAct: 1 },
      // A Desconhecida é Alice, mas nunca pode reconhecer essa ligação.
      CHAR_005: { fromAct: 3, conceals: true },
    },
  },
  {
    id: "CHAR_006",
    name: "Wesley Andrade da Silva",
    aliases: ["Wesley", "Wesley Andrade", "Wesley Andrade da Silva"],
    knowledge: {
      CHAR_004: { fromAct: 1, conceals: true },
      CHAR_005: { fromAct: 3 },
    },
  },
  {
    id: "CHAR_007",
    name: "Diego Andrade da Silva",
    aliases: ["Diego", "Diego Andrade", "Diego Andrade da Silva", "irmão de Wesley"],
    knowledge: {
      CHAR_004: { fromAct: 3 },
      CHAR_005: { fromAct: 3 },
    },
  },
  {
    id: "CHAR_008",
    name: "Marlene Andrade da Silva",
    aliases: ["Marlene", "Marlene Andrade", "Marlene A da Silva", "mãe de Wesley"],
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
    knowledge: {
      CHAR_003: { fromAct: 2 },
    },
  },
  {
    id: "CHAR_011",
    name: "Delegado Ubiratan Peçanha",
    aliases: ["Ubiratan", "Ubiratan Peçanha", "Delegado Ubiratan", "delegado Peçanha"],
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
    knowledge: {
      CHAR_004: { fromAct: 1 },
    },
  },
  {
    id: "CONTACT_008",
    name: "Dr. Rangel",
    aliases: ["Rangel", "Dr. Rangel", "doutor Rangel", "psiquiatra da Clara"],
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
    knowledge: {
      CHAR_002: { fromAct: 1 },
      CHAR_004: { fromAct: 1 },
    },
  },
  {
    id: "PET_001",
    name: "Fumaça",
    aliases: ["Fumaça", "Fumaca"],
    knowledge: {
      CHAR_002: { fromAct: 1 },
      CHAR_003: { fromAct: 1 },
      CHAR_004: { fromAct: 1 },
    },
  },
];
