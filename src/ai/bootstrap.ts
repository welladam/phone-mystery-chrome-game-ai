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
import type { LocaleBundle } from "../locales/types";
import type { DownloadProgressSample } from "./availability";

export type BootStepId =
  | "contexto"
  | "navegador"
  | "conversa"
  | "traducao"
  | "modelo"
  | "to-model"
  | "from-model"
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
  download?: DownloadMetrics;
};

export type DownloadMetrics = {
  /** Componente cujo evento mais recente atualizou a tela. */
  component: string;
  /** Disponíveis apenas se o navegador realmente expuser bytes. */
  loadedBytes?: number;
  totalBytes?: number;
  bytesPerSecond?: number;
  /** Velocidade agregada real, em fração do download por segundo. */
  progressPerSecond?: number;
  etaSeconds?: number;
};

export type BootStepPatch = Pick<BootStep, "progress" | "detail" | "download">;

function message(locale: LocaleBundle, key: string, values?: Record<string, string>) {
  let text = locale.messages[key] ?? key;
  Object.entries(values ?? {}).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, value);
  });
  return text;
}

export function bootSteps(locale: LocaleBundle): Array<{ id: BootStepId; label: string }> {
  return [
  { id: "contexto", label: message(locale, "boot.step.secure") },
  { id: "navegador", label: message(locale, "boot.step.browser") },
  { id: "conversa", label: message(locale, "boot.step.chat") },
  { id: "traducao", label: message(locale, "boot.step.translation") },
  { id: "modelo", label: message(locale, "boot.step.model") },
  { id: "to-model", label: message(locale, "boot.step.toModel", { language: locale.meta.nativeName }) },
  { id: "from-model", label: message(locale, "boot.step.fromModel", { language: locale.meta.nativeName }) },
  { id: "autorizacao", label: message(locale, "boot.step.authorization") },
  { id: "download", label: message(locale, "boot.step.download") },
  { id: "instalacao", label: message(locale, "boot.step.installation") },
  { id: "verificacao", label: message(locale, "boot.step.verification") },
  { id: "progresso", label: message(locale, "boot.step.progress") },
  { id: "pronto", label: message(locale, "boot.step.ready") },
  ];
}

/**
 * O que sobrevive ao boot: apenas os tradutores, que são compartilhados por
 * todas as conversas. As sessões de personagem nascem depois, uma por
 * conversa, cada uma com o próprio prompt de sistema e o próprio histórico.
 */
export type BootRuntime = {
  toModel: TranslatorPair;
  fromModel: TranslatorPair;
  destroy(): void;
};

export type BootOutcome =
  | { kind: "pronto"; runtime: BootRuntime }
  | { kind: "precisa-autorizacao"; sizes: string }
  | { kind: "erro"; error: AiError };

export type BootReporter = {
  step(id: BootStepId, state: BootStepState, patch?: BootStepPatch): void;
};

/** Prompt neutro só para a checagem de comunicação; não é personagem nenhum. */
const PROBE_PROMPT =
  "You are a diagnostic endpoint. Answer every message with exactly one word: ready.";

type ProgressPart = "modelo" | "to-model" | "from-model";
type ProgressState = DownloadProgressSample & { sampledAt?: number; bytesPerSecond?: number };
type ProgressParts = Record<ProgressPart, ProgressState>;

