/**
 * Conteúdo presente desde o Ato 1.
 *
 * Nada aqui revela a solução. Fotografias, contatos, notificações, chamadas e
 * dados de saúde: material que o jogador vê logo ao ligar o aparelho.
 */

import type { ClueId, PhotoId } from "../engine/types";

export type PhotoRecord = {
  id: PhotoId;
  file: string;
  takenAt: string;
  album: string;
  caption: string;
  /** Descrição objetiva, usada também como texto alternativo. */
  alt: string;
  gps?: string;
  device?: string;
  narrative: boolean;
  clueId?: ClueId;
  /** Detalhe revelado ao usar "Aprimorar imagem". */
  zoom?: { label: string; text: string; clueId?: ClueId };
  /** Ato mínimo para aparecer. */
  act: 1 | 2 | 3 | 4;
  hidden?: boolean;
  deleted?: boolean;
};

export const PHOTOS: PhotoRecord[] = [
  {
    id: "PHOTO_001",
    file: "IMG_20260112_0842.jpg",
    takenAt: "12/01/2026 08:42",
    album: "Câmera",
    caption: "",
    alt: "Selfie de espelho de banheiro, de manhã, rosto magro e olheiras fundas. Na pia, uma caixa de remédio com tarja.",
    gps: "Rua Coronel Vidal, 412",
    narrative: true,
    act: 1,
    zoom: { label: "Caixa na pia", text: "Sertralina 50 mg. Cartela pela metade, data de manipulação de novembro." },
  },
  {
    id: "PHOTO_002",
    file: "IMG_20180705_1610.jpg",
    takenAt: "05/07/2018 16:10",
    album: "Favoritos",
    caption: "meu velho 🖤",
    alt: "Cão vira-lata cinza deitado num tapete bege, língua de fora, com coleira azul e plaquinha metálica.",
    device: "Importada de backup — Nimbo, 03/2021",
    narrative: true,
    act: 1,
    zoom: { label: "Plaquinha da coleira", text: "Gravado na chapinha redonda: FUMAÇA." },
  },
  {
    id: "PHOTO_003",
    file: "IMG_20250621_2348.jpg",
    takenAt: "21/06/2025 23:48",
    album: "Câmera",
    caption: "26 dele 🎂",
    alt: "Bolo com vela de número 26 numa mesa de bar, copos de chope e mãos ao redor. No canto, uma sacola térmica de entregador apoiada numa cadeira.",
    gps: "Bar Nau, Rua São Sebastião",
    narrative: false,
    act: 1,
  },
  {
    id: "PHOTO_004",
    file: "IMG_20250622_0052.jpg",
    takenAt: "22/06/2025 00:52",
    album: "Câmera",
    caption: "",
    alt: "Três jovens espremidos no enquadramento, sorrindo. Sobre a mesa, copos vazios distribuídos de forma desigual e um molho de chaves de carro perto da borda.",
    gps: "Bar Nau, Rua São Sebastião",
    narrative: true,
    act: 2,
    zoom: {
      label: "Contagem de copos",
      text: "Cinco copos diante do rapaz. Três copos e uma dose diante da moça do centro. Dois diante de Clara.",
    },
  },
  {
    id: "PHOTO_005",
    file: "IMG_20250622_0219.jpg",
    takenAt: "22/06/2025 02:19",
    album: "Oculto",
    caption: "",
    alt: "Foto tremida do banco do carona, apontada para o volante. Duas mãos femininas com esmalte vermelho descascado. Painel iluminado, velocímetro perto de 78.",
    gps: "Av. Rio Branco, sentido norte",
    narrative: true,
    act: 3,
    hidden: true,
    clueId: "CLUE_024",
    zoom: {
      label: "Mão direita",
      text: "Anel largo de prata liso no dedo indicador. Nenhum rosto no enquadramento.",
      clueId: "CLUE_024",
    },
  },
  {
    id: "PHOTO_006",
    file: "IMG_20250622_0244.jpg",
    takenAt: "22/06/2025 02:44",
    album: "Oculto",
    caption: "",
    alt: "Avenida deserta de madrugada, vista pelo para-brisa. Poste apagado à direita e uma placa de rua branca com letras pretas.",
    gps: "Av. Barão do Cristal, altura do 1.700",
    narrative: true,
    act: 3,
    hidden: true,
    clueId: "CLUE_024",
    zoom: { label: "Placa de rua", text: "AV. BARÃO DO CRISTAL. Três minutos antes das 02h47." },
  },
  {
    id: "PHOTO_007",
    file: "IMG_20250622_0912.jpg",
    takenAt: "22/06/2025 09:12",
    album: "Câmera",
    caption: "",
    alt: "Canto dianteiro direito de um hatch prata. Farol estilhaçado, paralama amassado, tinta arrancada.",
    gps: "Rua Coronel Vidal, 412 (garagem)",
    narrative: true,
    act: 2,
    clueId: "CLUE_012",
    zoom: {
      label: "Fresta do paralama",
      text: "Um caco de plástico vermelho translúcido preso entre o farol e a lataria. Placa parcial visível: GMB 4J.",
      clueId: "CLUE_012",
    },
  },
  {
    id: "PHOTO_008",
    file: "tribuna_barao.png",
    takenAt: "04/03/2026 16:44",
    album: "Capturas de tela",
    caption: "",
    alt: "Captura de tela de uma matéria do jornal Tribuna do Vale sobre um motociclista morto atropelado.",
    narrative: true,
    act: 2,
    clueId: "CLUE_013",
    zoom: {
      label: "Corpo da matéria",
      text: "“A vítima foi identificada como Wesley Andrade da Silva, 27 anos, entregador de aplicativo. O trecho tem um poste sem iluminação e não é coberto por câmeras.” — 22/06/2025, 11h04.",
      clueId: "CLUE_013",
    },
  },
  {
    id: "PHOTO_009",
    file: "IMG_20260304_0855.jpg",
    takenAt: "04/03/2026 08:55",
    album: "Câmera",
    caption: "",
    alt: "Mão segurando uma nota de serviço de funilaria sobre um balcão de fórmica com manchas de graxa.",
    gps: "Funilaria Zé do Bloco, Benfica",
    narrative: true,
    act: 2,
    clueId: "CLUE_017",
    zoom: {
      label: "Campos da nota",
      text: "Nº 2214 · 24/06/2025 · Cliente THEO B. RAMALHO · Veículo HONDA FIT PRATA GMB4J09 · troca farol dir. / reparo paralama e capô · R$ 1.850,00 · carimbo PAGO.",
      clueId: "CLUE_017",
    },
  },
  {
    id: "PHOTO_010",
    file: "print_live_080326.png",
    takenAt: "08/03/2026 19:39",
    album: "Capturas de tela",
    caption: "",
    alt: "Captura de uma transmissão ao vivo. Selo AO VIVO, 214 assistindo, localização Barbacena/MG, duração 19:20.",
    gps: "Estrada do Poço Fundo, km 4",
    narrative: true,
    act: 2,
    clueId: "CLUE_036",
    zoom: {
      label: "Barra de status",
      text: "19:39 no relógio do sistema. A transmissão já corria havia dezenove minutos, a cem quilômetros daqui.",
      clueId: "CLUE_036",
    },
  },
  {
    id: "PHOTO_011",
    file: "IMG_20260301_1034.jpg",
    takenAt: "01/03/2026 10:34",
    album: "Favoritos",
    caption: "10 anos disso 🥹 2014–2024",
    alt: "Duas jovens meio abraçadas numa mesa de padaria, sorrindo para a câmera. Duas xícaras e um prato de pão de queijo.",
    gps: "Padaria Mineirinha, São Mateus",
    narrative: true,
    act: 1,
    zoom: {
      label: "Mão no ombro",
      text: "Anel largo de prata liso no dedo indicador direito.",
    },
  },
  {
    id: "PHOTO_012",
    file: "IMG_20260306_2114.jpg",
    takenAt: "06/03/2026 21:14",
    album: "Câmera",
    caption: "ele dorme em qualquer lugar",
    alt: "Casal no sofá: ela faz careta para a câmera, ele dorme com a cabeça no colo dela. Abajur aceso, televisão ao fundo.",
    gps: "Rua Coronel Vidal, 412",
    narrative: true,
    act: 2,
  },
  {
    id: "PHOTO_013",
    file: "IMG_20251218_1902.jpg",
    takenAt: "18/12/2025 19:02",
    album: "Câmera",
    caption: "a doutora e o possante dela kkkk",
    alt: "Mulher jovem rindo ao lado da porta do motorista de um hatch vermelho, erguendo a chave. A traseira aparece em ângulo.",
    gps: "Independência Shopping",
    narrative: true,
    act: 2,
    clueId: "CLUE_031",
    zoom: {
      label: "Traseira do veículo",
      text: "Placa RKA7C21. Adesivo redondo branco com uma balança desenhada, colado no canto do vidro traseiro.",
      clueId: "CLUE_031",
    },
  },
  {
    id: "PHOTO_014",
    file: "IMG_20260308_1944.jpg",
    takenAt: "08/03/2026 19:44",
    album: "Câmera",
    caption: "",
    alt: "Vista do mirante ao pôr do sol. Vale escuro, cidade ao longe, céu alaranjado. Em primeiro plano, o topo de um parapeito com um casaco jeans dobrado. Ao fundo à esquerda, a estrada de terra.",
    gps: "Estrada do Poço Fundo, km 4",
    narrative: true,
    act: 1,
    zoom: {
      label: "Canto inferior esquerdo",
      text: "Um hatch vermelho sobe a estrada com os faróis acesos. A placa dianteira se distingue parcialmente: RKA 7C.",
      clueId: "CLUE_009",
    },
  },
  {
    id: "PHOTO_015",
    file: "IMG_20260306_1012.jpg",
    takenAt: "06/03/2026 10:12",
    album: "Câmera",
    caption: "",
    alt: "Quadro branco de sala de aula com um cronograma de entregas escrito à caneta.",
    gps: "UFJF — ICH",
    narrative: false,
    act: 2,
  },
  {
    id: "PHOTO_016",
    file: "IMG_20260306_1240.jpg",
    takenAt: "06/03/2026 12:40",
    album: "Câmera",
    caption: "",
    alt: "Bandeja de refeitório vista de cima, com o prato praticamente intocado e um garfo apoiado na borda.",
    gps: "UFJF — RU",
    narrative: false,
    act: 2,
  },
  {
    id: "PHOTO_017",
    file: "IMG_20251220_1442.jpg",
    takenAt: "20/12/2025 14:42",
    album: "Câmera",
    caption: "",
    alt: "Foto com zoom, tirada de dentro de um carro: grupo pequeno diante do portão de um cemitério, segurando uma faixa de tecido.",
    gps: "Cemitério Parque da Saudade",
    narrative: true,
    act: 2,
    clueId: "CLUE_043",
    zoom: {
      label: "A faixa",
      text: "Letras pretas pintadas à mão: 6 MESES SEM WESLEY — JUSTIÇA. Motocicletas de entregadores estacionadas em fila.",
      clueId: "CLUE_043",
    },
  },
  {
    id: "PHOTO_018",
    file: "IMG_20230917_1810.jpg",
    takenAt: "17/09/2023 18:10",
    album: "Favoritos",
    caption: "PL 💛 sempre",
    alt: "Duas jovens de costas, sentadas no parapeito de um mirante, pernas balançando sobre o vale ao fim da tarde.",
    gps: "Estrada do Poço Fundo, km 4",
    narrative: true,
    act: 1,
  },
  {
    id: "PHOTO_019",
    file: "IMG_20260305_1940.jpg",
    takenAt: "05/03/2026 19:40",
    album: "Recentemente apagados",
    caption: "",
    alt: "Selfie noturna dentro de um carro, iluminada só pela tela do celular. Rosto molhado de lágrimas, expressão contida, olhando direto para a câmera.",
    gps: "Independência Shopping",
    narrative: true,
    act: 2,
    deleted: true,
  },
  {
    id: "PHOTO_020",
    file: "IMG_20260214_2038.jpg",
    takenAt: "14/02/2026 20:38",
    album: "Câmera",
    caption: "",
    alt: "Dois ingressos de cinema e um pacote de balas sobre o console de um carro.",
    gps: "Independência Shopping",
    narrative: false,
    act: 2,
  },
];

