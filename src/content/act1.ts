/**
 * Act 1 narrative package.
 *
 * Loaded on demand by the registry. Contains histories for conversations already
 * on the device, the calendar, and visible notes.
 */

import type { ClueId } from "../engine/types";

export type ArchivedLine = {
  at: string;
  who: string;
  text: string;
  self?: boolean;
  kind?: "texto" | "audio" | "chamada" | "foto" | "sistema";
  clueId?: ClueId;
  /** Marks the gap left by missing messages. */
  gap?: boolean;
};

export type ArchivedThread = {
  id: string;
  title: string;
  subtitle: string;
  lines: ArchivedLine[];
  clueId?: ClueId;
};

/* ------------------------------------------------------------------ */
/* Histories of the three active conversations                        */
/* ------------------------------------------------------------------ */

export const HISTORY_MOTHER: ArchivedLine[] = [
  { at: "24/12/2025 22:10", who: "Mãe ❤️", text: "Filha, tô no plantão. Deixei arroz e a carne moída na geladeira. Feliz Natal, meu amor. 🙏" },
  { at: "24/12/2025 22:44", who: "Clara", text: "feliz natal mãe ❤️ te amo", self: true },
  { at: "05/01/2026 01:48", who: "Clara", text: "mãe vc tá acordada", self: true },
  { at: "05/01/2026 01:49", who: "Mãe ❤️", text: "Tô. O que foi." },
  { at: "05/01/2026 01:52", who: "Clara", text: "nada. desculpa", self: true },
  { at: "05/01/2026 01:53", who: "Mãe ❤️", text: "Clara." },
  {
    at: "05/01/2026 02:31",
    who: "Clara",
    text: "[áudio 2:14] — arquivo expirado no servidor",
    self: true,
    kind: "audio",
  },
  { at: "05/01/2026 02:58", who: "Mãe ❤️", text: "Esquece isso, minha filha." },
  { at: "05/01/2026 02:58", who: "Mãe ❤️", text: "Não fala mais nisso com ninguém." },
  {
    at: "05/01/2026 02:59",
    who: "Mãe ❤️",
    text: "Não estraga a sua vida por uma coisa que não volta. Você não fez nada.",
    clueId: "CLUE_033",
  },
  { at: "05/01/2026 03:20", who: "Clara", text: "ok", self: true },
  { at: "19/01/2026 07:40", who: "Mãe ❤️", text: "Você comeu ontem?" },
  { at: "19/01/2026 11:02", who: "Clara", text: "comi", self: true },
  { at: "19/01/2026 11:02", who: "Mãe ❤️", text: "Comeu o quê." },
  { at: "19/01/2026 13:30", who: "Clara", text: "mãe pfv", self: true },
  { at: "11/02/2026 20:15", who: "Mãe ❤️", text: "Marquei o Dr. Rangel pra sexta. Você vai." },
  { at: "11/02/2026 20:50", who: "Clara", text: "vou", self: true },
  { at: "13/02/2026 17:10", who: "Mãe ❤️", text: "Ele ligou aqui falando que você não foi." },
  { at: "13/02/2026 23:44", who: "Clara", text: "desculpa", self: true },
  { at: "01/03/2026 12:00", who: "Mãe ❤️", text: "Almoça aqui domingo que vem? Faço frango com quiabo." },
  { at: "01/03/2026 12:31", who: "Clara", text: "faz sim ❤️", self: true },
  {
    at: "08/03/2026 08:12",
    who: "Clara",
    text: "[áudio 0:43] “Mãe, bom dia. Óia, hoje eu resolvo isso, tá? Eu não vou dar mais volta. Eu vou almoçar aí e eu vou te falar uma coisa, e eu quero que a senhora só escute e não fale nada, porque se a senhora falar eu não termino. Depois eu vou fazer o que eu tenho que fazer. Não fica preocupada. Feliz dia da mulher, mãe. Eu te amo mais que tudo.”",
    self: true,
    kind: "audio",
    clueId: "CLUE_021",
  },
  { at: "08/03/2026 08:29", who: "Mãe ❤️", text: "Recebi seu áudio. Resolve o quê, Clara?" },
  { at: "08/03/2026 08:31", who: "Mãe ❤️", text: "Clara." },
  { at: "08/03/2026 09:55", who: "Clara", text: "11h eu tô aí", self: true },
  { at: "08/03/2026 14:40", who: "Mãe ❤️", text: "Eu não devia ter falado daquele jeito." },
  { at: "08/03/2026 14:41", who: "Mãe ❤️", text: "Mas eu tô certa e você sabe que eu tô." },
  { at: "08/03/2026 15:02", who: "Clara", text: "eu sei que a senhora tá com medo. eu também tô", self: true },
  { at: "08/03/2026 15:03", who: "Clara", text: "mas eu não consigo mais mãe. eu não durmo há 8 meses", self: true },
  { at: "08/03/2026 15:05", who: "Mãe ❤️", text: "A gente conversa amanhã com calma." },
  { at: "08/03/2026 15:05", who: "Clara", text: "amanhã 9h eu tenho hora com a doutora", self: true, clueId: "CLUE_046" },
  { at: "08/03/2026 15:06", who: "Mãe ❤️", text: "Que doutora?" },
  { at: "08/03/2026 15:06", who: "Mãe ❤️", text: "Clara. Que doutora?" },
  { at: "08/03/2026 15:48", who: "Mãe ❤️", text: "Não me ignora." },
  {
    at: "08/03/2026 20:47",
    who: "Clara",
    text: "mãe, tô bem. só preciso ficar sozinha hoje. amanhã a gente fala",
    self: true,
    clueId: "CLUE_007B",
  },
  { at: "08/03/2026 20:48", who: "Mãe ❤️", text: "Você tá onde?" },
  { at: "08/03/2026 20:52", who: "Mãe ❤️", text: "Clara, você tá onde." },
  { at: "08/03/2026 21:04", who: "Mãe ❤️", text: "Me responde por favor." },
  { at: "08/03/2026 21:35", who: "Mãe ❤️", text: "[chamada não atendida]", kind: "chamada" },
  { at: "08/03/2026 22:02", who: "Mãe ❤️", text: "[chamada não atendida]", kind: "chamada" },
  { at: "08/03/2026 22:40", who: "Mãe ❤️", text: "[chamada não atendida]", kind: "chamada" },
  { at: "08/03/2026 22:41", who: "Mãe ❤️", text: "Amanhã eu vou aí de manhã." },
  { at: "09/03/2026 07:41", who: "Mãe ❤️", text: "CLARA ATENDE O TELEFONE" },
  { at: "09/03/2026 07:44", who: "Mãe ❤️", text: "CLARA" },
];

