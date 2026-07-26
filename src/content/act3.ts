/**
 * Pacote narrativo do Ato 3 — carregado sob demanda.
 * Gravações, e-mails da criminalista, declaração, corridas e o contato anônimo.
 */

import type { ClueId, TranscriptLine } from "../engine/types";
import type { MailRecord } from "./act2";

/* ------------------------------------------------------------------ */
/* Gravador                                                            */
/* ------------------------------------------------------------------ */

/** O tipo mora em `engine/types` porque vídeos também o usam. */
export type { TranscriptLine };

export type VoiceRecord = {
  id: string;
  file: string;
  at: string;
  duration: string;
  seconds: number;
  title: string;
  clueId?: ClueId;
  transcript: TranscriptLine[];
};

export const VOICES: VoiceRecord[] = [
  {
    id: "VOICE_001",
    file: "pauta_documentario.m4a",
    at: "12/05/2025 15:20",
    duration: "3:10",
    seconds: 190,
    title: "pauta_documentario",
    transcript: [
      { t: "00:00", text: "Tá gravando? Tá. Beleza." },
      {
        t: "00:04",
        text: "Ideia pro TCC, versão dezessete, tô ficando louca. Documentário sobre entregador de aplicativo. Só que não do jeito chato, entendeu, não quero fazer denúncia de faculdade, quero fazer um negócio que a pessoa assiste e sente.",
      },
      { t: "00:31", text: "Tipo: acompanhar um cara. Um só. Um turno inteiro. Sem narração. Só ele." },
      { t: "00:47", text: "Ai, isso é bom. Isso é muito bom. Lice vai falar que eu tô sendo dramática de novo." },
      { t: "01:02", text: "(risada) Ela sempre fala." },
      {
        t: "01:10",
        text: "Ó, lembrete pra mim mesma do futuro: se você tiver ouvindo isso e não tiver feito, você é uma vagabunda.",
      },
      { t: "01:20", text: "Beijo, Clara do futuro. Te amo. Faz o TCC." },
      { t: "01:26", text: "(fim da fala; ruído de rua até 3:10)" },
    ],
  },
  {
    id: "VOICE_002",
    file: "_.m4a",
    at: "01/03/2026 23:40",
    duration: "4:51",
    seconds: 291,
    title: "sem título",
    transcript: [
      { t: "00:00", text: "(silêncio, 14 segundos)" },
      { t: "00:14", text: "Não sei pra quem eu tô falando isso." },
      {
        t: "00:22",
        text: "Faz duzentos e cinquenta e dois dias. Eu contei. Eu conto todo dia, é a primeira coisa que eu faço quando acordo, antes de abrir o olho eu já sei o número.",
      },
      {
        t: "00:41",
        text: "Eu não vou dizer nome nenhum aqui. Nem o dela nem o meu. Porque se eu disser eu vou ter que ouvir de volta.",
      },
      {
        t: "01:03",
        text: "A gente tinha bebido. As duas. Eu mais. Eu dormi no carro, eu juro por Deus que eu dormi, eu acordei com o barulho.",
      },
      {
        t: "01:20",
        text: "Não foi um barulho de batida. Foi um barulho… mole. Eu não sei explicar. Eu acordei com aquilo e olhei pra trás e tinha uma moto no chão e uma coisa no chão que não era a moto.",
      },
      { t: "01:46", text: "E eu gritei. Eu gritei para, para, para, para. Eu gritei tanto que no dia seguinte eu tava rouca." },
      { t: "02:01", text: "E ela não parou." },
      {
        t: "02:06",
        text: "Ela parou. Ela parou onze segundos. Eu contei depois, várias vezes, eu reconstruí, foi onze segundos. E aí ela acelerou.",
      },
      { t: "02:24", text: "E eu deixei." },
      {
        t: "02:27",
        text: "Essa é a parte que ninguém entende quando eu imagino contando. Todo mundo vai perguntar por que você não desceu. E a resposta é que eu não desci. Só isso. Não tem resposta melhor. Eu não desci.",
      },
      {
        t: "02:51",
        text: "Depois ela me ligou de madrugada e ficou vinte e dois minutos falando comigo, e no fim daqueles vinte e dois minutos eu já tava do lado dela. Ela é boa nisso. Ela é advogada, gente. Ela é boa nisso.",
      },
      {
        t: "03:14",
        text: "Ela me fez sacar o dinheiro do conserto. Mil oitocentos e cinquenta. Disse que se saísse da conta dela ia parecer confissão, que dinheiro deixa rastro, que ninguém ia olhar pra minha conta.",
      },
      { t: "03:32", text: "E eu saquei. Claro que eu saquei." },
      {
        t: "03:41",
        text: "Eu mando quatrocentos reais todo dia dois pra mãe dele. Ela acha que é de uma ONG. Eu inventei uma ONG. Eu inventei o nome da ONG.",
      },
      { t: "04:03", text: "Eu tô pagando pensão pra uma mulher que ia me cuspir na cara." },
      { t: "04:12", text: "(pausa longa)" },
      { t: "04:29", text: "Amanhã eu ligo pra doutora. Amanhã." },
      { t: "04:35", text: "(fim)" },
    ],
  },
  {
    id: "VOICE_003",
    file: "pra eles.m4a",
    at: "07/03/2026 23:12",
    duration: "7:02",
    seconds: 422,
    title: "pra eles",
    transcript: [
      { t: "00:00", text: "Dona Marlene, boa noite." },
      {
        t: "00:05",
        text: "A senhora não me conhece. Meu nome é Clara Mendonça Vasques, eu tenho vinte e quatro anos e eu moro em Juiz de Fora, no São Mateus.",
      },
      { t: "00:17", text: "Eu tô gravando isso porque eu tentei escrever quatro vezes e eu não consegui passar da primeira linha." },
      { t: "00:26", text: "Eu estava dentro do carro que matou o seu filho." },
      { t: "00:31", text: "(pausa, 9 segundos)" },
      {
        t: "00:40",
        text: "Eu não estava dirigindo. Mas eu estava dentro. E eu vi. E eu não fiz nada. E eu passei duzentos e cinquenta e oito dias não fazendo nada.",
      },
      {
        t: "01:02",
        text: "O dinheiro que a senhora recebe todo dia dois não é de ONG nenhuma. Não existe Instituto Caminho Novo. Eu inventei porque eu achei que se eu mandasse o dinheiro doía menos, e não dói. Não dói menos nada.",
      },
      {
        t: "01:24",
        text: "Eu fui no ato de seis meses. Eu fiquei dentro do carro. Eu li a faixa da senhora. Eu vi o seu filho mais velho segurando um pedaço da faixa e eu fiquei lá dentro do carro e eu não desci de novo.",
      },
      { t: "01:47", text: "Eu não desço nunca, dona Marlene. Essa é a coisa que eu descobri sobre mim." },
      {
        t: "02:04",
        text: "Segunda-feira, nove horas, eu tenho hora marcada com uma advogada. Eu vou contar tudo, com nome, com data, com placa. Eu vou dizer quem tava dirigindo e eu vou dizer que eu tava do lado e não desci.",
      },
      {
        t: "02:29",
        text: "A doutora falou que eu posso ser processada por omissão de socorro. Eu perguntei quanto era. Ela falou de seis meses a um ano. E eu falei “só isso?”.",
      },
      { t: "02:44", text: "Ela não entendeu por que eu falei “só isso”." },
      {
        t: "02:50",
        text: "O seu filho pediu pra eu avaliar a entrega dele três horas antes. Eu dei cinco estrelas. Tá no meu celular até hoje. Eu não consigo apagar.",
      },
      { t: "03:11", text: "Ele falou “boa festa moça”." },
      { t: "03:16", text: "(pausa longa, 20 segundos)" },
      { t: "03:36", text: "Eu não tô pedindo perdão. Eu não sou idiota. Eu sei que não tem." },
      {
        t: "03:44",
        text: "Eu só queria que a senhora soubesse o nome dele saindo da boca de alguém que estava lá. Wesley Andrade da Silva. Dezessete de abril de mil novecentos e noventa e oito.",
      },
      { t: "04:03", text: "Eu decorei. Eu decorei tudo." },
      { t: "04:09", text: "(fim da fala; ruído ambiente até 7:02)" },
    ],
  },
  {
    id: "VOICE_004",
    file: "gravacao_080326_1946.m4a",
    at: "08/03/2026 19:46",
    duration: "6:12",
    seconds: 372,
    title: "gravacao_080326_1946",
    clueId: "CLUE_010",
    transcript: [
      { t: "00:00", text: "(vento; passos sobre cascalho; respiração)" },
      { t: "00:11", who: "CLARA", text: "Tô gravando. Desculpa. Eu preciso." },
      { t: "00:19", text: "(silêncio; carro se aproximando; porta batendo; passos)" },
      { t: "00:52", who: "A.", text: "Que frio, meu Deus." },
      { t: "00:55", who: "A.", text: "Você tá aqui desde quando?" },
      { t: "00:58", who: "CLARA", text: "Meia hora." },
      { t: "01:02", who: "A.", text: "Cacau… você tá péssima." },
      { t: "01:07", who: "CLARA", text: "Eu sei." },
      { t: "01:12", who: "A.", text: "Senta aqui comigo. Vem. (pausa) Fala." },
      { t: "01:24", who: "CLARA", text: "Segunda-feira nove horas eu tenho hora marcada com a doutora Yara. Eu vou contar tudo." },
      { t: "01:33", who: "A.", text: "(pausa, 6 segundos) Não." },
      { t: "01:41", who: "CLARA", text: "Alice—" },
      { t: "01:43", who: "A.", text: "Não, não, não. A gente conversou isso na quinta. Eu te pedi uma semana." },
      { t: "01:50", who: "CLARA", text: "Você me pediu uma semana em julho também." },
      { t: "01:55", who: "A.", text: "(riso curto) Ah, então é isso. Você tá cobrando fatura." },
      { t: "02:03", who: "CLARA", text: "Eu não tô cobrando nada. Eu tô te avisando porque eu não ia fazer isso sem te avisar." },
      { t: "02:12", who: "A.", text: "Que consideração." },
      { t: "02:15", who: "CLARA", text: "Eu vou dizer que você tava dirigindo." },
      { t: "02:19", who: "A.", text: "(pausa, 4 segundos)" },
      {
        t: "02:23",
        who: "A.",
        text: "Eu tava dirigindo. Ótimo. E você tava do lado. Você lembra disso, né? Você não é testemunha, Cacau, você é ré. A gente cai junto.",
      },
      { t: "02:38", who: "CLARA", text: "Eu sei." },
      {
        t: "02:40",
        who: "A.",
        text: "Não, você não sabe. Você acha que sabe porque você leu três coisas na internet. Você não faz ideia do que é responder processo nesse país.",
      },
      { t: "02:52", who: "CLARA", text: "E ele fazia ideia?" },
      { t: "02:56", who: "A.", text: "(pausa) Não faz isso." },
      { t: "03:00", who: "CLARA", text: "Wesley. O nome dele é Wesley." },
      { t: "03:04", who: "A.", text: "Para." },
      { t: "03:06", who: "CLARA", text: "Ele tinha vinte e sete anos e ele entregou a nossa esfiha, Alice. A nossa. Naquela mesma noite." },
      { t: "03:15", who: "A.", text: "Para." },
      { t: "03:17", text: "(vento; 8 segundos)" },
      {
        t: "03:25",
        who: "A.",
        text: "(voz baixa) Eu perdi onze segundos da minha vida. Onze. E eu vou pagar por isso pelos próximos vinte anos, e a minha mãe vai ver, e o meu pai vai ver, e eu não vou nunca mais—",
      },
      { t: "03:44", who: "CLARA", text: "E ele perdeu tudo." },
      { t: "03:47", who: "A.", text: "(pausa, 5 segundos) Você tá gozando disso. Você tá gozando de ser a boa agora." },
      { t: "03:56", who: "CLARA", text: "Eu tô com quarenta e três quilos de vontade de morrer, Lice. Eu não tô gozando de nada." },
      { t: "04:05", who: "A.", text: "(pausa) Então não vai." },
      { t: "04:09", who: "CLARA", text: "Eu vou." },
      { t: "04:11", who: "A.", text: "Clara. Olha pra mim. Você não vai." },
      { t: "04:16", who: "CLARA", text: "Eu gravei." },
      { t: "04:18", who: "A.", text: "(pausa, 3 segundos) Gravou o quê?" },
      { t: "04:22", who: "CLARA", text: "Tudo. Eu gravei tudo. Faz meses." },
      { t: "04:27", who: "A.", text: "(voz alterada) Você gravou o quê, Clara? Me responde. Você gravou o quê?" },
      { t: "04:34", who: "CLARA", text: "Você tá me machucando." },
      { t: "04:36", who: "A.", text: "(imediatamente) Desculpa. Desculpa, desculpa, desculpa. (pausa) Desculpa." },
      { t: "04:47", text: "(vento; 12 segundos)" },
      { t: "05:01", who: "A.", text: "(voz normalizada) Onde tá?" },
      { t: "05:04", who: "CLARA", text: "No meu telefone." },
      { t: "05:07", who: "A.", text: "Me dá o telefone." },
      { t: "05:10", who: "CLARA", text: "Não." },
      { t: "05:12", who: "A.", text: "Cacau. Me dá o telefone." },
      { t: "05:16", who: "CLARA", text: "(pausa longa, 9 segundos)" },
      { t: "05:25", who: "CLARA", text: "Eu vou parar de gravar." },
      { t: "05:28", who: "A.", text: "…O quê?" },
      {
        t: "05:31",
        who: "CLARA",
        text: "Eu vou parar de gravar. Eu não quero te gravar, Alice. Eu nunca quis. Eu queria que você viesse comigo amanhã.",
      },
      { t: "05:44", who: "CLARA", text: "Nove horas. Rua Espírito Santo. A gente entra junto." },
      { t: "05:51", who: "A.", text: "(silêncio)" },
      { t: "05:56", who: "CLARA", text: "A gente cai junto. Você que falou." },
      { t: "06:02", who: "A.", text: "(silêncio)" },
      { t: "06:06", who: "CLARA", text: "Tá. Tô desligando." },
      { t: "06:10", text: "(clique)" },
      { t: "06:12", text: "FIM DA GRAVAÇÃO" },
    ],
  },
];