export const PHOTO_ALBUMS = [
  "Recentes",
  "Câmera",
  "Capturas de tela",
  "Favoritos",
  "Oculto",
  "Recentemente apagados",
] as const;

/* ------------------------------------------------------------------ */
/* Contatos                                                            */
/* ------------------------------------------------------------------ */

export type ContactRecord = {
  id: string;
  name: string;
  phone: string;
  note?: string;
  clueId?: ClueId;
};

export const CONTACTS: ContactRecord[] = [
  { id: "CT_01", name: "Mãe ❤️", phone: "(32) 99205-1174", note: "plantão qua/sex/dom" },
  { id: "CT_02", name: "Alice ❤️ (Lice)", phone: "(32) 99730-4412", note: "aniversário 11/09" },
  { id: "CT_03", name: "Théo", phone: "(32) 98871-3350", note: "placa GMB4J09 (pra multa)" },
  { id: "CT_04", name: "Pai", phone: "(31) 98120-4477" },
  { id: "CT_05", name: "Nayara (Nau)", phone: "(32) 99188-0203" },
  {
    id: "CT_06",
    name: "Dra. Yara Trindade",
    phone: "(32) 3215-8890",
    note: "só no arquivo. NÃO salvar conversa",
  },
  { id: "CT_07", name: "Zé do Bloco Funilaria", phone: "(32) 99604-1122" },
  { id: "CT_08", name: "Dr. Rangel (psiquiatra)", phone: "(32) 3212-7745", note: "sex 16h — faltei 3x" },
  { id: "CT_09", name: "Tia Sônia", phone: "(32) 99771-3390" },
];

