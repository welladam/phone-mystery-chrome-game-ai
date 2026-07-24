/**
 * Pacote narrativo do Ato 2 — carregado sob demanda.
 * Documentos, extratos, navegação, lixeira e a nota trancada.
 */

import type { ClueId } from "../engine/types";

/* ------------------------------------------------------------------ */
/* E-mail — caixa principal                                            */
/* ------------------------------------------------------------------ */

export type MailRecord = {
  id: string;
  account: "principal" | "arquivo";
  at: string;
  from: string;
  to?: string;
  subject: string;
  body: string;
  clueId?: ClueId;
};

export const MAIL_MAIN: MailRecord[] = [
  {
    id: "MAIL_01",
    account: "principal",
    at: "06/03/2026 14:02",
    from: "UFJF — Coordenação de Jornalismo",
    subject: "Frequência — 8º período — advertência",
    body:
      "Prezada Clara,\n\nRegistramos 9 faltas na disciplina Redação III. Como o limite regimental é de 15, encaminhamos este aviso preventivo.\n\nCaso haja motivo de saúde, procure a coordenação com o comprovante.\n\nAtenciosamente,\nCoordenação do curso",
  },
  {
    id: "MAIL_02",
    account: "principal",
    at: "04/03/2026 09:18",
    from: "Drive",
    subject: "Seu espaço está quase cheio (14,6 GB de 15 GB)",
    clueId: "CLUE_042",
    body:
      "Olá, Clara.\n\nSua conta está usando 14,6 GB dos 15 GB disponíveis. Para continuar sincronizando conversas e fotos automaticamente, libere espaço ou amplie seu plano.\n\nO backup diário do Chat continuará sendo criado às 19h30, mas versões antigas serão descartadas.",
  },
  {
    id: "MAIL_03",
    account: "principal",
    at: "02/03/2026 11:47",
    from: "Trindade Advocacia Criminal",
    subject: "Re: Consulta",
    body: "Confirmado. Segunda, 09/03, 09h00.",
  },
  {
    id: "MAIL_04",
    account: "principal",
    at: "28/02/2026 08:00",
    from: "Banco",
    subject: "Extrato mensal disponível",
    body: "Seu extrato de fevereiro já está disponível no aplicativo. Acesso com os últimos 4 dígitos do CPF da titular.",
  },
  {
    id: "MAIL_05",
    account: "principal",
    at: "19/01/2026 22:14",
    from: "Rede Social",
    subject: "Alguém tentou entrar na sua conta",
    body:
      "Detectamos uma tentativa de acesso a partir de um dispositivo desconhecido em Juiz de Fora. Se não foi você, troque sua senha.",
  },
  {
    id: "MAIL_06",
    account: "principal",
    at: "12/12/2025 10:30",
    from: "Instituto Caminho Seguro",
    subject: "Convite — Ato de 6 meses",
    clueId: "CLUE_043",
    body:
      "Convidamos familiares, amigos e a comunidade de entregadores para o ato de seis meses em memória de Wesley Andrade da Silva, vítima de atropelamento com fuga em 22 de junho.\n\nSábado, 20/12, às 14h30, em frente ao Cemitério Parque da Saudade.\n\nSeguimos cobrando a identificação do motorista.",
  },
];

/* ------------------------------------------------------------------ */
/* Navegador                                                           */
/* ------------------------------------------------------------------ */

export type HistoryEntry = { id: string; at: string; query: string; clueId?: ClueId };

