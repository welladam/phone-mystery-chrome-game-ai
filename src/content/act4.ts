/**
 * Act 4 narrative package—loaded only when the act begins.
 *
 * This module is the only place in the project where the full ending exists.
 * The file is not downloaded until the player reaches this point.
 */

/* ------------------------------------------------------------------ */
/* Main-conversation collapse                                         */
/* ------------------------------------------------------------------ */

export const COLLAPSE_SILENCE_MS = 11 * 60 * 1000;

/** Final Portuguese lines, never generated or translated by AI. */
export const COLLAPSE_LINES = [
  { at: "23:58", text: "onde vc achou isso" },
  { at: "23:58", text: "onde" },
  {
    at: "00:01",
    text:
      "eu tentei abrir o aplicativo. eu tentei três vezes na nota e duas no gravador e eu fiquei ali sentada no chão daquele mirante com o telefone dela na mão tentando adivinhar a senha da minha melhor amiga",
  },
  {
    at: "00:02",
    text:
      "eu sabia o pin da tela. eu sei o pin da tela desde 2019, quando ela quebrou o braço e eu tinha que atender pra ela",
  },
  { at: "00:02", text: "eu sabia a senha do telefone dela e eu não sabia mais nada sobre ela" },
  {
    at: "00:04",
    text:
      "ela sentou na mureta. ela sentava lá desde os treze anos, de costas pro vazio, eu falava pra ela não fazer isso e ela ria",
  },
  { at: "00:05", text: "e ela pegou o telefone e falou que ia guardar" },
  { at: "00:06", text: "eu só queria o telefone" },
  { at: "00:06", text: "eu só queria o telefone" },
  { at: "00:11", text: "ela desligou a gravação por mim. vc ouviu isso? ela desligou por mim" },
  { at: "00:11", text: "ela ia me levar junto. de mão dada. nove horas da manhã" },
  { at: "00:14", text: "eu vou ligar pro meu pai agora" },
  { at: "00:15", text: "me faz um favor. não fala pra dona Regina que foi eu. deixa eu falar" },
  { at: "00:15", text: "eu devo isso pra ela" },
];

export const COLLAPSE_CLOSING = "Alice ❤️ (Lice) saiu da conversa.";

export const UNKNOWN_COLLAPSE_LINES = [
  { at: "00:22", text: "Você ouviu." },
  { at: "00:22", text: "Ela disse que ia parar de gravar." },
  {
    at: "00:23",
    text:
      "Ela disse que ia parar de gravar e eu acreditei nela, e ela parou mesmo, ela parou de verdade, e você tá aí com isso na mão.",
  },
  { at: "00:24", text: "Ela parou por mim." },
];

export const UNKNOWN_COLLAPSE_CLOSING = "O número saiu do ar. Última visualização: 00:24.";

/* ------------------------------------------------------------------ */
/* Accusation form                                                     */
/* ------------------------------------------------------------------ */

export type ChoiceField = {
  id: keyof AccusationAnswers;
  legend: string;
  options: Array<{ id: string; label: string }>;
  correct: string;
};

export type AccusationAnswers = {
  responsavel: string;
  motivo: string;
  metodo: string;
  oportunidade: string;
  contradicao: string;
};