export const UNKNOWN_NUMBER = "(32) 99486-0075";

/* ------------------------------------------------------------------ */
/* Chamadas                                                            */
/* ------------------------------------------------------------------ */

export type CallRecord = {
  id: string;
  at: string;
  who: string;
  kind: "recebida" | "efetuada" | "perdida";
  duration?: string;
  clueId?: ClueId;
  unsaved?: boolean;
};

export const CALLS: CallRecord[] = [
  { id: "CALL_01", at: "08/03/2026 10:44", who: "Mãe ❤️", kind: "recebida", duration: "6min12s" },
  { id: "CALL_02", at: "08/03/2026 14:07", who: "Alice ❤️ (Lice)", kind: "perdida" },
  { id: "CALL_03", at: "08/03/2026 14:09", who: "Alice ❤️ (Lice)", kind: "perdida" },
  { id: "CALL_04", at: "08/03/2026 17:55", who: "Théo", kind: "perdida" },
  {
    id: "CALL_05",
    at: "08/03/2026 21:18",
    who: UNKNOWN_NUMBER,
    kind: "efetuada",
    duration: "3s",
    clueId: "CLUE_028",
    unsaved: true,
  },
  { id: "CALL_06", at: "08/03/2026 21:35", who: "Mãe ❤️", kind: "perdida", clueId: "CLUE_008" },
  { id: "CALL_07", at: "08/03/2026 22:02", who: "Mãe ❤️", kind: "perdida", clueId: "CLUE_008" },
  { id: "CALL_08", at: "08/03/2026 22:40", who: "Mãe ❤️", kind: "perdida", clueId: "CLUE_008" },
  { id: "CALL_09", at: "07/03/2026 14:00", who: "Alice ❤️ (Lice)", kind: "perdida" },
  { id: "CALL_10", at: "07/03/2026 14:02", who: "Alice ❤️ (Lice)", kind: "perdida" },
  { id: "CALL_11", at: "07/03/2026 14:04", who: "Alice ❤️ (Lice)", kind: "perdida" },
  { id: "CALL_12", at: "07/03/2026 14:06", who: "Alice ❤️ (Lice)", kind: "perdida" },
  { id: "CALL_13", at: "05/03/2026 19:14", who: "Alice ❤️ (Lice)", kind: "recebida", duration: "11min40s" },
  { id: "CALL_14", at: "02/03/2026 11:30", who: "Dra. Yara Trindade", kind: "efetuada", duration: "8min02s" },
  { id: "CALL_15", at: "22/06/2025 09:05", who: "Théo", kind: "recebida", duration: "2min18s" },
  {
    id: "CALL_16",
    at: "22/06/2025 03:58",
    who: "Alice ❤️ (Lice)",
    kind: "recebida",
    duration: "22min51s",
    clueId: "CLUE_068",
  },
];

