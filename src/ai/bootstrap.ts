/**
 * Sequência de inicialização do aparelho.
 *
 * O celular não liga enquanto conversa e tradução não estiverem verificadas e
 * funcionando. Nada é baixado sem autorização explícita, e cada etapa reporta
 * o próprio estado para a interface — com porcentagem real quando o navegador
 * fornece uma, e indeterminado quando não fornece. Nunca com número inventado.
 */

import { hasLanguageModel, hasTranslator, inspectBrowser, isSecure } from "./availability";
import { AiError, toAiError, type AiErrorCode } from "./errors";
import { createSession, modelAvailability, type ModelSession } from "./languageModel";
import { createTranslator, translatorAvailability, type TranslatorPair } from "./translator";

export type BootStepId =
  | "contexto"
  | "navegador"
  | "conversa"
  | "traducao"
  | "modelo"
  | "pt-en"
  | "en-pt"
  | "autorizacao"
  | "download"
  | "instalacao"
  | "verificacao"
  | "progresso"
  | "pronto";

export type BootStepState = "espera" | "correndo" | "ok" | "pausado" | "erro";

export type BootStep = {
  id: BootStepId;
  label: string;
  state: BootStepState;
  /** 0 a 1 quando há progresso real; undefined = indeterminado. */
  progress?: number;
  detail?: string;
};

export const BOOT_STEPS: Array<{ id: BootStepId; label: string }> = [
  { id: "contexto", label: "Verificando conexão segura..." },
  { id: "navegador", label: "Verificando compatibilidade do navegador..." },
  { id: "conversa", label: "Verificando o modelo de conversa..." },
  { id: "traducao", label: "Verificando os pacotes de tradução..." },
  { id: "modelo", label: "Consultando disponibilidade do modelo..." },
  { id: "pt-en", label: "Verificando tradução para inglês..." },
  { id: "en-pt", label: "Verificando tradução para português..." },
  { id: "autorizacao", label: "Aguardando sua autorização..." },
  { id: "download", label: "Preparando componentes locais..." },
  { id: "instalacao", label: "Instalando componentes..." },
  { id: "verificacao", label: "Verificando comunicação..." },
  { id: "progresso", label: "Restaurando dados da investigação..." },
  { id: "pronto", label: "Celular pronto." },
];

/**
 * O que sobrevive ao boot: apenas os tradutores, que são compartilhados por
 * todas as conversas. As sessões de personagem nascem depois, uma por
 * conversa, cada uma com o próprio prompt de sistema e o próprio histórico.
 */
export type BootRuntime = {
  ptToEn: TranslatorPair;
  enToPt: TranslatorPair;
  destroy(): void;
};

export type BootOutcome =
  | { kind: "pronto"; runtime: BootRuntime }
  | { kind: "precisa-autorizacao"; sizes: string }
  | { kind: "erro"; error: AiError };

export type BootReporter = {
  step(id: BootStepId, state: BootStepState, patch?: { progress?: number; detail?: string }): void;
};

/** Prompt neutro só para a checagem de comunicação; não é personagem nenhum. */
const PROBE_PROMPT =
  "You are a diagnostic endpoint. Answer every message with exactly one word: ready.";

type ProgressParts = Record<"modelo" | "pt-en" | "en-pt", number | undefined>;

function makeProgressAggregator(report: BootReporter) {
  const parts: ProgressParts = { modelo: undefined, "pt-en": undefined, "en-pt": undefined };

  return (part: keyof ProgressParts, value: number | undefined) => {
    parts[part] = value;
    const known = Object.values(parts).filter((item): item is number => typeof item === "number");

    if (known.length === 0) {
      // O navegador não deu porcentagem. Indeterminado, sem inventar número.
      report.step("download", "correndo", { progress: undefined, detail: "Baixando/validando componentes pelo Chrome..." });
      return;
    }

    const total = known.reduce((sum, item) => sum + item, 0) / 3;
    const labels: Record<keyof ProgressParts, string> = {
      modelo: "modelo de conversa",
      "pt-en": "pacote português → inglês",
      "en-pt": "pacote inglês → português",
    };
    report.step("download", "correndo", {
      progress: Math.min(0.999, total),
      detail: `Baixando ${labels[part]}`,
    });
  };
}

/**
 * Fase 1 — verificação. Não baixa nada.
 * Pode ser executada sem gesto do usuário.
 */
export async function inspect(report: BootReporter): Promise<
  | { kind: "tudo-pronto" }
  | { kind: "precisa-baixar"; pendentes: string[] }
  | { kind: "erro"; error: AiError }