export const HISTORY_BOYFRIEND: ArchivedLine[] = [
  { at: "21/06/2025 19:30", who: "Théo", text: "hj é meu niver e vc vai beber comigo e não tem discussão" },
  { at: "21/06/2025 19:31", who: "Clara", text: "kkkkk parabéns meu amor ❤️❤️", self: true },
  { at: "22/06/2025 02:29", who: "Théo", text: "deixa a chave com vc, eu vou de app" },
  { at: "22/06/2025 02:29", who: "Théo", text: "vai devagar" },
  { at: "22/06/2025 02:30", who: "Clara", text: "deixa comigo", self: true },
  { at: "22/06/2025 09:05", who: "Théo", text: "[chamada recebida 2:18]", kind: "chamada" },
  {
    at: "22/06/2025 09:22",
    who: "Théo",
    text: "a lice me ligou falando que raspou num poste",
    clueId: "CLUE_061",
  },
  { at: "22/06/2025 09:22", who: "Théo", text: "vcs tão bem???" },
  { at: "22/06/2025 09:40", who: "Clara", text: "tamo bem. foi bobeira. desculpa théo", self: true },
  { at: "22/06/2025 09:41", who: "Théo", text: "carro é carro. vcs que importa" },
  { at: "22/06/2025 09:41", who: "Théo", text: "relaxa vai" },
  { at: "24/06/2025 16:10", who: "Théo", text: "ficou bom demais, nem parece" },
  { at: "24/06/2025 16:10", who: "Théo", text: "[foto — para-choque consertado]", kind: "foto" },
  { at: "24/06/2025 16:44", who: "Clara", text: "que bom", self: true },
  { at: "12/09/2025 23:00", who: "Théo", text: "vc tá diferente" },
  { at: "12/09/2025 23:48", who: "Clara", text: "tô cansada só", self: true },
  { at: "04/11/2025 01:20", who: "Théo", text: "vc chorou dormindo hj" },
  { at: "04/11/2025 08:30", who: "Clara", text: "deve ter sido sonho", self: true },
  { at: "14/02/2026 22:30", who: "Théo", text: "te amo viu" },
  { at: "14/02/2026 22:44", who: "Clara", text: "também te amo ❤️", self: true },
  { at: "15/02/2026 09:12", who: "Clara", text: "vc mexeu no meu celular de madrugada?", self: true, clueId: "CLUE_048" },
  { at: "15/02/2026 09:40", who: "Théo", text: "não" },
  { at: "15/02/2026 09:41", who: "Théo", text: "pq" },
  { at: "15/02/2026 09:55", who: "Clara", text: "nada", self: true },
  { at: "03/03/2026 20:15", who: "Théo", text: "cê tá longe faz um mês. fala comigo" },
  { at: "03/03/2026 20:16", who: "Théo", text: "eu não sou burro clara" },
  { at: "03/03/2026 20:40", who: "Clara", text: "tô resolvendo uma coisa", self: true },
  { at: "03/03/2026 20:40", who: "Clara", text: "depois eu te conto tudo, juro", self: true },
  { at: "03/03/2026 20:41", who: "Théo", text: "depois quando" },
  { at: "03/03/2026 20:41", who: "Théo", text: "vc fala isso desde junho" },
  { at: "03/03/2026 21:30", who: "Théo", text: "foi mal" },
  { at: "03/03/2026 21:30", who: "Théo", text: "eu só tô com medo" },
  { at: "06/03/2026 23:50", who: "Théo", text: "hj foi bom" },
  { at: "06/03/2026 23:51", who: "Clara", text: "foi ❤️ desculpa por tudo théo", self: true },
  { at: "06/03/2026 23:51", who: "Théo", text: "por tudo o quê kkkk" },
  { at: "06/03/2026 23:58", who: "Clara", text: "por tudo", self: true },
  { at: "08/03/2026 13:28", who: "Théo", text: "a gente conversa hj?" },
  { at: "08/03/2026 13:30", who: "Clara", text: "amanhã. amanhã eu te conto tudo", self: true },
  { at: "08/03/2026 13:30", who: "Clara", text: "juro pela minha mãe", self: true },
  { at: "08/03/2026 13:31", who: "Théo", text: "blz" },
  { at: "08/03/2026 17:55", who: "Théo", text: "[chamada não atendida]", kind: "chamada" },
  {
    at: "08/03/2026 21:13",
    who: "Clara",
    text: "não vem aqui hj. amanhã eu te explico tudo",
    self: true,
    clueId: "CLUE_007C",
  },
  { at: "08/03/2026 21:14", who: "Théo", text: "eu nem ia" },
  { at: "08/03/2026 21:14", who: "Théo", text: "boa noite clara" },
  { at: "09/03/2026 07:58", who: "Théo", text: "clara" },
];