export const ACCUSATION_FIELDS: ChoiceField[] = [
  {
    id: "responsavel",
    legend: "1. Responsável",
    correct: "Alice",
    options: [
      { id: "Alice", label: "Alice Bittencourt Fontoura — a melhor amiga" },
      { id: "R_NAMORADO", label: "Théo Barcellos Ramalho — o namorado" },
      { id: "R_MAE", label: "Regina Aparecida Mendonça — a mãe" },
      { id: "R_IRMAO", label: "Diego Andrade da Silva — o irmão da vítima do atropelamento" },
      { id: "R_NINGUEM", label: "Ninguém. Foi suicídio, como concluiu o inquérito" },
    ],
  },
  {
    id: "motivo",
    legend: "2. Motivo",
    correct: "M_ENTREGA",
    options: [
      {
        id: "M_ENTREGA",
        label:
          "Impedir que Clara se entregasse na manhã seguinte, o que a incriminaria pelo atropelamento de 22/06/2025",
      },
      { id: "M_CIUME", label: "Ciúme e deterioração do relacionamento" },
      { id: "M_DINHEIRO", label: "Dinheiro: as transferências mensais e os empréstimos" },
      { id: "M_VINGANCA", label: "Vingança pela morte do entregador" },
    ],
  },
  {
    id: "metodo",
    legend: "3. Método",
    correct: "T_EMPURRAO",
    options: [
      {
        id: "T_EMPURRAO",
        label:
          "Empurrão do parapeito durante discussão, seguido de manipulação do aparelho para forjar a linha do tempo",
      },
      { id: "T_QUEDA", label: "Queda acidental durante uma discussão, sem intervenção física" },
      { id: "T_INDUZIDO", label: "Suicídio induzido por pressão psicológica prolongada" },
      { id: "T_OUTRO", label: "Agressão física prévia e queda posterior" },
    ],
  },
  {
    id: "oportunidade",
    legend: "4. Oportunidade",
    correct: "O_ENCONTRO",
    options: [
      {
        id: "O_ENCONTRO",
        label: "Encontro marcado pela própria vítima, local isolado, sem câmeras nem testemunhas, domingo à noite",
      },
      { id: "O_INVASAO", label: "Invasão do apartamento da vítima" },
      { id: "O_ESTRADA", label: "Interceptação do carro dela na estrada" },
      { id: "O_EMBOSCADA", label: "Emboscada planejada com semanas de antecedência" },
    ],
  },
  {
    id: "contradicao",
    legend: "7. Explique uma contradição",
    correct: "C_CASACO",
    options: [
      {
        id: "C_CASACO",
        label:
          "O contato anônimo sabia do casaco dobrado na mureta — detalhe nunca divulgado, que só quem esteve lá poderia conhecer",
      },
      {
        id: "C_MAE",
        label:
          "A mãe insiste que falou com a filha às 21h: não houve chamada, houve um texto às 20h47, e ela reconstruiu a memória",
      },
      {
        id: "C_NAMORADO",
        label:
          "O namorado mentiu sobre onde estava porque rodava com a conta do primo; o histórico de corridas o inocenta",
      },
      {
        id: "C_SAQUE",
        label:
          "O saque de R$ 1.850 saiu da conta de Clara porque a outra pessoa pediu, para não deixar rastro na própria conta",
      },
    ],
  },
];

/** All four explanations are true; any one is accepted. */
export const CONTRADICTION_ALL_VALID = true;

export const DESCONHECIDA_FIELD = {
  legend: "8. Papel do “Desconhecido”",
  correct: "D_MESMA",
  options: [
    {
      id: "D_MESMA",
      label:
        "É a própria responsável, usando um chip comprado em 12/02/2026 para descobrir o que o perito tinha e desviar a suspeita",
    },
    { id: "D_JORNALISTA", label: "Uma jornalista anônima que investigava o atropelamento" },
    { id: "D_MARLENE", label: "A mãe do entregador morto" },
    { id: "D_TESTEMUNHA", label: "Uma testemunha real do atropelamento, com medo de se expor" },
  ],
};

export const SEQUENCE_CORRECT = ["15h48", "16h02", "18h27", "19h44", "19h58", "20h11"];

export const SEQUENCE_CARDS = [
  { id: "19h58", label: "A queda" },
  { id: "16h02", label: "A resposta chega: “tá bom. 19h30”" },
  { id: "20h11", label: "O aparelho é desbloqueado por outra pessoa" },
  { id: "15h48", label: "Clara propõe o encontro" },
  { id: "19h44", label: "Um carro vermelho sobe a estrada do mirante" },
  { id: "18h27", label: "“me espera lá em cima”" },
];

/* ------------------------------------------------------------------ */
/* Accusation feedback—Dr. Yara's voice                               */
/* ------------------------------------------------------------------ */