/* ------------------------------------------------------------------ */
/* Notificações                                                        */
/* ------------------------------------------------------------------ */

export type NotificationRecord = {
  id: string;
  at: string;
  app: string;
  from: string;
  preview: string;
  clueId?: ClueId;
  /** Marca prévias cuja mensagem original não existe mais na conversa. */
  orphan?: boolean;
};

export const NOTIFICATIONS: NotificationRecord[] = [
  { id: "NT_01", at: "08/03 08:29", app: "Vínculo", from: "Mãe ❤️", preview: "Recebi seu áudio. Resolve o quê, Clara?" },
  {
    id: "NT_02",
    at: "08/03 09:51",
    app: "Nimbo",
    from: "Sistema",
    preview: "declaracao_final.pdf enviado para PESSOAL/22",
    clueId: "CLUE_037",
  },
  { id: "NT_03", at: "08/03 13:28", app: "Vínculo", from: "Théo", preview: "a gente conversa hj?" },
  {
    id: "NT_04",
    at: "08/03 14:02",
    app: "Fluxo",
    from: "Sistema",
    preview: "diego.andrade.silva começou uma transmissão ao vivo",
  },
  {
    id: "NT_05",
    at: "08/03 15:48",
    app: "Vínculo",
    from: "enviada",
    preview: "preciso te falar hoje. pessoalmente. pedra lasc…",
    clueId: "CLUE_038",
    orphan: true,
  },
  {
    id: "NT_06",
    at: "08/03 16:02",
    app: "Vínculo",
    from: "Alice ❤️ (Lice)",
    preview: "ai clara…. tá bom. 19h30",
    clueId: "CLUE_001",
    orphan: true,
  },
  {
    id: "NT_07",
    at: "08/03 16:44",
    app: "Órbita",
    from: "Sistema",
    preview: "Download concluído: tribuna_barao.png",
  },
  {
    id: "NT_08",
    at: "08/03 17:30",
    app: "Feito",
    from: "Sistema",
    preview: "Amanhã: SEG 9h — Dra. Yara — LEVAR O ÁUDIO E A NOTA",
    clueId: "CLUE_016",
  },
  {
    id: "NT_09",
    at: "08/03 18:27",
    app: "Vínculo",
    from: "Alice ❤️ (Lice)",
    preview: "to saindo daqui a pouco. me espera lá em cima",
    clueId: "CLUE_002",
    orphan: true,
  },
  {
    id: "NT_10",
    at: "08/03 18:51",
    app: "Banco Aurora",
    from: "Sistema",
    preview: "Você está saindo da sua região habitual",
  },
  {
    id: "NT_11",
    at: "08/03 20:47",
    app: "Vínculo",
    from: "enviada",
    preview: "mãe, tô bem. só preciso ficar sozinha hoje. am…",
    clueId: "CLUE_007B",
  },
  {
    id: "NT_12",
    at: "08/03 21:13",
    app: "Vínculo",
    from: "enviada",
    preview: "não vem aqui hj. amanhã eu te explico tudo",
    clueId: "CLUE_007C",
  },
  { id: "NT_13", at: "08/03 21:35", app: "Telefone", from: "Mãe ❤️", preview: "Chamada perdida", clueId: "CLUE_008" },
  { id: "NT_14", at: "08/03 22:02", app: "Telefone", from: "Mãe ❤️", preview: "Chamada perdida" },
  { id: "NT_15", at: "08/03 22:40", app: "Telefone", from: "Mãe ❤️", preview: "Chamada perdida" },
  { id: "NT_16", at: "09/03 07:41", app: "Vínculo", from: "Mãe ❤️", preview: "CLARA ATENDE O TELEFONE" },
  { id: "NT_17", at: "09/03 07:44", app: "Vínculo", from: "Mãe ❤️", preview: "CLARA" },
  { id: "NT_18", at: "09/03 07:58", app: "Vínculo", from: "Théo", preview: "clara" },
  { id: "NT_19", at: "09/03 08:02", app: "Vínculo", from: "Alice ❤️ (Lice)", preview: "não pode ser" },
  {
    id: "NT_20",
    at: "09/03 08:03",
    app: "Vínculo",
    from: "Alice ❤️ (Lice)",
    preview: "não pode ser, não pode ser",
  },
  { id: "NT_21", at: "09/03 11:00", app: "Vínculo", from: "Pai", preview: "me ligaram agora. eu não sei o que dizer" },
];