/** Trecho que, enviado à melhor amiga, derruba a versão dela. */
export const DECISIVE_EXCERPT = {
  voiceId: "VOICE_004",
  from: "02:19",
  to: "02:38",
  label: "Trecho 02:19 – 02:38",
  text:
    "Eu tava dirigindo. Ótimo. E você tava do lado. Você lembra disso, né? Você não é testemunha, Cacau, você é ré. A gente cai junto.",
};

/* ------------------------------------------------------------------ */
/* E-mails da conta secundária                                         */
/* ------------------------------------------------------------------ */

export const MAIL_ARCHIVE: MailRecord[] = [
  {
    id: "MAIL_Y1",
    account: "arquivo",
    at: "09/02/2026 19:48",
    from: "Clara",
    to: "Trindade Advocacia",
    subject: "consulta",
    clueId: "CLUE_015",
    body:
      "Boa noite, doutora.\n\nAchei seu contato no site da OAB. Não sei se a senhora atende esse tipo de coisa.\n\nEu preciso saber o que acontece com uma pessoa que estava dentro de um carro quando aconteceu uma coisa grave e não fez nada. A pessoa não estava dirigindo. A pessoa estava, tecnicamente, dormindo.\n\nFaz oito meses.\n\nEu consigo pagar. Não muito, mas eu consigo.\n\nClara V.",
  },
  {
    id: "MAIL_Y2",
    account: "arquivo",
    at: "10/02/2026 09:12",
    from: "Dra. Yara Trindade",
    subject: "Re: consulta",
    body:
      "Bom dia, Clara.\n\nAtendo, sim.\n\nAntes de qualquer coisa, uma orientação técnica que eu peço que você siga à risca: não me relate detalhes por escrito. Nem por e-mail, nem por mensagem. Nada de nomes, placas, datas exatas, endereços. E-mail não é sigiloso e pode ser periciado.\n\nMe diga apenas se a “coisa grave” resultou em morte. Sim ou não.\n\nAtenciosamente,\nYara Trindade — OAB/MG 118.442",
  },
  { id: "MAIL_Y3", account: "arquivo", at: "10/02/2026 23:31", from: "Clara", subject: "Re: Re: consulta", body: "Sim." },
  {
    id: "MAIL_Y4",
    account: "arquivo",
    at: "11/02/2026 08:40",
    from: "Dra. Yara Trindade",
    subject: "Re: Re: Re: consulta",
    body:
      "Clara,\n\nVou ser direta porque você merece.\n\nExiste a possibilidade de responder por omissão de socorro, e existe a discussão sobre partícipe. Não é pequeno, mas também não é o que você provavelmente está imaginando à noite.\n\nDuas coisas jogam a seu favor e você precisa saber delas desde já:\n\n1. Apresentação espontânea, antes de qualquer indiciamento, pesa muito.\n2. Prova. Se você tem qualquer registro contemporâneo dos fatos — anotação datada, fotografia, gravação —, isso muda o seu papel de investigada para colaboradora. Isso é o que mais importa e é o que eu preciso ver.\n\nUma pergunta que você não precisa responder por e-mail, só pensar: você seria a única pessoa a se apresentar?\n\nSe a resposta for não, isso muda tudo. Inclusive o seu risco pessoal.\n\nYara",
  },
  {
    id: "MAIL_Y5",
    account: "arquivo",
    at: "23/02/2026 01:14",
    from: "Clara",
    subject: "Re: Re: Re: Re: consulta",
    body:
      "Doutora,\n\nEu tenho registro. Tenho bastante. Tenho desde o primeiro dia.\n\nSobre a sua pergunta: eu seria a única. A outra pessoa não vai.\n\nA outra pessoa é advogada. Formou ano passado.\n\nEu não sei se isso importa mas eu queria que a senhora soubesse antes.\n\nDesculpa mandar isso uma e quinze da manhã.\n\nClara",
  },
  {
    id: "MAIL_Y6",
    account: "arquivo",
    at: "02/03/2026 09:12",
    from: "Clara",
    subject: "presencial",
    body:
      "Doutora, preciso marcar presencial. Não é sobre mim como vítima.\n\nEu levo tudo. Papel, foto e áudio.\n\nQualquer dia da semana que vem, de manhã, de preferência antes das dez porque depois das dez eu desisto das coisas.",
  },
  {
    id: "MAIL_Y7",
    account: "arquivo",
    at: "02/03/2026 11:47",
    from: "Dra. Yara Trindade",
    subject: "Re: presencial",
    clueId: "CLUE_015",
    body:
      "Clara,\n\nSegunda-feira, 09/03, às 09h00. Rua Espírito Santo, 1.088, sala 704.\n\nTraga tudo em duas cópias e deixe uma cópia em local diferente da sua casa. Nuvem serve. Isso é padrão, não é alarmismo.\n\nUma última orientação, e essa eu peço que você leve a sério mesmo achando exagero: a partir de agora, não discuta esse assunto sozinha com a outra pessoa. Se ela quiser conversar, marque com terceiro presente, em lugar público, ou não marque.\n\nNos vemos segunda.\n\nYara Trindade",
  },
];