export const HISTORY_FRIEND: ArchivedLine[] = [
  { at: "22/06/2025 03:58", who: "Alice ❤️ (Lice)", text: "[chamada recebida 22:51]", kind: "chamada", clueId: "CLUE_068" },
  { at: "22/06/2025 05:02", who: "Alice ❤️ (Lice)", text: "dorme." },
  { at: "22/06/2025 05:02", who: "Alice ❤️ (Lice)", text: "amanhã a gente conversa com a cabeça no lugar" },
  { at: "22/06/2025 05:03", who: "Alice ❤️ (Lice)", text: "te amo. confia em mim." },
  { at: "22/06/2025 11:40", who: "Alice ❤️ (Lice)", text: "falei com o T. tá tudo certo. ele nem perguntou direito" },
  {
    at: "22/06/2025 11:41",
    who: "Alice ❤️ (Lice)",
    text: "vc não fez nada, Cacau. lembra disso. vc não fez nada",
    clueId: "CLUE_025",
  },
  { at: "24/06/2025 09:30", who: "Alice ❤️ (Lice)", text: "consegue passar no banco hj?" },
  { at: "24/06/2025 09:30", who: "Alice ❤️ (Lice)", text: "1850" },
  { at: "24/06/2025 09:44", who: "Clara", text: "pq não sai da sua conta", self: true },
  {
    at: "24/06/2025 09:50",
    who: "Alice ❤️ (Lice)",
    text: "amor, movimentação bancária é a primeira coisa que olham. eu tô te protegendo tbm",
  },
  {
    at: "24/06/2025 09:51",
    who: "Alice ❤️ (Lice)",
    text: "vc não tem nada a ver com isso, então ninguém vai olhar pra sua conta",
    clueId: "CLUE_062",
  },
  { at: "24/06/2025 10:30", who: "Clara", text: "ok", self: true },
  { at: "03/07/2025 04:20", who: "Clara", text: "o nome dele era wesley", self: true },
  { at: "03/07/2025 04:20", who: "Clara", text: "ele tinha 27", self: true },
  { at: "03/07/2025 09:11", who: "Alice ❤️ (Lice)", text: "não faz isso com vc" },
  { at: "03/07/2025 09:11", who: "Alice ❤️ (Lice)", text: "não pesquisa mais. sério. isso não ajuda ninguém" },
  { at: "11/09/2025 00:01", who: "Clara", text: "parabéns lice ❤️", self: true },
  {
    at: "11/09/2025 00:04",
    who: "Alice ❤️ (Lice)",
    text: "11 anos de você me aturando desde a sétima série ❤️❤️",
  },
  { at: "19/11/2025 23:40", who: "Alice ❤️ (Lice)", text: "vc tá me evitando" },
  { at: "19/11/2025 23:55", who: "Clara", text: "não", self: true },
  { at: "19/11/2025 23:55", who: "Alice ❤️ (Lice)", text: "tá sim. e tá tudo bem, eu entendo" },
  {
    at: "19/11/2025 23:56",
    who: "Alice ❤️ (Lice)",
    text: "só não some, tá? vc some e eu fico achando que vc tá fazendo alguma besteira",
  },
  { at: "19/11/2025 23:57", who: "Alice ❤️ (Lice)", text: "e aí eu não durmo tbm" },
  { at: "20/12/2025 16:02", who: "Alice ❤️ (Lice)", text: "vc foi onde hj?" },
  { at: "20/12/2025 16:30", who: "Clara", text: "faculdade", self: true },
  { at: "20/12/2025 16:31", who: "Alice ❤️ (Lice)", text: "ah tá" },
  { at: "20/12/2025 16:31", who: "Alice ❤️ (Lice)", text: "🙂" },
  { at: "15/01/2026 14:20", who: "Alice ❤️ (Lice)", text: "te mandei 1200" },
  { at: "15/01/2026 14:20", who: "Alice ❤️ (Lice)", text: "não discute" },
  { at: "15/01/2026 14:21", who: "Alice ❤️ (Lice)", text: "vc tá sem trabalhar e eu não vou ficar vendo isso" },
  { at: "15/01/2026 15:00", who: "Clara", text: "lice eu não quero seu dinheiro", self: true },
  { at: "15/01/2026 15:01", who: "Alice ❤️ (Lice)", text: "não é meu dinheiro, é nosso. sempre foi ❤️" },
  { at: "03/02/2026 19:10", who: "Alice ❤️ (Lice)", text: "+ 800" },
  { at: "03/02/2026 19:40", who: "Clara", text: "para", self: true },
  { at: "03/02/2026 19:41", who: "Alice ❤️ (Lice)", text: "para vc" },
  { at: "05/03/2026 17:58", who: "Alice ❤️ (Lice)", text: "vc tá bem?" },
  { at: "05/03/2026 19:14", who: "Alice ❤️ (Lice)", text: "[chamada 11:40]", kind: "chamada" },
  { at: "05/03/2026 19:30", who: "Alice ❤️ (Lice)", text: "vc tá falando sério" },
  { at: "05/03/2026 19:30", who: "Alice ❤️ (Lice)", text: "vc tá falando sério mesmo" },
  { at: "05/03/2026 19:31", who: "Alice ❤️ (Lice)", text: "clara vc tem noção do que vc tá falando" },
  { at: "05/03/2026 19:32", who: "Alice ❤️ (Lice)", text: "eu perco a OAB. eu perco tudo. eu tenho 24 anos" },
  {
    at: "05/03/2026 19:33",
    who: "Alice ❤️ (Lice)",
    text: "e vc perde tbm, vc entendeu isso? vc acha que alguém vai acreditar que vc tava dormindo?",
  },
  { at: "05/03/2026 19:34", who: "Alice ❤️ (Lice)", text: "pensa na sua mãe. 51 anos, plantão de 12 horas" },
  { at: "05/03/2026 19:35", who: "Alice ❤️ (Lice)", text: "eu te dou uma semana" },
  { at: "05/03/2026 19:35", who: "Alice ❤️ (Lice)", text: "uma semana pra vc pensar direito" },
  { at: "05/03/2026 19:36", who: "Alice ❤️ (Lice)", text: "a gente cai junto, Cacau", clueId: "CLUE_047" },
  { at: "05/03/2026 21:02", who: "Clara", text: "domingo eu te dou a resposta", self: true },
  { at: "05/03/2026 21:03", who: "Alice ❤️ (Lice)", text: "obrigada ❤️ eu te amo. desculpa por agora" },
  { at: "05/03/2026 21:03", who: "Alice ❤️ (Lice)", text: "eu tava desesperada. vc me conhece" },
  { at: "07/03/2026 14:00", who: "Alice ❤️ (Lice)", text: "[4 chamadas não atendidas]", kind: "chamada" },
  { at: "07/03/2026 14:07", who: "Alice ❤️ (Lice)", text: "ok." },
  { at: "08/03/2026 14:07", who: "Alice ❤️ (Lice)", text: "[chamada não atendida]", kind: "chamada" },
  { at: "08/03/2026 14:09", who: "Alice ❤️ (Lice)", text: "[chamada não atendida]", kind: "chamada" },
  {
    at: "08/03/2026 14:09 → 20:41",
    who: "",
    text: "Nenhuma mensagem neste intervalo.",
    kind: "sistema",
    gap: true,
    clueId: "CLUE_003",
  },
  {
    at: "08/03/2026 20:41",
    who: "Clara",
    text: "cheguei em casa, tô bem. amanhã eu te ligo",
    self: true,
    clueId: "CLUE_007",
  },
  { at: "08/03/2026 20:42", who: "Alice ❤️ (Lice)", text: "ainda bem ❤️❤️" },
  { at: "08/03/2026 20:42", who: "Alice ❤️ (Lice)", text: "dorme bem, tá? amanhã a gente conversa com calma" },
  { at: "08/03/2026 20:43", who: "Alice ❤️ (Lice)", text: "te amo" },
  { at: "09/03/2026 08:02", who: "Alice ❤️ (Lice)", text: "não pode ser" },
  { at: "09/03/2026 08:03", who: "Alice ❤️ (Lice)", text: "não pode ser, não pode ser" },
  { at: "09/03/2026 08:03", who: "Alice ❤️ (Lice)", text: "não pode ser não pode ser não pode ser" },
];