export const BROWSER_HISTORY: HistoryEntry[] = [
  { id: "BR_01", at: "08/03/2026 09:33", query: "o que levar na primeira consulta com advogado criminalista", clueId: "CLUE_022" },
  { id: "BR_02", at: "08/03/2026 09:40", query: "tribunadovale.com.br › arquivo › junho-2025", clueId: "CLUE_022" },
  { id: "BR_03", at: "07/03/2026 23:50", query: "como pedir perdão pra família de alguém que morreu" },
  { id: "BR_04", at: "05/03/2026 21:12", query: "amiga me ameaçando indiretamente é crime", clueId: "CLUE_047" },
  { id: "BR_05", at: "05/03/2026 21:20", query: "coação no curso do processo art 344", clueId: "CLUE_047" },
  { id: "BR_06", at: "04/03/2026 08:40", query: "segunda via de nota fiscal de serviço funilaria" },
  { id: "BR_07", at: "03/03/2026 02:51", query: "insônia acordar sempre no mesmo horário significado" },
  { id: "BR_08", at: "01/03/2026 16:20", query: "apresentação espontânea reduz pena", clueId: "CLUE_022" },
  { id: "BR_09", at: "01/03/2026 16:24", query: "passageiro responde por omissão de socorro", clueId: "CLUE_022" },
  { id: "BR_10", at: "01/03/2026 16:31", query: "pena homicídio culposo trânsito com fuga do local", clueId: "CLUE_022" },
  { id: "BR_11", at: "26/02/2026 23:44", query: "quanto tempo prescreve homicídio culposo" },
  { id: "BR_12", at: "14/02/2026 01:10", query: "como saber se estão mexendo no meu celular", clueId: "CLUE_048" },
  { id: "BR_13", at: "09/02/2026 19:02", query: "advogado criminalista juiz de fora mulher" },
  { id: "BR_14", at: "20/12/2025 14:30", query: "fluxo.app › perfil › diego.andrade.silva", clueId: "CLUE_049" },
  { id: "BR_15", at: "03/07/2025 04:12", query: "acidente barão do cristal motociclista", clueId: "CLUE_022" },
  { id: "BR_16", at: "22/06/2025 15:08", query: "o que acontece com quem foge de atropelamento", clueId: "CLUE_050" },
  { id: "BR_17", at: "22/06/2025 15:22", query: "eu posso ser presa se eu não denunciar", clueId: "CLUE_050" },
];

/* ------------------------------------------------------------------ */
/* Mapas                                                               */
/* ------------------------------------------------------------------ */

export const LOCATION_DAY = [
  { period: "00h00–10h51", place: "Rua Coronel Vidal, 412 — São Mateus", precision: "alta" },
  { period: "11h02–13h07", place: "Rua Sete Lagoas, 88 — Bom Pastor (casa da mãe)", precision: "alta" },
  { period: "13h22–18h51", place: "Rua Coronel Vidal, 412", precision: "alta" },
  { period: "18h55–19h28", place: "em movimento — Av. Rio Branco › BR-040 › Estrada do Poço Fundo", precision: "média" },
  {
    period: "19h31–06h32 (09/03)",
    place: "Estrada do Poço Fundo, km 4 — Mirante da Pedra Lascada",
    precision: "alta, estacionário",
    flag: true,
  },
  { period: "06h40 (09/03)", place: "em movimento — sentido centro", precision: "média" },
];

export const FREQUENT_PLACES = [
  { place: "Casa", visits: 412, last: "08/03/2026" },
  { place: "UFJF — ICH", visits: 88, last: "06/03/2026" },
  { place: "Casa da mãe", visits: 61, last: "08/03/2026" },
  { place: "Mirante da Pedra Lascada", visits: 29, last: "08/03/2026" },
  { place: "Bar Nau", visits: 24, last: "21/06/2025" },
  {
    place: "Av. Barão do Cristal, 1900",
    visits: 1,
    last: "22/06/2025 02:47",
    clueId: "CLUE_054",
    flag: true,
  },
  { place: "Funilaria Zé do Bloco", visits: 1, last: "04/03/2026" },
  { place: "Cemitério Parque da Saudade", visits: 1, last: "20/12/2025" },
];

/* ------------------------------------------------------------------ */
/* Banco                                                               */
/* ------------------------------------------------------------------ */