/* ------------------------------------------------------------------ */
/* Declaração                                                          */
/* ------------------------------------------------------------------ */

export const DOC_DECLARACAO = `DECLARAÇÃO

Clara Mendonça Vasques, CPF 145.882.706-98, residente à Rua Coronel Vidal, 412, apto 302, Juiz de Fora/MG.

Declaro, por livre e espontânea vontade, para apresentação à Dra. Yara Trindade (OAB/MG 118.442) em 09/03/2026, os seguintes fatos:

1. Na madrugada de 22 de junho de 2025, por volta das 02h47, eu estava no banco do carona de um veículo Honda Fit, cor prata, placa GMB4J09, registrado em nome de Théo Barcellos Ramalho.

2. O senhor Théo Barcellos Ramalho não estava no veículo e não tinha conhecimento de nada. Ele emprestou o carro na noite anterior, no aniversário dele, e foi embora do Bar Nau por aplicativo. Faço questão de registrar isso em primeiro lugar.

3. O veículo era conduzido por uma amiga minha, cujo nome eu direi pessoalmente à doutora. Eu não consigo escrever o nome dela. Já tentei quatro vezes.

4. O veículo atingiu, pela traseira, a motocicleta conduzida por Wesley Andrade da Silva, 27 anos.

5. O veículo parou por cerca de onze segundos e prosseguiu. Eu pedi para descer e para socorrer. Eu não insisti. Eu não desci. Eu não liguei para o 192 nem para o 190, naquela noite nem depois.

6. Em 24/06/2025 eu saquei R$ 1.850,00 da minha conta, a pedido dela, para pagamento do conserto do veículo na Funilaria Zé do Bloco (NF 2214).

7. Desde 02/07/2025 eu transfiro R$ 400,00 mensais para a mãe da vítima, sob identificação falsa.

8. Em 05/03/2026 eu comuniquei a ela minha decisão de me apresentar. A resposta dela está registrada por escrito em minhas anotações e em gravação de áudio.

Estou ciente de que posso responder criminalmente. É por isso que estou aqui.

Juiz de Fora, 8 de março de 2026.
Clara Mendonça Vasques`;