/* ------------------------------------------------------------------ */
/* Saúde                                                               */
/* ------------------------------------------------------------------ */

export const HEALTH_DAY = {
  device: "Pulso Band 4",
  lastSync: "08/03/2026, 19h58",
  steps: 3418,
  lastHeartRate: "19h58 — 71 bpm",
  readingsAfter: "nenhuma",
  fallAlert: "19h58 — Queda detectada. Aguardando confirmação. Nenhuma resposta do usuário.",
  sleepNextNight: "não registrado",
};

/** Série do dia 08/03, usada no gráfico. */
export const HEART_SERIES: Array<{ time: string; bpm: number | null }> = [
  { time: "00h", bpm: 58 },
  { time: "03h", bpm: 61 },
  { time: "06h", bpm: 64 },
  { time: "09h", bpm: 77 },
  { time: "11h", bpm: 82 },
  { time: "13h", bpm: 79 },
  { time: "15h", bpm: 80 },
  { time: "17h", bpm: 78 },
  { time: "18h30", bpm: 81 },
  { time: "19h31", bpm: 84 },
  { time: "19h44", bpm: 96 },
  { time: "19h50", bpm: 108 },
  { time: "19h57", bpm: 118 },
  { time: "19h58", bpm: 71 },
  { time: "20h", bpm: null },
  { time: "21h", bpm: null },
  { time: "22h", bpm: null },
];