function makeProgressAggregator(report: BootReporter, locale: LocaleBundle) {
  const parts: ProgressParts = { modelo: {}, "to-model": {}, "from-model": {} };
  let aggregateSample = { progress: 0, sampledAt: performance.now(), rate: undefined as number | undefined };

  return (part: ProgressPart, sample: DownloadProgressSample) => {
    const now = performance.now();
    const previousPart = parts[part];
    let bytesPerSecond = previousPart.bytesPerSecond;
    if (
      typeof sample.loadedBytes === "number" &&
      typeof previousPart.loadedBytes === "number" &&
      typeof previousPart.sampledAt === "number"
    ) {
      const seconds = (now - previousPart.sampledAt) / 1000;
      const bytes = sample.loadedBytes - previousPart.loadedBytes;
      if (seconds >= 0.25 && bytes > 0) {
        const instantaneous = bytes / seconds;
        bytesPerSecond = bytesPerSecond === undefined
          ? instantaneous
          : bytesPerSecond * 0.65 + instantaneous * 0.35;
      }
    }
    parts[part] = { ...sample, sampledAt: now, bytesPerSecond };

    const known = Object.values(parts)
      .map((item) => item.progress)
      .filter((item): item is number => typeof item === "number");

    if (known.length === 0) {
      // O navegador não deu porcentagem. Indeterminado, sem inventar número.
      report.step("download", "correndo", { progress: undefined, detail: message(locale, "boot.detail.processing") });
      return;
    }

    const total = known.reduce((sum, item) => sum + item, 0) / 3;
    const elapsedSeconds = (now - aggregateSample.sampledAt) / 1000;
    let rate = aggregateSample.rate;
    if (elapsedSeconds >= 0.25 && total > aggregateSample.progress) {
      const instantaneous = (total - aggregateSample.progress) / elapsedSeconds;
      rate = rate === undefined ? instantaneous : rate * 0.65 + instantaneous * 0.35;
      aggregateSample = { progress: total, sampledAt: now, rate };
    }

    const labels: Record<ProgressPart, string> = {
      modelo: message(locale, "boot.detail.model"),
      "to-model": message(locale, "boot.detail.toModel", { language: locale.meta.nativeName }),
      "from-model": message(locale, "boot.detail.fromModel", { language: locale.meta.nativeName }),
    };
    report.step("download", "correndo", {
      progress: Math.min(0.999, total),
      detail: message(locale, "boot.detail.downloading", { component: labels[part] }),
      download: {
        component: labels[part],
        loadedBytes: sample.loadedBytes,
        totalBytes: sample.totalBytes,
        bytesPerSecond,
        progressPerSecond: rate,
        etaSeconds: rate && rate > 0 && total < 1 ? (1 - total) / rate : undefined,
      },
    });
  };
}

/**
 * Fase 1 — verificação. Não baixa nada.
 * Pode ser executada sem gesto do usuário.
 */
export async function inspect(locale: LocaleBundle, report: BootReporter): Promise<
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

  const requiresTranslation = locale.meta.translatorLanguage !== locale.meta.modelLanguage;
  report.step("traducao", "correndo");
  if (requiresTranslation && !hasTranslator()) {
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
  report.step("modelo", "ok", { detail: message(locale, model === "available" ? "boot.detail.installed" : "boot.detail.needsDownload") });

  report.step("to-model", "correndo");
  const toModel = await translatorAvailability(locale.meta.translatorLanguage, locale.meta.modelLanguage);
  if (toModel === "timeout") {
    report.step("to-model", "erro");
    return { kind: "erro", error: new AiError("CHECK_TIMEOUT", `Translator.availability ${locale.meta.translatorLanguage}->${locale.meta.modelLanguage}`) };
  }
  if (toModel === "unavailable") {
    report.step("to-model", "erro");
    return { kind: "erro", error: new AiError("TRANSLATE_TO_MODEL_FAILED") };
  }
  report.step("to-model", "ok", { detail: message(locale, toModel === "available" ? "boot.detail.installed" : "boot.detail.needsDownload") });

  report.step("from-model", "correndo");
  const fromModel = await translatorAvailability(locale.meta.modelLanguage, locale.meta.translatorLanguage);
  if (fromModel === "timeout") {
    report.step("from-model", "erro");
    return { kind: "erro", error: new AiError("CHECK_TIMEOUT", `Translator.availability ${locale.meta.modelLanguage}->${locale.meta.translatorLanguage}`) };
  }
  if (fromModel === "unavailable") {
    report.step("from-model", "erro");
    return { kind: "erro", error: new AiError("TRANSLATE_FROM_MODEL_FAILED") };
  }
  report.step("from-model", "ok", { detail: message(locale, fromModel === "available" ? "boot.detail.installed" : "boot.detail.needsDownload") });

  const pendentes: string[] = [];
  if (model !== "available") pendentes.push(message(locale, "boot.pending.model"));
  if (toModel !== "available") pendentes.push(message(locale, "boot.pending.toModel", { language: locale.meta.nativeName }));
  if (fromModel !== "available") pendentes.push(message(locale, "boot.pending.fromModel", { language: locale.meta.nativeName }));

  if (pendentes.length === 0) {
    report.step("autorizacao", "ok", { detail: message(locale, "boot.detail.componentsReady") });
    return { kind: "tudo-pronto" };
  }

  report.step("autorizacao", "pausado", {
    detail: message(locale, "boot.detail.missing", { items: pendentes.join(", ") }),
  });
  return { kind: "precisa-baixar", pendentes };
}