export const BANK_STATEMENT = [
  { id: "TX_01", at: "02/03/2026 19:02", label: "Pix enviado — MARLENE A DA SILVA", amount: "− R$ 400,00", clueId: "CLUE_014" },
  { id: "TX_02", at: "04/03/2026 08:55", label: "Pix enviado — JOSE N. DE OLIVEIRA", amount: "− R$ 30,00" },
  { id: "TX_03", at: "06/03/2026 21:40", label: "Compra — Cinema Independência", amount: "− R$ 68,00" },
  { id: "TX_04", at: "08/03/2026 18:40", label: "Compra — Posto Serra Azul", amount: "− R$ 50,00" },
  { id: "TX_05", at: "03/02/2026 19:10", label: "Pix recebido — ALICE B FONTOURA", amount: "+ R$ 800,00", clueId: "CLUE_032" },
  { id: "TX_06", at: "15/01/2026 14:20", label: "Pix recebido — ALICE B FONTOURA", amount: "+ R$ 1.200,00", clueId: "CLUE_032" },
  {
    id: "TX_07",
    at: "24/06/2025 10:22",
    label: "Saque em espécie — Ag. 0117",
    amount: "− R$ 1.850,00",
    clueId: "CLUE_057",
    flag: true,
  },
];

export const BANK_RECURRING = {
  label: "MARLENE A DA SILVA",
  amount: "R$ 400,00",
  day: "dia 2 de cada mês",
  count: 9,
  since: "02/07/2025",
  total: "R$ 3.600,00",
  description: 'Descrição salva pela titular: "auxílio"',
};

export const PIX_RECEIPTS = [
  "02/07/2025",
  "02/08/2025",
  "02/09/2025",
  "02/10/2025",
  "02/11/2025",
  "02/12/2025",
  "02/01/2026",
  "02/02/2026",
  "02/03/2026",
].map((date, index) => ({
  id: `PIX_${index + 1}`,
  date,
  amount: "R$ 400,00",
  from: "CLARA MENDONCA VASQUES · CPF ***.882.706-**",
  to: "MARLENE A DA SILVA · CPF ***.410.336-** · Banco 104",
  description: "auxílio",
}));

/* ------------------------------------------------------------------ */
/* Rede social                                                         */
/* ------------------------------------------------------------------ */

export const DM_DIEGO = [
  {
    at: "03/02/2026 21:14",
    text: "Boa noite. Desculpa incomodar. Você é a Clara? Você tava no ato do meu irmão em dezembro?",
  },
  {
    at: "09/02/2026 19:50",
    text: "Oi de novo. Eu vi você numa foto do story da Cida, você tava dentro de um carro na frente do cemitério. Eu não tô te acusando de nada, eu só quero entender porque eu não te conheço e você não conhece a gente.",
  },
  {
    at: "17/02/2026 23:02",
    text: "Meu irmão chamava Wesley. Ele tinha 27. Ele pagava metade do aluguel da minha mãe.\nA polícia falou que era carro prata. Só isso. Sete meses e é só isso que eu tenho.\nSe você sabe alguma coisa, qualquer coisa, você pode me falar e eu juro por Deus que eu não conto pra ninguém de onde veio.",
  },
  { at: "24/02/2026 20:33", text: "Você viu e não respondeu. Tá bom." },
  {
    at: "01/03/2026 22:47",
    text: "Todo mês entra um dinheiro na conta da minha mãe. Quatrocentos reais. Todo dia dois.\nEla acha que é do governo. Eu fui atrás e não é do governo.\nQuem é que paga quatrocentos reais por mês pra mãe de um homem que morreu na rua?",
  },
  { at: "06/03/2026 15:33", text: "eu sei que tem gente que sabe. tô perguntando com educação ainda." },
];

export const SOCIAL_PROFILE = {
  handle: "clara.vsq",
  lastPost: "20/06/2025",
  silence: "9 meses sem publicar",
  saved: [
    {
      id: "SV_01",
      label: "print_live_diego_080326.png",
      note: "Transmissão ao vivo · 19h20–20h05 · Barbacena/MG · 214 espectadores",
      clueId: "CLUE_036",
    },
  ],
  archivedStories: [
    { id: "ST_01", at: "20/12/2025", note: "Ato de 6 meses — Clara aparece ao fundo, de costas", clueId: "CLUE_043" },
  ],
};

/* ------------------------------------------------------------------ */
/* Tarefas                                                             */
/* ------------------------------------------------------------------ */

