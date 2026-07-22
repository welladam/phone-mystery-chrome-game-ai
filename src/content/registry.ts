/**
 * Carregamento incremental dos pacotes narrativos.
 *
 * Cada ato vira um chunk separado no build. O material do desfecho não entra
 * no bundle inicial: ele só é baixado quando o motor confirma que o jogador
 * chegou naquele ponto. Isso não torna o cliente inviolável — apenas evita que
 * a solução esteja disponível para quem abrir as ferramentas do navegador
 * antes de jogar.
 */

import type { ActNumber } from "../engine/types";

export type Act1Pack = typeof import("./act1");
export type Act2Pack = typeof import("./act2");
export type Act3Pack = typeof import("./act3");
export type Act4Pack = typeof import("./act4");

let act1: Promise<Act1Pack> | undefined;
let act2: Promise<Act2Pack> | undefined;
let act3: Promise<Act3Pack> | undefined;
let act4: Promise<Act4Pack> | undefined;

export function loadAct1() {
  act1 ??= import("./act1");
  return act1;
}

export function loadAct2() {
  act2 ??= import("./act2");
  return act2;
}

export function loadAct3() {
  act3 ??= import("./act3");
  return act3;
}

export function loadAct4() {
  act4 ??= import("./act4");
  return act4;
}

/** Pré-carrega o que o ato atual precisa, sem trazer o que ainda não é hora. */
export function preloadForAct(act: ActNumber) {
  const jobs: Array<Promise<unknown>> = [loadAct1()];
  if (act >= 2) jobs.push(loadAct2());
  if (act >= 3) jobs.push(loadAct3());
  if (act >= 4) jobs.push(loadAct4());
  return Promise.all(jobs);
}
