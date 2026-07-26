/**
 * Confidential file delivered to the investigator before examining the device.
 *
 * Everything here is safe for Act 1: it is what the family and lawyer knew
 * before any discovery. Nothing in this file foreshadows the solution. The work
 * notebook lives outside the device and is filled manually by the player; this
 * file remains only as the original case briefing.
 */

import type { ActNumber } from "../engine/types";

export const DOSSIER_HEADER = {
  office: "Trindade Advocacia Criminal",
  reference: "Pasta reservada · IP 0447/2026",
  stamp: "CONFIDENCIAL",
  handedAt: "Entregue em 6 de maio de 2026",
  recipient: "Ao perito designado",
};

export const DOSSIER_LETTER = `Bom dia.

Vou ser direta, porque é assim que eu trabalho e porque a mãe dela já ouviu rodeio suficiente nos últimos dois meses.

O inquérito foi arquivado. Não porque alguém provou alguma coisa, mas porque ninguém procurou. Cinco semanas, três depoimentos, um laudo e um despacho de duas páginas.

A senhora Regina não aceitou e pagou do próprio bolso pelo seu trabalho. O aparelho da filha dela está com você, com autorização assinada. É a única coisa que sobrou que ninguém examinou de verdade.

Leia esta pasta antes de ligar o telefone. Depois disso, você não precisa mais de mim para nada além de protocolar o que encontrar.

Yara Trindade — OAB/MG 118.442`;

export const DOSSIER_SECTIONS = [
  {
    id: "vitima",
    title: "A vítima",
    rows: [
      ["Nome", "Clara Mendonça Vasques"],
      ["Idade", "24 anos · nascida em 07/12/2001"],
      ["Ocupação", "8º período de Jornalismo (UFJF) e editora de vídeo freelancer"],
      ["Endereço", "Rua Coronel Vidal, 412, apto 302 — São Mateus, Juiz de Fora/MG"],
      ["Veículo", "Fiat Mobi branco 2019"],
      ["Linha telefônica", "(32) 99114-2087 — mantida ativa pela família"],
    ],
  },
  {
    id: "ocorrencia",
    title: "A ocorrência",
    rows: [
      ["Data do óbito", "domingo, 8 de março de 2026"],
      ["Corpo localizado", "segunda, 9 de março de 2026, às 06h20"],
      ["Local", "base do paredão do Mirante da Pedra Lascada, Estrada do Poço Fundo, km 4"],
      ["Causa", "politraumatismo por queda de aproximadamente 21 metros"],
      ["Conclusão oficial", "morte a esclarecer, com indicativo de suicídio"],
      ["Arquivamento", "16/04/2026 — Delegado Ubiratan Peçanha"],
    ],
  },
  {
    id: "pessoas",
    title: "Pessoas com quem você pode falar",
    rows: [
      ["Regina Aparecida Mendonça, 51", "mãe. Auxiliar de enfermagem, plantão noturno. Foi quem contratou você."],
      ["Théo Barcellos Ramalho, 27", "namorado há dois anos e quatro meses. Motorista de aplicativo. Ouvido três vezes."],
      ["Alice Bittencourt Fontoura, 24", "melhor amiga desde os treze anos. Advogada. Ouvida uma vez."],
    ],
  },
];

export const DOSSIER_ACCESS = {
  title: "Acesso ao aparelho",
  pin: "0712",
  note:
    "A senhora Regina forneceu o código da tela: é a data de nascimento da filha, anotada num papel dentro da capinha. Ela declarou desconhecer todos os demais códigos do aparelho — e são vários. O que estiver protegido, você terá de abrir com o que encontrar lá dentro.",
};

export const DOSSIER_METHOD = [
  "O caderno fica aberto ao lado do aparelho. Use Minhas notas para registrar livremente nomes, senhas, suspeitas e contradições.",
  "No modo Normal, as abas Deduções, Pessoas e Dicas ajudam a organizar o que já foi encontrado. No modo Difícil, elas permanecem bloqueadas.",
  "A aba Acusação só abre no ato final. Você precisará escrever por conta própria quem foi responsável pela morte de Clara.",
  "Você escreve às três pessoas pelo número da própria Clara. Elas foram avisadas, mas ver esse nome aparecer mexe com qualquer um.",
  "Você pode anexar uma prova a uma mensagem. É diferente de só perguntar.",
  "Nada do que você escrever sai deste computador.",
];

export const DOSSIER_WARNING =
  "Uma observação que eu faço a todo mundo: não trate nenhuma das três pessoas como suspeita antes de ter documento na mão. Duas delas estão de luto. Uma delas talvez esteja mentindo. Você ainda não sabe qual, e chutar cedo custa caro.";

/** Current objective—provides direction without giving anything away. */
export const ACT_BRIEF: Record<ActNumber, { title: string; goal: string }> = {
  1: {
    title: "Ato 1 — Morte a esclarecer",
    goal: "Estabelecer se o que o inquérito concluiu se sustenta diante dos dados do aparelho.",
  },
  2: {
    title: "Ato 2 — O que ela estava pagando",
    goal: "Descobrir o que Clara escondia de todo mundo nos últimos oito meses.",
  },
  3: {
    title: "Ato 3 — Alguém está te escrevendo",
    goal: "Identificar quem estava no carro na madrugada de 22 de junho de 2025.",
  },
  4: {
    title: "Ato 4 — Você deixou eu dirigir",
    goal: "Reconstruir a noite de 8 de março e apontar quem foi responsável pela morte de Clara.",
  },
};