export const TASKS = [
  {
    id: "TK_01",
    done: false,
    text: "SEG 9h — Dra. Yara — LEVAR O ÁUDIO E A NOTA",
    due: "09/03 09h00",
    created: "02/03 11h50",
    clueId: "CLUE_016",
  },
  { id: "TK_02", done: false, text: "falar com a minha mãe antes", due: "08/03", created: "06/03" },
  { id: "TK_03", done: true, text: "tirar segunda via da nota", due: "04/03", created: "03/03" },
  { id: "TK_04", done: true, text: "9º pix", due: "02/03", created: "02/03" },
  { id: "TK_05", done: false, text: "pedir desculpa pro Théo por tudo", created: "07/03 23h55" },
  {
    id: "TK_06",
    done: false,
    struck: true,
    text: "apagar o áudio",
    created: "05/03 22h10",
    note: "Riscada, nunca concluída.",
    clueId: "CLUE_058",
  },
];

/* ------------------------------------------------------------------ */
/* Nuvem                                                               */
/* ------------------------------------------------------------------ */

export type DriveNode = {
  id: string;
  name: string;
  kind: "pasta" | "arquivo";
  parent?: string;
  lock?: string;
  meta?: string;
  clueId?: ClueId;
  act: 2 | 3;
};

export const DRIVE: DriveNode[] = [
  { id: "DR_FAC", name: "FACULDADE", kind: "pasta", act: 2 },
  { id: "DR_FRE", name: "FREELA", kind: "pasta", act: 2 },
  { id: "DR_ELE", name: "ELE", kind: "pasta", act: 2, meta: "criada 06/03 16h10" },
  { id: "DR_ELE_1", name: "print_dm_01.png … print_dm_06.png", kind: "arquivo", parent: "DR_ELE", act: 2 },
  { id: "DR_ELE_2", name: "print_live_diego_080326.png", kind: "arquivo", parent: "DR_ELE", act: 2, clueId: "CLUE_036" },
  { id: "DR_CASO", name: "CASO (adicionada pela perícia)", kind: "pasta", act: 2 },
  {
    id: "DR_CASO_1",
    name: "despacho_arquivamento_IP0447.pdf",
    kind: "arquivo",
    parent: "DR_CASO",
    act: 2,
    clueId: "CLUE_067",
  },
  { id: "DR_CASO_2", name: "termo_autorizacao_familia.pdf", kind: "arquivo", parent: "DR_CASO", act: 2 },
  { id: "DR_P22", name: "PESSOAL/22", kind: "pasta", lock: "LOCK_003", act: 2 },
  { id: "DR_P22_1", name: "declaracao_final.pdf", kind: "arquivo", parent: "DR_P22", act: 3, clueId: "CLUE_041" },
  { id: "DR_P22_2", name: "recibos_pix/ (9 comprovantes)", kind: "arquivo", parent: "DR_P22", act: 3 },
  { id: "DR_P22_3", name: "nota_2214_zedobloco.jpg", kind: "arquivo", parent: "DR_P22", act: 3, clueId: "CLUE_017" },
  {
    id: "DR_P22_4",
    name: "chat_backup_2026-03-08_1930.zip",
    kind: "arquivo",
    parent: "DR_P22",
    lock: "LOCK_008",
    act: 3,
    clueId: "CLUE_034",
  },
];