/* ------------------------------------------------------------------ */
/* Corridas                                                            */
/* ------------------------------------------------------------------ */

export const RIDES_OWN = [
  { id: "RD_01", at: "20/12/2025 13:50", route: "Casa → Cemitério Parque da Saudade", price: "R$ 22,40" },
  { id: "RD_02", at: "20/12/2025 15:20", route: "Cemitério → Casa", price: "R$ 23,10" },
  { id: "RD_03", at: "14/02/2026 19:00", route: "Casa → Cinema Independência", price: "R$ 14,00" },
];

export const RIDES_SHARED = {
  header: "Conta: Lucas B. · 4 capturas recebidas em conversa",
  note: "Enviadas pelo namorado depois de garantia de sigilo.",
  clueId: "CLUE_019",
  trips: [
    { at: "08/03/2026 17:02", route: "Granbery → Manoel Honório", price: "R$ 11,90" },
    { at: "08/03/2026 18:36", route: "Centro → Bairro Industrial", price: "R$ 18,40" },
    { at: "08/03/2026 19:51", route: "Santa Terezinha → Rodoviária", price: "R$ 26,70", flag: true },
    { at: "08/03/2026 20:38", route: "Rodoviária → Cascatinha", price: "R$ 31,20" },
    { at: "08/03/2026 23:14", route: "Centro → São Pedro", price: "R$ 19,80" },
    { at: "09/03/2026 01:41", route: "Bairro Alto → Benfica", price: "R$ 24,10" },
  ],
  summary: "27 corridas entre 17h02 e 01h41. Distância do mirante no horário crítico: 34 km.",
};

