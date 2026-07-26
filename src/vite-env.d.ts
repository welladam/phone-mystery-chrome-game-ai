/// <reference types="vite/client" />

/**
 * Minimal typings for Chrome's experimental APIs.
 *
 * These API signatures have changed more than once. Current and legacy names
 * are deliberately accepted, and all access passes through adapters in `src/ai/`
 * that normalize differences in one place.
 */
declare global {
  /** Current specification values and legacy values still present in documentation. */
  type AiAvailabilityRaw =
    | "available"
    | "downloadable"
    | "downloading"
    | "unavailable"
    | "readily"
    | "after-download"
    | "no";

  type AiDownloadProgressEvent = Event & {
    /** Progress normalized from 0 to 1; this is not a byte count. */
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