export const DOC_DESPACHO = `POLÍCIA CIVIL DE MINAS GERAIS — DELEGACIA DE HOMICÍDIOS — JUIZ DE FORA
INQUÉRITO POLICIAL Nº 0447/2026
DESPACHO DE RELATÓRIO FINAL — 16/04/2026

Trata-se de apuração do óbito de CLARA MENDONÇA VASQUES, 24 anos, cujo corpo foi localizado em 09/03/2026, às 06h20, na base do paredão do denominado Mirante da Pedra Lascada, Estrada do Poço Fundo, km 4.

Do apurado:

a) Laudo cadavérico: politraumatismo compatível com queda de aproximadamente 21 metros. Ausência de lesões de defesa. Ausência de sinais de arrastamento.

b) Local: parapeito de alvenaria com 1,10 m. Não foram identificados vestígios de terceiros. Registre-se que o local foi liberado às 11h40 do mesmo dia, em razão de chuva prevista.

c) Aparelho celular: localizado no porta-luvas do veículo da vítima, bloqueado. Última comunicação da vítima registrada às 21h13 de 08/03/2026, mensagem enviada ao namorado.

d) Namorado: THÉO BARCELLOS RAMALHO, ouvido em três oportunidades. Apresentou versão de que permaneceu em sua residência. Não apresentou comprovação. Não foram, contudo, localizados elementos que o vinculem ao local.

e) Genitora: relatou que a vítima apresentava alterações de humor, perda de peso e acompanhamento psiquiátrico irregular.

f) Amiga: ALICE BITTENCOURT FONTOURA, ouvida uma vez, informou ter recebido mensagem da vítima às 20h41, na qual esta afirmava ter chegado em casa e estar bem. Colaborativa.

Diante da ausência de indícios de intervenção de terceiros, do quadro emocional descrito e da inexistência de elementos que apontem autoria diversa, manifesto-me pelo arquivamento, sem prejuízo de reabertura na hipótese de surgimento de prova nova.

Ubiratan Peçanha — Delegado de Polícia`;

export const DESPACHO_FLAWS = [
  {
    id: "FLAW_01",
    quote: "“Última comunicação da vítima registrada às 21h13”",
    counter: "A última batida cardíaca é de 19h58. A mensagem é 75 minutos posterior.",
    needs: ["CLUE_004", "CLUE_007C"],
  },
  {
    id: "FLAW_02",
    quote: "“Não foram identificados vestígios de terceiros”",
    counter: "O próprio despacho informa que o local foi liberado em cinco horas, sob chuva prevista.",
    needs: [],
  },
  {
    id: "FLAW_03",
    quote: "“Ausência de lesões de defesa”",
    counter: "Compatível com um empurrão de alguém em quem ela não via ameaça. Não indica queda voluntária.",
    needs: [],
  },
  {
    id: "FLAW_04",
    quote: "“Não apresentou comprovação”",
    counter: "Ele tinha comprovação e não podia mostrar sem admitir outra irregularidade.",
    needs: ["CLUE_019"],
  },
];

export const DOC_TERMO = `TERMO DE AUTORIZAÇÃO PARA EXAME DE DISPOSITIVO

Eu, REGINA APARECIDA MENDONÇA, CPF 512.774.906-30, na qualidade de genitora e sucessora de CLARA MENDONÇA VASQUES, CPF 145.882.706-98, falecida em 08/03/2026, autorizo o exame integral do aparelho celular de titularidade da falecida, restituído à família em 24/04/2026 após o arquivamento do IP 0447/2026.

Declaro ter fornecido o código de desbloqueio de tela (0712) e desconhecer os demais códigos.

Autorizo o contato com terceiros por meio da linha (32) 99114-2087, mantida ativa por decisão familiar, ficando o profissional obrigado a se identificar como perito na primeira mensagem de cada conversa.

Juiz de Fora, 04/05/2026.`;

/* ------------------------------------------------------------------ */
/* Lixeira                                                             */
/* ------------------------------------------------------------------ */