/* ------------------------------------------------------------------ */
/* Autenticador                                                        */
/* ------------------------------------------------------------------ */

export const AUTH_CODES = [
  { account: "E-mail — clara.mendonca.vasques", code: "448 219" },
  { account: "E-mail — clara.vsq.arquivo", code: "903 774", highlight: true },
  { account: "Banco", code: "118 402" },
  { account: "Nimbo", code: "662 015" },
  { account: "Rede Social", code: "240 887" },
];

/* ------------------------------------------------------------------ */
/* Contato anônimo — falas canônicas                                   */
/* ------------------------------------------------------------------ */

/**
 * Estas linhas nunca passam pela tradução automática: são texto final.
 * O apelido e o detalhe do casaco são pistas e precisam sair exatos.
 */
export const UNKNOWN_ENTRY_INFORMED = [
  "Você não é a Clara.",
  "Eu sei quem está com esse número. A mãe dela contratou alguém.",
  "Eu não vou dizer quem eu sou. Não insista nisso, é a única coisa que eu não vou negociar.",
  "Você está procurando na direção errada há dois meses, igual à polícia.",
  "Pergunta pro namorado dela onde o carro dele estava em 22 de junho do ano passado.",
  "Boa noite.",
];

export const UNKNOWN_ENTRY_FALLBACK = [
  "Você não é a Clara.",
  "Eu acompanho esse número desde março. Ele nunca tinha se movimentado.",
  "Você tá indo devagar. Deixa eu te economizar duas semanas: 22 de junho de 2025, Avenida Barão do Cristal. Procura.",
  "E pergunta pro namorado dela de quem era o carro.",
];

