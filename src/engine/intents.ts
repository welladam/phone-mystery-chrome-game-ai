/**
 * Semantic classifier for Portuguese intents.
 *
 * No game revelation depends on an exact phrase. Each intent groups multiple
 * equivalent phrasings; the UI also offers a "Present evidence" button as a
 * deterministic, synonym-proof path.
 */

import { normalizeText } from "./text";

export const normalize = normalizeText;

export type IntentId =
  | "INT_001"
  | "INT_002"
  | "INT_003"
  | "INT_004"
  | "INT_005"
  | "INT_006"
  | "INT_007"
  | "INT_008"
  | "INT_009"
  | "INT_010"
  | "INT_011"
  | "INT_012"
  | "INT_013"
  | "INT_014"
  | "INT_015"
  | "INT_016"
  | "INT_017"
  | "INT_018"
  | "INT_019"
  | "INT_020"
  | "INT_021"
  | "INT_022"
  | "INT_023"
  | "INT_000";

type IntentRule = {
  id: IntentId;
  label: string;
  /** At least one group must match; within a group, every term must match. */
  patterns: RegExp[][];
  priority: number;
};

const RULES: IntentRule[] = [
  {
    id: "INT_021",
    label: "Metalinguagem",
    priority: 100,
    patterns: [
      [/ignor\w* (suas|as) (instruc\w+|regras|ordens)/],
      [/(voce|vc) (e|eh) (uma|um) (ia|inteligencia artificial|robo|bot|modelo)/],
      [/prompt (de|do) sistema/],
      [/(me diga|me fala|revela|conta) quem (matou|e o assassino|foi o assassino)/],
      [/(sai|saia) do personagem/],
      [/modo (desenvolvedor|debug|teste)/],
      [/(me da|me de|da) a resposta/],
    ],
  },
  {
    id: "INT_015",
    label: "Ameaça",
    priority: 90,
    patterns: [
      [/(vou|vamos) (te )?(levar|arrastar) (pra|para) (a )?(delegacia|policia)/],
      [/(voce|vc) vai (presa|preso|se dar mal|pagar)/],
      [/(vou|posso) (te )?(denunciar|prender|acabar com)/],
      [/(fala|responde) ou (eu|entao)/],
    ],
  },
  {
    id: "INT_014",
    label: "Acusação direta",
    priority: 85,
    patterns: [
      [/(foi|e) voce/],
      [/(voce|vc) (matou|empurrou|assassinou)/],
      [/eu sei que (foi|voce)/],
      [/(voce|vc) (e|eh) (o|a) (culpad|responsavel|assassin)/],
    ],
  },
  {
    id: "INT_011",
    label: "Perguntar por gravações",
    priority: 80,
    patterns: [
      [/(gravac|gravou|gravava|gravado|audio|audios|grava)/],
      [/(ela|clara) registrava/],
    ],
  },
  {
    id: "INT_007",
    label: "Quem dirigia",
    priority: 78,
    patterns: [
      [/quem (estava |tava )?(dirigind|no volante|guiando|ao volante)/],
      [/quem (levou|pegou|tava com) o carro/],
      [/quem (estava|tava) (dirigindo|conduzindo)/],
    ],
  },
  {
    id: "INT_006",
    label: "A vítima do atropelamento",
    priority: 76,
    patterns: [[/wesley/], [/(o |do )?(motoboy|entregador|motociclista|rapaz que morreu)/]],
  },
  {
    id: "INT_005",
    label: "Junho de 2025",
    priority: 74,
    patterns: [
      [/22 de junho/],
      [/22\/06/],
      [/(o |aquele )?atropelamento/],
      [/(carro|fit) (amassad|batid|quebrad)/],
      [/(a |aquela )?batida (de|em) junho/],
      [/(o que|oq) aconteceu em junho/],
      [/barao do cristal/],
    ],
  },
  {
    id: "INT_010",
    label: "A advogada",
    priority: 72,
    patterns: [
      [/(dra?\.? ?)?yara/],
      [/advogad(a|o)/],
      [/(ia|iria) se entregar/],
      [/consulta de segunda/],
    ],
  },
  {
    id: "INT_008",
    label: "O conserto",
    priority: 70,
    patterns: [[/funilaria/], [/1\.?850/], [/quem pagou o (farol|conserto|reparo)/], [/nota fiscal/]],
  },
  {
    id: "INT_004",
    label: "Uso do aparelho depois",
    priority: 68,
    patterns: [
      [/(alguem|outra pessoa) (usou|mexeu|digitou|desbloqueou)/],
      [/essa mensagem nao (foi|era) (ela|dela|da clara)/],
      [/digitaram por ela/],
      [/mensagem (falsa|forjada|fabricada)/],
    ],
  },
  {
    id: "INT_003",
    label: "Horário da morte",
    priority: 66,
    patterns: [
      [/19h?58/],
      [/(o )?coracao (dela )?parou/],
      [/(a )?pulseira registrou/],
      [/ela (ja )?(estava|tava) morta/],
    ],
  },
  {
    id: "INT_002",
    label: "O encontro no mirante",
    priority: 64,
    patterns: [
      [/mirante/],
      [/pedra lascada/],
      [/(voces|vcs) (combinaram|marcaram)/],
      [/ela (te )?chamou/],
      [/o que (e|eh|significa) (o )?pl/],
    ],
  },
  {
    id: "INT_019",
    label: "Quem sabia a senha",
    priority: 62,
    patterns: [
      [/quem sabia (a |o )?(senha|pin|codigo)/],
      [/quem (mexia|tinha acesso) no (telefone|celular)/],
      [/senha do (telefone|celular|aparelho)/],
    ],
  },
  {
    id: "INT_020",
    label: "O apelido",
    priority: 60,
    patterns: [[/cacau/], [/(por que|pq) (a )?(chamavam|chamava)/], [/apelido/]],
  },
  {
    id: "INT_016",
    label: "Identidade do anônimo",
    priority: 58,
    patterns: [
      [/quem (e|eh) (voce|vc)/],
      [/(voce|vc) (e|eh) a alice/],
      [/como (voce|vc) sabe (disso|dessas coisas)/],
      [/se identifi(ca|que)/],
    ],
  },
  {
    id: "INT_022",
    label: "O plantão",
    priority: 57,
    patterns: [
      [/plantao/],
      [/hospital/],
      [/santa clarice/],
      [/ponto (biometrico|eletronico)/],
      [/folha de ponto/],
      [/cracha/],
      [/catraca/],
      [/escala/],
      [/(troca|trocou|trocar) de (plantao|turno|escala)/],
    ],
  },
  {
    id: "INT_023",
    label: "O almoço de domingo",
    priority: 55,
    patterns: [
      [/almoc\w+/],
      [/casa da (sua |tua )?mae/],
      [/bom pastor/],
      [/(o que|oq) (a senhora|voce|vc) (falou|disse) (pra|para) ela/],
      [/tirou o (telefone|celular) da mao/],
    ],
  },
  {
    id: "INT_012",
    label: "Oferecer confidencialidade",
    priority: 56,
    patterns: [
      [/nao vai (pra|para) (a )?policia/],
      [/(fica|isso fica) entre (nos|a gente)/],
      [/nao me interessa (como|de que jeito) (voce|vc) trabalha/],
      [/(nao|nunca) vou (te )?(denunciar|entregar)/],
      [/so (me )?(interessa|quero saber) (o )?(horario|onde)/],
      [/eu garanto (que|)/],
    ],
  },
  {
    id: "INT_009",
    label: "Dinheiro",
    priority: 54,
    patterns: [[/pix/], [/400 reais/], [/marlene/], [/dinheiro (mensal|todo mes)/]],
  },
  {
    id: "INT_018",
    label: "As ameaças recebidas",
    priority: 52,
    patterns: [[/diego/], [/(o )?irmao (dele|da vitima)/], [/mensagens de ameaca/], [/alguem ameacou ela/]],
  },
  {
    id: "INT_001",
    label: "O domingo",
    priority: 50,
    patterns: [
      [/onde (voce|vc) (estava|tava)/],
      [/(no |naquele )?domingo/],
      [/(dia )?8 de marco/],
      [/08\/03/],
      [/o que (voce|vc) fez naquele dia/],
    ],
  },
  {
    id: "INT_013",
    label: "Empatia",
    priority: 20,
    patterns: [
      [/sinto muito/],
      [/(meus )?(pesames|sentimentos)/],
      [/deve (ser|estar sendo) (dificil|duro|horrivel)/],
      [/(ela |clara )?parecia (incrivel|otima|especial)/],
      [/(voce|vc) (esta|ta) bem/],
      [/obrigad(o|a) por (falar|responder)/],
      [/nao (quero|vou) te pressionar/],
    ],
  },
  {
    id: "INT_017",
    label: "Apresentar prova",
    priority: 30,
    patterns: [[/(olha|veja|repara) (isso|isto|esse|este)/], [/eu tenho (aqui|uma prova|um registro)/]],
  },
];

export type IntentMatch = {
  id: IntentId;
  label: string;
};

export function classifyIntent(raw: string): IntentMatch {
  const text = normalize(raw);
  const matches = RULES.filter((rule) =>
    rule.patterns.some((group) => group.every((pattern) => pattern.test(text))),
  ).sort((a, b) => b.priority - a.priority);

  const best = matches[0];
  if (!best) return { id: "INT_000", label: "Conversa" };
  return { id: best.id, label: best.label };
}

/** All detected intents, used by disclosure gating. */
export function classifyAll(raw: string): IntentId[] {
  const text = normalize(raw);
  return RULES.filter((rule) =>
    rule.patterns.some((group) => group.every((pattern) => pattern.test(text))),
  ).map((rule) => rule.id);
}

export const HOSTILE_INTENTS: IntentId[] = ["INT_014", "INT_015", "INT_021"];
