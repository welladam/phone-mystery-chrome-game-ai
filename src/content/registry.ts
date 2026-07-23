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
import type { LocaleId } from "../locales/types";

export type Act1Pack = typeof import("../locales/pt-BR/act1");
export type Act2Pack = typeof import("../locales/pt-BR/act2");
export type Act3Pack = typeof import("../locales/pt-BR/act3");
export type Act4Pack = typeof import("../locales/pt-BR/act4");

type LocaleLoaders = {
  act1: () => Promise<Act1Pack>;
  act2: () => Promise<Act2Pack>;
  act3: () => Promise<Act3Pack>;
  act4: () => Promise<Act4Pack>;
};

const LOADERS: Record<LocaleId, LocaleLoaders | undefined> = {
  "pt-BR": {
    act1: () => import("../locales/pt-BR/act1"),
    act2: () => import("../locales/pt-BR/act2"),
    act3: () => import("../locales/pt-BR/act3"),
    act4: () => import("../locales/pt-BR/act4"),
  },
  "en-US": undefined,
};

const cache = new Map<string, Promise<unknown>>();

function loaderFor(locale: LocaleId) {
  const loaders = LOADERS[locale];
  if (!loaders) throw new Error(`Locale não jogável: ${locale}`);
  return loaders;
}

function cached<T>(locale: LocaleId, act: string, load: () => Promise<T>) {
  const key = `${locale}:${act}`;
  const existing = cache.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const pending = load();
  cache.set(key, pending);
  return pending;
}

export const loadAct1 = (locale: LocaleId) => cached(locale, "act1", loaderFor(locale).act1);
export const loadAct2 = (locale: LocaleId) => cached(locale, "act2", loaderFor(locale).act2);
export const loadAct3 = (locale: LocaleId) => cached(locale, "act3", loaderFor(locale).act3);
export const loadAct4 = (locale: LocaleId) => cached(locale, "act4", loaderFor(locale).act4);

/**
 * Os aplicativos e seus registros ficam disponíveis desde o início. O pacote
 * do desfecho continua isolado até o motor confirmar o Ato 4.
 */
export function preloadForAct(locale: LocaleId, act: ActNumber) {
  const jobs: Array<Promise<unknown>> = [loadAct1(locale), loadAct2(locale), loadAct3(locale)];
  if (act >= 4) jobs.push(loadAct4(locale));
  return Promise.all(jobs);
}