> {
  report.step("contexto", "correndo");
  if (!isSecure()) {
    report.step("contexto", "erro");
    return { kind: "erro", error: new AiError("INSECURE_CONTEXT") };
  }
  report.step("contexto", "ok");

  report.step("navegador", "correndo");
  const browser = inspectBrowser();
  if (browser.isMobile) {
    report.step("navegador", "erro");
    return { kind: "erro", error: new AiError("DEVICE_UNSUPPORTED") };
  }
  if (!browser.isChrome && !browser.isEdge) {
    report.step("navegador", "erro");
    return { kind: "erro", error: new AiError("BROWSER_UNSUPPORTED") };
  }
  if (browser.tooOld) {
    report.step("navegador", "erro");
    return { kind: "erro", error: new AiError("CHROME_TOO_OLD") };
  }
  report.step("navegador", "ok", { detail: browser.version ? `Chrome ${browser.version}` : undefined });

  report.step("conversa", "correndo");
  if (!hasLanguageModel()) {
    report.step("conversa", "erro");
    return { kind: "erro", error: new AiError("PROMPT_API_ABSENT") };
  }
  report.step("conversa", "ok");

  report.step("traducao", "correndo");
  if (!hasTranslator()) {
    report.step("traducao", "erro");
    return { kind: "erro", error: new AiError("TRANSLATOR_API_ABSENT") };
  }
  report.step("traducao", "ok");

  report.step("modelo", "correndo");
  const model = await modelAvailability();
  if (model === "timeout") {
    report.step("modelo", "erro");
    return { kind: "erro", error: new AiError("CHECK_TIMEOUT", "LanguageModel.availability") };
  }
  if (model === "unavailable") {
    report.step("modelo", "erro");
    return { kind: "erro", error: new AiError("DEVICE_UNSUPPORTED") };
  }
  report.step("modelo", "ok", { detail: model === "available" ? "instalado" : "precisa baixar" });

  report.step("pt-en", "correndo");
  const ptEn = await translatorAvailability("pt-en");
  if (ptEn === "timeout") {
    report.step("pt-en", "erro");
    return { kind: "erro", error: new AiError("CHECK_TIMEOUT", "Translator.availability pt->en") };
  }
  if (ptEn === "unavailable") {
    report.step("pt-en", "erro");
    return { kind: "erro", error: new AiError("TRANSLATE_PT_EN_FAILED") };
  }
  report.step("pt-en", "ok", { detail: ptEn === "available" ? "instalado" : "precisa baixar" });

  report.step("en-pt", "correndo");
  const enPt = await translatorAvailability("en-pt");
  if (enPt === "timeout") {
    report.step("en-pt", "erro");
    return { kind: "erro", error: new AiError("CHECK_TIMEOUT", "Translator.availability en->pt") };
  }
  if (enPt === "unavailable") {
    report.step("en-pt", "erro");
    return { kind: "erro", error: new AiError("TRANSLATE_EN_PT_FAILED") };
  }
  report.step("en-pt", "ok", { detail: enPt === "available" ? "instalado" : "precisa baixar" });

  const pendentes: string[] = [];
  if (model !== "available") pendentes.push("modelo de conversa");
  if (ptEn !== "available") pendentes.push("tradução português → inglês");
  if (enPt !== "available") pendentes.push("tradução inglês → português");

  if (pendentes.length === 0) {
    report.step("autorizacao", "ok", { detail: "componentes já instalados" });
    return { kind: "tudo-pronto" };
  }

  report.step("autorizacao", "pausado", {
    detail: `Falta instalar: ${pendentes.join(", ")}.`,
  });
  return { kind: "precisa-baixar", pendentes };
}

/**
 * Fase 2 — preparação. Precisa ser chamada a partir de um clique, porque
 * `create()` exige ativação do usuário quando há download envolvido.
 */
export async function prepare(report: BootReporter): Promise<BootOutcome> {
  report.step("autorizacao", "ok");
  report.step("download", "correndo", {
    progress: undefined,
    detail: "Abrindo componentes já instalados ou iniciando instalação...",
  });

  const track = makeProgressAggregator(report);

  let session: ModelSession | undefined;
  let ptToEn: TranslatorPair | undefined;
  let enToPt: TranslatorPair | undefined;

  const cleanup = () => {
    session?.destroy();
    ptToEn?.destroy();
    enToPt?.destroy();
  };

  try {
    session = await createSession(PROBE_PROMPT, (value) => track("modelo", value));
    ptToEn = await createTranslator("pt-en", (value) => track("pt-en", value));
    enToPt = await createTranslator("en-pt", (value) => track("en-pt", value));
  } catch (error) {
    cleanup();
    const mapped = toAiError(error, "DOWNLOAD_INTERRUPTED");
    report.step("download", "erro");
    return { kind: "erro", error: mapped };
  }

  // loaded === 1 não significa pronto: ainda há extração e carga em memória.
  report.step("download", "ok", { progress: 1 });
  report.step("instalacao", "correndo", { progress: undefined });
  report.step("instalacao", "ok");

  report.step("verificacao", "correndo");
  try {
    const english = await ptToEn.translate("Responda somente com a palavra pronto.");
    if (!english.trim()) throw new AiError("TRANSLATE_PT_EN_FAILED");

    const answer = await session.prompt(`${english}\nReply with exactly one word.`);
    if (!answer.trim()) throw new AiError("SESSION_FAILED");

    const portuguese = await enToPt.translate(answer);
    if (!portuguese.trim()) throw new AiError("TRANSLATE_EN_PT_FAILED");
  } catch (error) {
    cleanup();
    const mapped = toAiError(error, "SESSION_FAILED");
    report.step("verificacao", "erro");
    return { kind: "erro", error: mapped };
  }
  report.step("verificacao", "ok");

  // A sessão de diagnóstico não é reaproveitada como personagem: cada
  // conversa nasce com o próprio prompt de sistema e o próprio histórico.
  session.destroy();

  const readyPtToEn = ptToEn;
  const readyEnToPt = enToPt;

  const runtime: BootRuntime = {
    ptToEn: readyPtToEn,
    enToPt: readyEnToPt,
    destroy() {
      readyPtToEn.destroy();
      readyEnToPt.destroy();
    },
  };

  return { kind: "pronto", runtime };
}

export function initialSteps(): BootStep[] {
  return BOOT_STEPS.map((step) => ({ ...step, state: "espera" }));
}

export function describeSizes(pendentes: string[]) {
  const parts: string[] = [];
  if (pendentes.some((item) => item.includes("modelo"))) {
    parts.push("o modelo de conversa, que é o componente maior e pode ocupar vários gigabytes");
  }
  if (pendentes.some((item) => item.includes("tradução"))) {
    parts.push("os pacotes de tradução entre português e inglês, bem menores");
  }
  return parts.join(" e ");
}

export type { AiErrorCode };