export const HEALTH_TREND = [
  { metric: "Peso", before: "63,1 kg", after: "54,2 kg", window: "jun/2025 → mar/2026" },
  { metric: "Sono médio", before: "7h12", after: "4h48", window: "jun/2025 → mar/2026" },
  { metric: "Passos por dia", before: "9.100", after: "3.900", window: "jun/2025 → mar/2026" },
  {
    metric: "Despertar recorrente",
    before: "—",
    after: "02h41 em 117 noites",
    window: "desde jul/2025",
    clueId: "CLUE_056",
  },
];

/* ------------------------------------------------------------------ */
/* Ajustes                                                             */
/* ------------------------------------------------------------------ */

export const SCREEN_TIME = [
  { period: "18h44–18h52", state: "desbloqueado", app: "Rumo, Vínculo" },
  { period: "19h39–19h45", state: "desbloqueado", app: "Fluxo, Câmera" },
  { period: "19h46–19h52", state: "tela apagada", app: "Voz Segura (gravação em segundo plano)" },
  { period: "19h52–20h11", state: "bloqueado", app: "—" },
  { period: "20h11–20h19", state: "desbloqueado", app: "Vínculo (8 min)", flag: true },
  { period: "20h24–20h26", state: "desbloqueado", app: "Bloco — 3 falhas de autenticação", flag: true },
  { period: "20h29–20h30", state: "desbloqueado", app: "Voz Segura — 2 falhas de autenticação", flag: true },
  { period: "20h41 / 20h47 / 21h13", state: "desbloqueado", app: "Vínculo (picos de menos de 1 min)", flag: true },
  { period: "21h18", state: "desbloqueado", app: "Telefone", flag: true },
  { period: "21h20–06h32", state: "bloqueado, sem interação", app: "—" },
];

export const SETTINGS_ABOUT = [
  { label: "Modelo", value: "Aurora N21 (Android 14)" },
  { label: "IMEI", value: "35 782901 447712 3" },
  { label: "Último desbloqueio bem-sucedido", value: "08/03/2026 21h18" },
  { label: "Tempo de tela em 08/03", value: "1h58 · sendo 39 min depois das 19h58" },
  { label: "Índice da câmera", value: "próximo arquivo: 0447 — coerente com a última foto salva" },
];

export const WIFI_NETWORKS = [
  { ssid: "Vidal412_2G", note: "casa" },
  { ssid: "UFJF-VISITANTE", note: "faculdade" },
  { ssid: "NAU_CLIENTES", note: "bar" },
  { ssid: "Fontoura_5G", note: "salva em 11/2023", clueId: "CLUE_059" },
];

export const SETTINGS_SECURITY = [
  {
    label: "Histórico de notificações",
    value: "Retenção estendida ATIVADA em 14/10/2025 — 120 dias",
    note: "É por isso que as prévias de 08/03 ainda existem em maio.",
  },
  { label: "Backup do Vínculo", value: "Automático, diário, 19h30" },
  { label: "Localização", value: "Sempre ativa. Dados móveis desligados em 08/03 às 20h12." },
];