export const FEEDBACK: Record<string, { title: string; body: string; highlight?: string }> = {
  FB_THEO: {
    title: "Não vou protocolar isso.",
    body:
      "Li. Não vou protocolar isso.\n\nVocê tem o carro, tem o conserto e tem uma mentira dele sobre o domingo. Eu entendo por que você chegou aí.\n\nMas eu tenho duas coisas na sua frente e você não olhou nenhuma. A primeira é o histórico de corridas: às 19h51 ele aceitou uma chamada em Santa Terezinha. São trinta e quatro quilômetros.\n\nA segunda é pior pra você. Está no documento que ela escreveu na manhã do dia em que morreu, item dois. Ela escreveu o nome dele pra tirar ele disso. Foi a primeira coisa que ela fez.\n\nEla protegeu ele antes de proteger a si mesma. Reconsidere.",
    highlight: "CLUE_041",
  },
  FB_MAE: {
    title: "Culpa não é o mesmo que crime.",
    body:
      "Ela estava num plantão de doze horas com registro biométrico e três medicações carimbadas. E foi ela quem te contratou.\n\nE antes de você me perguntar da troca de plantão: ela pediu, sim. Em seis de março, para ficar com a filha. Foi indeferida no dia sete, por falta de cobertura. Às 20h14 daquela noite ela assinou uma ficha de reanimação no leito 307.\n\nCulpa não é o mesmo que crime. Se fosse, essa mulher já estava presa desde janeiro — e ela sabe disso melhor do que você.",
    highlight: "CLUE_073",
  },
  FB_IRMAO: {
    title: "Esse homem não é o segundo cadáver desta história.",
    body:
      "Estava ao vivo, em Barbacena, para duzentas e catorze pessoas, das 19h20 às 20h05.\n\nEsse homem passou um ano pedindo que alguém dissesse o nome do irmão dele em voz alta. Não faz dele o segundo cadáver dessa história.",
    highlight: "CLUE_036",
  },
  FB_SUICIDIO: {
    title: "Então me explica quem digitou às 21h13.",
    body: "Então me explica quem digitou às 21h13.\n\nVolta.",
    highlight: "CLUE_005",
  },
  FB_PROVA_FRACA: {
    title: "O nome está certo. A prova, não.",
    body:
      "O nome está certo. A prova, não.\n\nVocê me deu documentos que dizem a mesma coisa. Eu preciso de três que digam coisas diferentes:\n\n— que ela estava lá;\n— que a Clara já estava morta quando o telefone foi usado;\n— e por que alguém faria isso.\n\nSem os três, isso é uma tese. Com os três, é um inquérito.",
  },
  FB_DESCONHECIDA: {
    title: "Esse número que te procurou.",
    body:
      "Uma última coisa antes de eu protocolar.\n\nEsse número que te procurou. Você acha mesmo que era outra pessoa?\n\nOlha o horário da ligação de três segundos no dia oito de março. E olha a data em que essa linha foi ativada.\n\nDepois me responde de novo.",
    highlight: "CLUE_028",
  },
  FB_PARCIAL: {
    title: "Está quase.",
    body:
      "Está quase. Falta encaixar o resto.\n\nRevise os campos que ficaram em branco ou incoerentes com a linha do tempo que você mesmo montou. Eu preciso de uma peça que se sustente sozinha na mesa de um delegado que já arquivou esse caso uma vez.",
  },
};

/* ------------------------------------------------------------------ */
/* Revelation                                                          */
/* ------------------------------------------------------------------ */

export const REVEAL_TIMELINE = [
  { at: "11h52", text: "📸 3s — uma palma cobrindo a lente" },
  { at: "12h14", text: "🗒 “ela falou que ia me impedir”" },
  { at: "15h48", text: "preciso te falar hoje. pessoalmente. pedra lascada 19h30?" },
  { at: "16h02", text: "ai clara…. tá bom. 19h30" },
  { at: "18h27", text: "to saindo daqui a pouco. me espera lá em cima" },
  { at: "19h31", text: "localização fixa" },
  { at: "19h44", text: "📷" },
  { at: "19h46", text: "⏺ 6:12" },
  { at: "19h58", text: "71 → 0 bpm · queda detectada", emphasis: true },
  { at: "20h11", text: "🔓 desbloqueado" },
  { at: "20h19", text: "🗑 conversa apagada" },
  { at: "20h24", text: "✕ ✕ ✕" },
  { at: "20h29", text: "✕ ✕" },
  { at: "20h41", text: "cheguei em casa, tô bem. amanhã eu te ligo" },
  { at: "20h42", text: "ainda bem ❤️❤️", emphasis: true, hold: true },
  { at: "21h18", text: "📞 0:03" },
  { at: "21h20", text: "🔒" },
];