/* ------------------------------------------------------------------ */
/* Secondary static conversations                                     */
/* ------------------------------------------------------------------ */

export const ARCHIVED_THREADS: ArchivedThread[] = [
  {
    id: "TH_WESLEY",
    title: "Wesley 🛵 Delivery",
    subtitle: "21/06/2025 · atendimento",
    clueId: "CLUE_039",
    lines: [
      { at: "21/06/2025 23:12", who: "Sistema", text: "Entregador a caminho: Wesley A.", kind: "sistema" },
      { at: "21/06/2025 23:29", who: "Wesley", text: "boa noite! tô na portaria do Nau, é pra entregar na mesa?" },
      { at: "21/06/2025 23:30", who: "Clara", text: "oi!! pode entregar na mesa 6, do lado da janela 🙏", self: true },
      { at: "21/06/2025 23:31", who: "Wesley", text: "fechado! chegando" },
      { at: "21/06/2025 23:38", who: "Clara", text: "obrigada!!! boa noite pra vc, trabalha demais hein kkkk", self: true },
      { at: "21/06/2025 23:39", who: "Wesley", text: "kkkk é a vida! boa festa moça" },
      { at: "21/06/2025 23:40", who: "Sistema", text: "Avalie sua entrega: ⭐⭐⭐⭐⭐", kind: "sistema" },
    ],
  },
  {
    id: "TH_FUNILARIA",
    title: "Zé do Bloco Funilaria",
    subtitle: "04/03/2026 · segunda via",
    clueId: "CLUE_017",
    lines: [
      { at: "04/03/2026 08:31", who: "Clara", text: "bom dia! o senhor consegue a segunda via de uma nota de junho do ano passado?", self: true },
      { at: "04/03/2026 08:33", who: "Zé do Bloco", text: "boa tarde, é sobre o Fit prata?" },
      { at: "04/03/2026 08:34", who: "Clara", text: "isso. é pro seguro, o corretor pediu", self: true },
      { at: "04/03/2026 08:40", who: "Zé do Bloco", text: "acho a via aqui. foi farol e paralama, né. o rapaz pagou em dinheiro" },
      { at: "04/03/2026 08:41", who: "Clara", text: "em dinheiro?", self: true },
      { at: "04/03/2026 08:42", who: "Zé do Bloco", text: "tudo em espécie. eu lembro porque não é comum" },
      { at: "04/03/2026 08:55", who: "Clara", text: "obrigada mesmo. tô indo aí", self: true },
    ],
  },
  {
    id: "TH_NAYARA",
    title: "Nayara (Nau)",
    subtitle: "12/02/2026",
    lines: [
      { at: "12/02/2026 21:00", who: "Nayara", text: "some não, viu" },
      { at: "12/02/2026 21:02", who: "Nayara", text: "vc não aparece aqui desde o niver do théo" },
      { at: "12/02/2026 23:31", who: "Clara", text: "tô meio enrolada. depois eu apareço", self: true },
      { at: "12/02/2026 23:32", who: "Nayara", text: "vc fala isso desde junho kkkk" },
    ],
  },
  {
    id: "TH_PAI",
    title: "Pai",
    subtitle: "09/03/2026",
    lines: [
      { at: "07/12/2025 09:14", who: "Pai", text: "parabéns filha, papai te ama" },
      { at: "07/12/2025 14:20", who: "Clara", text: "obrigada pai ❤️", self: true },
      { at: "09/03/2026 11:00", who: "Pai", text: "me ligaram agora. eu não sei o que dizer" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Calendar                                                            */
/* ------------------------------------------------------------------ */

export type CalendarEvent = {
  id: string;
  date: string;
  time: string;
  title: string;
  createdAt: string;
  note?: string;
  clueId?: ClueId;
  act: 1 | 2;
};

export const CALENDAR: CalendarEvent[] = [
  { id: "EV_01", date: "02/03/2026", time: "19h00", title: "Pix M.", createdAt: "recorrente desde 02/07/2025", clueId: "CLUE_044", act: 2 },
  { id: "EV_02", date: "04/03/2026", time: "09h00", title: "funilaria — nota", createdAt: "03/03 22h10", act: 2 },
  { id: "EV_03", date: "05/03/2026", time: "17h00", title: "A. — shopping", createdAt: "04/03 12h05", clueId: "CLUE_045", act: 2 },
  { id: "EV_04", date: "06/03/2026", time: "10h00", title: "Aula — Redação III", createdAt: "recorrente", act: 1 },
  { id: "EV_05", date: "08/03/2026", time: "11h00", title: "Almoço mãe", createdAt: "06/03", act: 1 },
  {
    id: "EV_06",
    date: "08/03/2026",
    time: "19h30",
    title: "PL",
    createdAt: "08/03 15h50",
    note: "Criado três horas antes.",
    clueId: "CLUE_023",
    act: 1,
  },
  {
    id: "EV_07",
    date: "09/03/2026",
    time: "09h00",
    title: "Dra. Yara — R. Espírito Santo 1088, sl 704",
    createdAt: "02/03 11h50",
    clueId: "CLUE_046",
    act: 1,
  },
  { id: "EV_08", date: "09/03/2026", time: "14h00", title: "Redação III — entrega", createdAt: "recorrente", act: 1 },
  { id: "EV_09", date: "11/03/2026", time: "16h00", title: "Dr. Rangel", createdAt: "recorrente", act: 1 },
  { id: "EV_10", date: "11/09/2026", time: "dia todo", title: "Lice 🎂", createdAt: "anual", act: 1 },
];

/* ------------------------------------------------------------------ */
/* Visible notes                                                       */
/* ------------------------------------------------------------------ */

export type NoteRecord = {
  id: string;
  title: string;
  editedAt: string;
  body: string;
  clueId?: ClueId;
  locked?: boolean;
  act: 1 | 2;
};

export const NOTES_OPEN: NoteRecord[] = [
  {
    id: "NOTE_001",
    title: "compras",
    editedAt: "06/03/2026",
    body: "leite\nração do vizinho\npilha do controle\npão (não esquecer de novo)",
    act: 1,
  },
  {
    id: "NOTE_002",
    title: "senhas do wifi",
    editedAt: "11/2024",
    body: "NAU_CLIENTES — naucerveja2023\nUFJF-VISITANTE — sem senha\ncasa da Lice — pergunta pra ela, ela troca toda hora",
    act: 1,
  },
  {
    id: "NOTE_003",
    title: "NÃO ESQUECER 22/06",
    editedAt: "22/06/2025",
    body: "",
    clueId: "CLUE_052",
    act: 1,
  },
  {
    id: "NOTE_005",
    title: "roteiro — abertura",
    editedAt: "09/2025",
    body: "abre com o barulho da moto. sem narração.\ncorta pra mão dele no guidão.\n\n(não consegui escrever mais nada desde julho)",
    act: 1,
  },
  {
    id: "NOTE_006",
    title: "pro caso de",
    editedAt: "02/03/2026",
    body:
      "se alguém tiver lendo isso e não for eu:\n\no pin do meu telefone é o meu aniversário e sempre foi, eu sei que é burrice.\n\na única pessoa que sabe é a Lice, desde 2019, quando eu quebrei o braço e ela tinha que atender pra mim.\n\nnão conta isso pra minha mãe que ela me mata.",
    clueId: "CLUE_066",
    act: 1,
  },
  {
    id: "NOTE_008",
    title: "12h14",
    editedAt: "08/03/2026 12h14",
    body:
      "ela falou que ia me impedir.\n\nnão sei o que isso quer dizer. eu acho que ela também não sabe.\nela tirou o telefone da minha mão em cima da mesa e virou pra baixo.\neu falei da advogada. duas vezes.\n\nsegunda eu vou de qualquer jeito.",
    clueId: "CLUE_075",
    act: 2,
  },
  {
    id: "NOTE_007",
    title: "coisas boas",
    editedAt: "02/2026",
    body:
      "1. café da padaria da esquina\n2. o barulho da chuva no toldo\n3. quando o Théo dorme no sofá\n4. a minha mãe fingindo que não chorou\n5. domingo de manhã sem compromisso\n6. filme ruim com pipoca boa\n7. o cheiro do corredor do ICH\n8. quando alguém ri do que eu escrevi\n9. Fumaça dormindo em cima do meu pé\n10. o mirante às seis da tarde\n11. a Lice em 2016",
    act: 1,
  },
];