/**
 * Fase 2 — preparação. Precisa ser chamada a partir de um clique, porque
 * `create()` exige ativação do usuário quando há download envolvido.
 */
export async function prepare(locale: LocaleBundle, report: BootReporter): Promise<BootOutcome> {
  report.step("autorizacao", "ok");
  report.step("download", "correndo", {
    progress: undefined,
    detail: message(locale, "boot.detail.opening"),
  });

  const track = makeProgressAggregator(report, locale);

  let session: ModelSession | undefined;
  let toModel: TranslatorPair | undefined;
  let fromModel: TranslatorPair | undefined;

  const cleanup = () => {
    session?.destroy();
    toModel?.destroy();
    fromModel?.destroy();
  };

  try {
    // Todas as chamadas `create()` precisam nascer diretamente do mesmo clique.
    // Se aguardarmos uma antes de iniciar a seguinte, a ativação transitória do
    // usuário pode expirar e o Chrome pede uma segunda confirmação.
    const sessionJob = createSession(PROBE_PROMPT, (value) => track("modelo", value));
    const toModelJob = createTranslator({
      sourceLanguage: locale.meta.translatorLanguage,
      targetLanguage: locale.meta.modelLanguage,
      failCode: "TRANSLATE_TO_MODEL_FAILED",
    }, (value) => track("to-model", value));
    const fromModelJob = createTranslator({
      sourceLanguage: locale.meta.modelLanguage,
      targetLanguage: locale.meta.translatorLanguage,
      failCode: "TRANSLATE_FROM_MODEL_FAILED",
    }, (value) => track("from-model", value));

    const [sessionResult, toModelResult, fromModelResult] = await Promise.allSettled([
      sessionJob,
      toModelJob,
      fromModelJob,
    ]);

    if (sessionResult.status === "fulfilled") session = sessionResult.value;
    if (toModelResult.status === "fulfilled") toModel = toModelResult.value;
    if (fromModelResult.status === "fulfilled") fromModel = fromModelResult.value;

    if (sessionResult.status === "rejected") throw sessionResult.reason;
    if (toModelResult.status === "rejected") throw toModelResult.reason;
    if (fromModelResult.status === "rejected") throw fromModelResult.reason;

    // Os testes acima também informam ao TypeScript que os três resultados
    // abaixo estão necessariamente disponíveis.
    session = sessionResult.value;
    toModel = toModelResult.value;
    fromModel = fromModelResult.value;
  } catch (error) {
    cleanup();
    const mapped = toAiError(error, "DOWNLOAD_INTERRUPTED");
    report.step("download", "erro", {
      detail: locale.errors?.[mapped.code]?.title ?? mapped.info.title,
    });
    return { kind: "erro", error: mapped };
  }

  // loaded === 1 não significa pronto: ainda há extração e carga em memória.
  report.step("download", "ok", { progress: 1 });
  report.step("instalacao", "correndo", { progress: undefined });
  report.step("instalacao", "ok");

  report.step("verificacao", "correndo");
  try {
    const english = await toModel.translate(locale.modelProbe);
    if (!english.trim()) throw new AiError("TRANSLATE_TO_MODEL_FAILED");

    const answer = await session.prompt(`${english}\nReply with exactly one word.`);
    if (!answer.trim()) throw new AiError("SESSION_FAILED");

    const localized = await fromModel.translate(answer);
    if (!localized.trim()) throw new AiError("TRANSLATE_FROM_MODEL_FAILED");
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

  const readyToModel = toModel;
  const readyFromModel = fromModel;

  const runtime: BootRuntime = {
    toModel: readyToModel,
    fromModel: readyFromModel,
    destroy() {
      readyToModel.destroy();
      readyFromModel.destroy();
    },
  };

  return { kind: "pronto", runtime };
}

export function initialSteps(locale: LocaleBundle): BootStep[] {
  return bootSteps(locale).map((step) => ({ ...step, state: "espera" }));
}

export type { AiErrorCode };