export const REVEAL_CARDS = [
  {
    id: "RC_1",
    title: "Wesley Andrade da Silva",
    body:
      "Morreu às 02h47 de 22 de junho de 2025, na Avenida Barão do Cristal, atropelado por um Honda Fit prata conduzido por Alice Bittencourt Fontoura, que havia bebido e não parou. Ele tinha 27 anos. Havia entregado, três horas antes, o jantar da festa de aniversário de onde o carro saiu.",
  },
  {
    id: "RC_2",
    title: "Clara Mendonça Vasques",
    body:
      "Estava no banco do carona. Ela gritou. Ela não desceu. Passou 259 dias pagando R$ 400 por mês para uma mulher que não sabia o nome dela, e marcou, para as nove da manhã de 9 de março de 2026, a hora em que ia contar tudo.",
  },
  {
    id: "RC_3",
    title: "Alice",
    body:
      "Ouviu isso às 19h52 de 8 de março, num mirante onde as duas subiam desde os treze anos. Às 19h58, Clara sentou no parapeito com o telefone na mão. Alice quis o telefone.\n\nDepois ficou lá em cima por uma hora e vinte e dois minutos, apagou uma conversa, mandou três mensagens no nome de uma morta, respondeu a si mesma com dois corações, e desceu.",
  },
  {
    id: "RC_4",
    title: "Regina",
    body:
      "Pediu para sair daquele plantão em seis de março, para ficar com a filha. O hospital negou por falta de cobertura. Às 19h58 ela estava no terceiro andar; às 20h14 ela fez compressão torácica em um homem de setenta e um anos no leito 307, e o homem sobreviveu.\n\nNunca falou com a filha às nove da noite. Recebeu um texto às 20h47 e passou dois meses acreditando que tinha ouvido a voz dela uma última vez.\n\nEm janeiro disse: “esquece isso, não estraga a sua vida.” No almoço do último dia disse: “se você for, eu vou te impedir.” Nunca soube o nome da menina — a filha não deixou.\n\nEla vai carregar isso.",
  },
  {
    id: "RC_5",
    title: "Théo",
    body:
      "Emprestou um carro no próprio aniversário e passou dois meses sendo o assassino da cidade porque não podia dizer que rodava com a conta do primo. Nunca soube de nada. Clara escreveu o nome dele na primeira linha da declaração, para tirá-lo disso. Foi a primeira coisa que ela fez naquela manhã.",
  },
  {
    id: "RC_6",
    title: "O “Desconhecido”",
    body:
      "Era Alice. O chip foi comprado em 12 de fevereiro de 2026 — três semanas antes de haver um crime a esconder, e no dia seguinte àquele em que Clara mencionou pela primeira vez ter procurado uma advogada.\n\nEla precisou te contar metade da verdade para você acusar a pessoa errada. Foi assim que você chegou nela.\n\nE foi ela quem te ofereceu a mãe. Chorando, uma vez só, pedindo que você fosse gentil.",
  },
];

export const REVEAL_EPILOGUE = {
  audioLine:
    "Ó, lembrete pra mim mesma do futuro: se você tiver ouvindo isso e não tiver feito, você é uma vagabunda. Beijo, Clara do futuro. Te amo. Faz o TCC.",
  closing: [
    "O inquérito 0447/2026 foi reaberto em 11 de maio de 2026.",
    "O inquérito 1188/2025 — morte de Wesley Andrade da Silva — foi desarquivado no mesmo despacho.",
  ],
  quiet: [
    "Marlene Andrade da Silva não recebeu o Pix de R$ 400,00 no dia 2 de junho.",
    "Foi a primeira vez em nove meses.",
  ],
  diegoVariant: [
    "eu escutei 4 vezes",
    "ela falou o nome dele",
    "obrigado",
  ],
};

/* ------------------------------------------------------------------ */
/* Late-arriving fact                                                  */
/* ------------------------------------------------------------------ */

export const LINE_ACTIVATION = {
  number: "(32) 99486-0075",
  activatedAt: "12/02/2026",
  note:
    "Linha pré-paga ativada três semanas antes da morte — e um dia depois de Clara mencionar pela primeira vez que havia procurado uma advogada.",
  clueId: "CLUE_069",
};
