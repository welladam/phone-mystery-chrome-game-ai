/**
 * Dicas em três degraus: direção, foco e resposta.
 *
 * Nunca punem, nunca cobram, nunca envergonham. Cada degrau exige um pedido
 * novo do jogador. A voz é a da advogada — técnica e sem julgamento.
 */

import type { GameState } from "./types";

export type Hint = { obstacleId: string; title: string; steps: [string, string, string] };

export const HINTS: Hint[] = [
  {
    obstacleId: "ATO_1",
    title: "Não sei por onde começar",
    steps: [
      "Você tem duas fontes que não mentem porque não sabem mentir: o relógio de pulso e o próprio sistema do aparelho.",
      "Compare a última leitura de frequência cardíaca no Pulso com o relatório de tempo de tela nos Ajustes.",
      "19h58 e 20h11. Examine as duas pistas no caderno.",
    ],
  },
  {
    obstacleId: "LOCK_002",
    title: "A nota trancada",
    steps: [
      "A dica que ela escreveu é literal. É uma data.",
      "Há uma nota vazia cujo título é só uma data, e uma foto tirada naquele mesmo dia.",
      "2206.",
    ],
  },
  {
    obstacleId: "LOCK_003",
    title: "A pasta protegida na nuvem",
    steps: [
      "Uma pessoa. Ela quis que a senha fosse o nome de uma pessoa.",
      "A manchete que ela salvou na galeria traz o nome completo.",
      "wesley.",
    ],
  },
  {
    obstacleId: "LOCK_004",
    title: "O gravador",
    steps: [
      "“A data que eu devia ter respeitado” não é a data do acidente. É anterior.",
      "Ela decorou a data de nascimento dele e escreveu isso duas vezes: num rascunho apagado e num áudio.",
      "170498.",
    ],
  },
  {
    obstacleId: "LOCK_005",
    title: "A segunda conta de e-mail",
    steps: [
      "Pergunta de segurança padrão. A resposta está fixada nos Favoritos da galeria.",
      "Ela guardou uma foto de um cachorro com plaquinha na coleira. Amplie a plaquinha.",
      "fumaça — e o código de seis dígitos está no aplicativo Chave.",
    ],
  },
  {
    obstacleId: "LOCK_006",
    title: "O álbum oculto",
    steps: [
      "Uma data que importava mais pra ela do que a dela própria.",
      "Está escrita no cartão de contato de uma pessoa só.",
      "1109.",
    ],
  },
  {
    obstacleId: "LOCK_007",
    title: "O aplicativo do banco",
    steps: [
      "O documento que a mãe assinou qualifica a filha por extenso.",
      "Termo de autorização, na pasta CASO da nuvem.",
      "0982.",
    ],
  },
  {
    obstacleId: "LOCK_008",
    title: "O arquivo compactado",
    steps: [
      "Elas tinham um lugar. O nome dele está no histórico de localização.",
      "Junto, minúsculo, sem espaço.",
      "pedralascada.",
    ],
  },
  {
    obstacleId: "LOCK_009",
    title: "A rede social",
    steps: [
      "A dica diz “o ano que a gente se conheceu”. Alguém contou os anos em voz alta num aniversário.",
      "Onze anos, em setembro de 2025. E a legenda de uma foto dos Favoritos confirma.",
      "clara2014.",
    ],
  },
  {
    obstacleId: "CHAR_003",
    title: "O namorado não abre",
    steps: [
      "Ele não está escondendo onde estava. Está escondendo como trabalha.",
      "Dê a ele uma garantia. Diga que não te interessa a irregularidade, só o horário.",
      "Escreva, com estas palavras ou equivalentes: isso não vai para a polícia.",
    ],
  },
  {
    obstacleId: "CHAR_004",
    title: "A amiga não cede",
    steps: [
      "Ela não vai ceder. Pare de tentar por conversa.",
      "O único caminho é o arquivo trancado no gravador.",
      "Abra o Voz Segura e envie a ela o trecho de 02:19.",
    ],
  },
  {
    obstacleId: "CHAR_005",
    title: "O contato anônimo",
    steps: [
      "Compare como as duas escrevem. Não o que dizem — como.",
      "Reticências de quatro pontos. E um apelido que ninguém mais usa.",
      "Confronte com a ligação de três segundos das 21h18, no aplicativo Telefone.",
    ],
  },
  {
    obstacleId: "PAINEL",
    title: "O painel de reconstrução",
    steps: [
      "Faltam os nós obrigatórios: a gravação e o horário da parada cardíaca.",
      "19h46 e 19h58.",
      "Arraste a gravação do mirante e a última leitura do Pulso.",
    ],
  },
];

export function hintFor(obstacleId: string) {
  return HINTS.find((hint) => hint.obstacleId === obstacleId);
}

/** Qual obstáculo faz sentido oferecer agora, dado o estado. */
export function suggestObstacle(state: GameState): string {
  if (state.act === 1) return "ATO_1";
  if (state.act === 2) {
    if (!state.solvedLocks.includes("LOCK_007")) return "LOCK_007";
    if (!state.solvedLocks.includes("LOCK_009")) return "LOCK_009";
    return "LOCK_002";
  }
  if (state.act === 3) {
    if (!state.solvedLocks.includes("LOCK_004")) return "LOCK_004";
    if (!state.solvedLocks.includes("LOCK_003")) return "LOCK_003";
    if (!state.solvedLocks.includes("LOCK_005")) return "LOCK_005";
    return "CHAR_005";
  }
  return "PAINEL";
}

export function hintLevel(state: GameState, obstacleId: string) {
  return Math.min(3, state.hintsUsed[obstacleId] ?? 0);
}