export const UNKNOWN_SCRIPTED = {
  /** Deslize do apelido — só dispara depois de empatia genuína. */
  nickname: {
    id: "BEAT_NICK",
    lines: ["A Cacau nunca ia fazer isso com a mãe dela. Nunca.", "Você acha que ela faria?"],
    clueId: "CLUE_026",
  },
  /** Deslize do casaco. */
  coat: {
    id: "BEAT_COAT",
    lines: [
      "Ele deixou ela sozinha lá em cima.",
      "Com o casaco dela dobrado em cima da mureta, igual ela sempre fazia.",
    ],
    clueId: "CLUE_027",
  },
  /** O valor exato do conserto. */
  amount: {
    id: "BEAT_AMOUNT",
    lines: [
      "Mil oitocentos e cinquenta reais em espécie, em vinte e quatro de junho.",
      "Você é perito. Me diz uma coisa: quem paga um conserto desse em dinheiro?",
    ],
    clueId: "CLUE_040",
  },
  /** Concessão quando pressionada duas vezes sobre a fonte. */
  concession: {
    id: "BEAT_SOURCE",
    lines: ["A Clara me contou.", "Pronto. Falei. Agora deixa isso pra lá."],
    clueId: "CLUE_065",
  },
  /** Pergunta obsessiva por gravações. */
  recordings: {
    id: "BEAT_REC",
    lines: [
      "Uma coisa.",
      "Ela deixou alguma coisa gravada? Ela gravava tudo. Ela sempre gravou tudo.",
      "Só me diz se você já ouviu.",
    ],
    clueId: "CLUE_064",
  },
  /** Reação ao nome próprio. */
  nameRefusal: {
    id: "BEAT_NAME",
    lines: ["Não."],
    silenceMs: 6 * 60 * 1000,
  },
  /** Reação à discagem do número. */
  dialed: {
    id: "BEAT_DIAL",
    lines: ["Não faz isso."],
  },
};