export const TRASH = [
  {
    id: "DEL_001",
    label: "rascunho — sem assunto",
    deletedAt: "07/03/2026 11:48",
    kind: "e-mail",
    clueId: "CLUE_035",
    body: `Para: diego.andrade.silva
Assunto: (sem assunto)
Rascunho salvo em 07/03/2026 11h20. Excluído em 07/03/2026 11h48.

Diego,

Seu irmão nasceu em 17 de abril de 1998. Eu decorei essa data inteira, seis números, porque eu devia ter respeitado antes.
Meu nome é Clara. Eu estava no carro.
Eu não dirigia. Isso não me faz melhor, eu sei, mas eu preciso que fique escrito porque é verdade e porque eu vou dizer isso pra uma advogada segunda-feira de manhã e eu quero que você saiba antes da polícia.
O dinheiro é meu. Desculpa pela mentira da ONG. Eu não sabia como fazer.
O carro é um Honda Fit prata. Eu não vou escrever a placa aqui porque a doutora falou pra eu não escrever nada. Segunda eu falo tudo, com nome.
Não era pra ser assim. Eu sei que isso é a coisa mais idiota que uma pessoa pode escrever pra você.

(não enviado)`,
  },
  {
    id: "DEL_002",
    label: "IMG_20260305_1940.jpg",
    deletedAt: "05/03/2026 19:58",
    kind: "foto",
    body: "Selfie apagada 18 minutos depois de ser tirada.",
  },
  {
    id: "DEL_003",
    label: "IMG_20250622_0912.jpg",
    deletedAt: "22/06/2025 09:20",
    kind: "foto",
    body: "Apagada na manhã seguinte e recuperada pela própria titular em novembro de 2025.",
  },
  { id: "DEL_004", label: "contato sem nome", deletedAt: "09/02/2026", kind: "contato", body: "Entrada corrompida. Não recuperável." },
  {
    id: "DEL_005",
    label: 'nota — "hoje eu conto"',
    deletedAt: "05/03/2026 16:40",
    kind: "nota",
    clueId: "CLUE_055",
    body: "hoje eu conto pra Lice.\nse der ruim, tá tudo escrito na outra nota.",
  },
];

/* ------------------------------------------------------------------ */
/* Nota trancada                                                       */
/* ------------------------------------------------------------------ */

export const NOTE_LOCKED = {
  id: "NOTE_004",
  title: "22/06",
  editedAt: "última edição 07/03/2026 23h58 · 14 edições",
  clueId: "CLUE_011",
  body: `22/06/2025 — 05h11
não durmo. escrevendo pra não esquecer nenhum detalhe porque amanhã eu vou querer acreditar que foi diferente.

saímos do Nau 02h31. eu no carona. ela dirigindo. o carro é do T. ele ficou no bar com o pessoal, ia de aplicativo.
eu apaguei em algum momento da Rio Branco.
02h47 barão do cristal.
eu acordei com o barulho.
ela freou. ela parou. ela olhou pra trás. eu falei desce, ela falou "e faz o quê".
ela acelerou.

eu não desci.

22/06/2025 — 09h30
tirei foto do farol. tem um plástico vermelho preso. não é poste. poste não tem plástico vermelho.
ela ligou 03h58 e falou vinte e dois minutos e no fim eu já tava concordando com tudo.
ela vai falar pro T que raspou num poste na mariano.

24/06/2025
saquei 1850. ela não quis que saísse da conta dela.
"vc não tem nada a ver com isso, então ninguém vai olhar pra sua conta." obrigada, Lice.

03/07/2025
descobri o nome dele. tá no jornal.
descobri outra coisa. eu não vou escrever aqui.

11/09/2025
aniversário dela. eu fui. eu cantei parabéns. eu ri.
eu sou uma pessoa muito pior do que eu achava.

05/01/2026
contei pra minha mãe. metade. não falei o nome dela, falei "uma amiga".
minha mãe falou esquece isso minha filha.
minha mãe falou não estraga a sua vida por uma coisa que não volta.
eu fiquei uma semana feliz com isso. uma semana inteira. dá pra acreditar?

09/02/2026
achei uma advogada. mulher. parece boa.

05/03/2026 — 19h52
contei pra Lice.
ela chorou. depois ela parou de chorar e falou coisas com muita calma durante onze minutos, e eu anotei três delas:
1. "quem vai acreditar que você tava dormindo?"
2. "sua mãe tem 51 anos e trabalha de plantão, Cacau."
3. "eu te dou uma semana."

eu pesquisei se isso é crime. é. artigo 344.
eu não vou fazer nada com isso. eu só queria escrever que eu sei o que é.

07/03/2026 — 23h58
se alguém tiver lendo isso e não for eu:
o nome dela é`,
};

export const NOTE_LOCKED_ENDNOTE =
  "A nota termina aqui, no meio da frase. Não há caractere seguinte, nem rascunho, nem versão anterior recuperável.";
