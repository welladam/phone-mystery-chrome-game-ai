/// <reference types="vite/client" />

/**
 * Tipagem mínima das APIs experimentais do Chrome.
 *
 * A assinatura destas APIs mudou mais de uma vez. Aceitamos deliberadamente
 * tanto os nomes atuais quanto os legados, e todo acesso passa pelos
 * adaptadores em `src/ai/`, que normalizam as diferenças num único lugar.
 */
declare global {
  /** Valores atuais da especificação e os legados ainda presentes em docs. */
  type AiAvailabilityRaw =
    | "available"
    | "downloadable"
    | "downloading"
    | "unavailable"
    | "readily"
    | "after-download"
    | "no";

  type AiDownloadProgressEvent = Event & {
    /** Progresso normalizado de 0 a 1 — não é contagem de bytes. */
    readonly loaded?: number;
    readonly total?: number;
  };

  interface AiCreateMonitor extends EventTarget {
    addEventListener(
      type: "downloadprogress",
      listener: (event: AiDownloadProgressEvent) => void,
      options?: AddEventListenerOptions | boolean,
    ): void;
  }

  type AiTextExpectation = { type: "text"; languages?: string[] };

  type AiPromptRole = "system" | "user" | "assistant";

  interface AiPromptMessage {
    role: AiPromptRole;
    content: string;
    prefix?: boolean;
  }

  interface LanguageModelSession extends EventTarget {
    prompt(
      input: string | AiPromptMessage[],
      options?: { signal?: AbortSignal; responseConstraint?: unknown },
    ): Promise<string>;
    promptStreaming?(
      input: string | AiPromptMessage[],
      options?: { signal?: AbortSignal },
    ): AsyncIterable<string>;
    append?(messages: AiPromptMessage[]): Promise<void>;
    clone?(options?: { signal?: AbortSignal }): Promise<LanguageModelSession>;
    measureContextUsage?(input: string): Promise<number>;
    measureInputUsage?(input: string): Promise<number>;
    destroy?(): void;
    readonly contextWindow?: number;
    readonly contextUsage?: number;
    readonly inputQuota?: number;
    readonly inputUsage?: number;
  }

  interface LanguageModelCreateOptions {
    initialPrompts?: AiPromptMessage[];
    expectedInputs?: AiTextExpectation[];
    expectedOutputs?: AiTextExpectation[];
    temperature?: number;
    topK?: number;
    monitor?: (monitor: AiCreateMonitor) => void;
  }

  interface LanguageModelStatic {
    availability(options?: LanguageModelCreateOptions): Promise<AiAvailabilityRaw>;
    create(options?: LanguageModelCreateOptions): Promise<LanguageModelSession>;
    params?(): Promise<{
      defaultTopK?: number;
      maxTopK?: number;
      defaultTemperature?: number;
      maxTemperature?: number;
    }>;
  }

  interface TranslatorInstance {
    translate(input: string, options?: { signal?: AbortSignal }): Promise<string>;
    translateStreaming?(input: string): AsyncIterable<string>;
    destroy?(): void;
  }

  interface TranslatorCreateOptions {
    sourceLanguage: string;
    targetLanguage: string;
    monitor?: (monitor: AiCreateMonitor) => void;
  }

  interface TranslatorStatic {
    availability(
      options: Omit<TranslatorCreateOptions, "monitor">,
    ): Promise<AiAvailabilityRaw>;
    create(options: TranslatorCreateOptions): Promise<TranslatorInstance>;
  }

  // eslint-disable-next-line no-var
  var LanguageModel: LanguageModelStatic | undefined;
  // eslint-disable-next-line no-var
  var Translator: TranslatorStatic | undefined;
}

export {};
