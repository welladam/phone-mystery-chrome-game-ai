/**
 * Catálogo de erros.
 *
 * O jogador nunca vê exceção, nome de classe ou stack trace: vê uma
 * explicação curta, a causa provável e o que fazer. O código técnico fica
 * apenas no diagnóstico exportável.
 */

export type AiErrorCode =
  | "INSECURE_CONTEXT"
  | "BROWSER_UNSUPPORTED"
  | "CHROME_TOO_OLD"
  | "DEVICE_UNSUPPORTED"
  | "PROMPT_API_ABSENT"
  | "TRANSLATOR_API_ABSENT"
  | "MODEL_UNAVAILABLE"
  | "DOWNLOAD_NOT_AUTHORIZED"
  | "DOWNLOAD_INTERRUPTED"
  | "NETWORK_LOST"
  | "TRANSLATE_PT_EN_FAILED"
  | "TRANSLATE_EN_PT_FAILED"
  | "TRANSLATE_TO_MODEL_FAILED"
  | "TRANSLATE_FROM_MODEL_FAILED"
  | "SESSION_FAILED"
  | "CONTEXT_OVERFLOW"
  | "CHECK_TIMEOUT"
  | "ACTIVATION_REQUIRED"
  | "STORAGE_BLOCKED"
  | "STORAGE_FULL"
  | "SAVE_CORRUPT"
  | "COMPONENT_EVICTED"
  | "UNKNOWN";

export type AiErrorInfo = {
  code: AiErrorCode;
  title: string;
  cause: string;
  action: string;
  /** Se falso, o botão "Tentar novamente" não aparece. */
  retryable: boolean;
  /** Mostra o lembrete de que a investigação continua salva. */
  keepsProgress: boolean;
};

export const ERROR_CATALOG: Record<AiErrorCode, AiErrorInfo> = {
  INSECURE_CONTEXT: {
    code: "INSECURE_CONTEXT",
    title: "Esta página precisa de uma conexão segura",
    cause:
      "Os componentes de inteligência do Chrome só funcionam em contexto seguro. Você abriu o jogo por um endereço comum de rede ou por arquivo local.",
    action: "Abra o jogo em http://localhost, http://127.0.0.1 ou em um endereço HTTPS.",
    retryable: true,
    keepsProgress: true,
  },
  BROWSER_UNSUPPORTED: {
    code: "BROWSER_UNSUPPORTED",
    title: "Este navegador não tem os componentes necessários",
    cause:
      "A investigação depende de dois recursos que hoje existem apenas no Chrome de computador: o modelo de conversa local e os pacotes de tradução.",
    action: "Abra o jogo no Chrome para Windows, macOS, Linux ou Chromebook Plus.",
    retryable: true,
    keepsProgress: true,
  },
  CHROME_TOO_OLD: {
    code: "CHROME_TOO_OLD",
    title: "Sua versão do Chrome é antiga demais",
    cause: "Os componentes usados aqui chegaram em versões mais recentes do navegador.",
    action: "Atualize o Chrome pelo menu Ajuda › Sobre o Google Chrome e reinicie o navegador.",
    retryable: true,
    keepsProgress: true,
  },
  DEVICE_UNSUPPORTED: {
    code: "DEVICE_UNSUPPORTED",
    title: "Este aparelho não consegue rodar o modelo local",
    cause:
      "O modelo de conversa exige espaço em disco e memória de vídeo acima do que este computador tem disponível. Celulares e tablets não são suportados.",
    action: "Tente em um computador com pelo menos 22 GB livres e 4 GB de memória de vídeo, ou 16 GB de RAM.",
    retryable: true,
    keepsProgress: true,
  },
  PROMPT_API_ABSENT: {
    code: "PROMPT_API_ABSENT",
    title: "O modelo de conversa não foi encontrado",
    cause: "O Chrome não está expondo o componente de conversa para esta página.",
    action:
      "Confirme que está no Chrome de computador atualizado. Se você usa um perfil gerenciado pela empresa, o recurso pode estar bloqueado por política.",
    retryable: true,
    keepsProgress: true,
  },
  TRANSLATOR_API_ABSENT: {
    code: "TRANSLATOR_API_ABSENT",
    title: "Os pacotes de tradução não foram encontrados",
    cause:
      "As conversas acontecem em português e são traduzidas dentro do próprio navegador. Sem esse componente, o jogo não pode começar.",
    action: "Atualize o Chrome e abra o jogo novamente.",
    retryable: true,
    keepsProgress: true,
  },
  MODEL_UNAVAILABLE: {
    code: "MODEL_UNAVAILABLE",
    title: "O modelo está indisponível agora",
    cause:
      "O Chrome informou que o componente não pode ser instalado neste momento. Isso costuma acontecer por falta de espaço, por conexão limitada ou por política do navegador.",
    action: "Libere espaço em disco, use uma conexão sem limite de dados e tente de novo.",
    retryable: true,
    keepsProgress: true,
  },
  DOWNLOAD_NOT_AUTHORIZED: {
    code: "DOWNLOAD_NOT_AUTHORIZED",
    title: "Falta a sua autorização para baixar",
    cause: "Nada é baixado sem você mandar. O Chrome precisa instalar os componentes antes do primeiro uso.",
    action: "Toque em “Baixar e instalar” para começar. Você acompanha o progresso aqui.",
    retryable: true,
    keepsProgress: true,
  },
  DOWNLOAD_INTERRUPTED: {
    code: "DOWNLOAD_INTERRUPTED",
    title: "O download foi interrompido",
    cause: "A instalação parou no meio. Pode ter sido queda de rede, suspensão do computador ou falta de espaço.",
    action: "Verifique a conexão e o espaço em disco e recomece. O que já baixou é aproveitado.",
    retryable: true,
    keepsProgress: true,
  },
  NETWORK_LOST: {
    code: "NETWORK_LOST",
    title: "A conexão caiu durante a instalação",
    cause: "O primeiro download precisa de internet. Depois disso, o jogo funciona sem rede.",
    action: "Reconecte e tente novamente.",
    retryable: true,
    keepsProgress: true,
  },
  TRANSLATE_PT_EN_FAILED: {
    code: "TRANSLATE_PT_EN_FAILED",
    title: "Não consegui preparar a tradução do português",
    cause: "O pacote de tradução de português para inglês não respondeu ao teste de verificação.",
    action: "Tente novamente. Se persistir, reinicie o Chrome para forçar a reinstalação do componente.",
    retryable: true,
    keepsProgress: true,
  },
  TRANSLATE_EN_PT_FAILED: {
    code: "TRANSLATE_EN_PT_FAILED",
    title: "Não consegui preparar a tradução para o português",
    cause: "O pacote de tradução de inglês para português não respondeu ao teste de verificação.",
    action: "Tente novamente. Se persistir, reinicie o Chrome para forçar a reinstalação do componente.",
    retryable: true,
    keepsProgress: true,
  },
  TRANSLATE_TO_MODEL_FAILED: {
    code: "TRANSLATE_TO_MODEL_FAILED",
    title: "Não consegui preparar a tradução da conversa",
    cause: "O pacote que traduz o idioma escolhido para o idioma do modelo não respondeu à verificação.",
    action: "Tente novamente. Se persistir, reinicie o Chrome para reinstalar o componente.",
    retryable: true,
    keepsProgress: true,
  },
  TRANSLATE_FROM_MODEL_FAILED: {
    code: "TRANSLATE_FROM_MODEL_FAILED",
    title: "Não consegui preparar as respostas traduzidas",
    cause: "O pacote que traduz as respostas do modelo para o idioma escolhido não respondeu à verificação.",
    action: "Tente novamente. Se persistir, reinicie o Chrome para reinstalar o componente.",
    retryable: true,
    keepsProgress: true,
  },
  SESSION_FAILED: {
    code: "SESSION_FAILED",
    title: "Uma conversa não pôde ser aberta",
    cause: "A sessão daquele contato falhou ao ser criada. As outras conversas continuam funcionando.",
    action: "Volte para a lista e abra a conversa de novo. O histórico está preservado.",
    retryable: true,
    keepsProgress: true,
  },
  CONTEXT_OVERFLOW: {
    code: "CONTEXT_OVERFLOW",
    title: "Esta conversa ficou longa demais",
    cause: "O modelo local guarda um número limitado de mensagens por sessão.",
    action:
      "A conversa foi reiniciada mantendo as mensagens mais recentes. Nada do que você descobriu foi perdido.",
    retryable: true,
    keepsProgress: true,
  },
  CHECK_TIMEOUT: {
    code: "CHECK_TIMEOUT",
    title: "O navegador não respondeu à verificação",
    cause:
      "Os componentes de inteligência aparecem como presentes, mas a consulta de disponibilidade ficou sem resposta. Costuma acontecer quando o Chrome está com o recurso desativado por sinalizador, quando o perfil é gerenciado por política, ou em janelas de navegador automatizadas.",
    action:
      "Abra o jogo numa janela normal do Chrome de computador, confirme em chrome://on-device-internals que os componentes estão habilitados e tente de novo.",
    retryable: true,
    keepsProgress: true,
  },
  ACTIVATION_REQUIRED: {
    code: "ACTIVATION_REQUIRED",
    title: "Toque para continuar",
    cause: "O Chrome exige uma ação sua imediatamente antes de preparar os componentes.",
    action: "Toque no botão abaixo para continuar de onde parou.",
    retryable: true,
    keepsProgress: true,
  },
  STORAGE_BLOCKED: {
    code: "STORAGE_BLOCKED",
    title: "Não consigo salvar neste navegador",
    cause:
      "O armazenamento local está bloqueado. Isso acontece em janela anônima ou quando os dados de site estão desativados.",
    action: "Abra o jogo em uma janela normal e permita dados de site para este endereço.",
    retryable: true,
    keepsProgress: false,
  },
  STORAGE_FULL: {
    code: "STORAGE_FULL",
    title: "O navegador ficou sem espaço",
    cause: "O Chrome recusou a gravação por falta de cota de armazenamento.",
    action: "Libere espaço em disco ou limpe dados de outros sites e tente de novo.",
    retryable: true,
    keepsProgress: false,
  },
  SAVE_CORRUPT: {
    code: "SAVE_CORRUPT",
    title: "O progresso salvo não pôde ser lido",
    cause: "O arquivo de progresso está incompleto ou foi alterado fora do jogo.",
    action: "Você pode começar uma investigação nova. Nenhum outro dado do navegador é afetado.",
    retryable: false,
    keepsProgress: false,
  },
  COMPONENT_EVICTED: {
    code: "COMPONENT_EVICTED",
    title: "O Chrome removeu um componente",
    cause:
      "O navegador pode desinstalar o modelo quando o disco fica cheio ou quando há atualização do componente.",
    action: "Autorize a instalação novamente. Sua investigação continua salva.",
    retryable: true,
    keepsProgress: true,
  },
  UNKNOWN: {
    code: "UNKNOWN",
    title: "Alguma coisa deu errado",
    cause: "A inicialização parou por um motivo que não consegui identificar.",
    action: "Tente novamente. Se continuar, recarregue a página.",
    retryable: true,
    keepsProgress: true,
  },
};

export class AiError extends Error {
  code: AiErrorCode;
  technical?: string;

  constructor(code: AiErrorCode, technical?: string) {
    super(ERROR_CATALOG[code].title);
    this.name = "AiError";
    this.code = code;
    this.technical = technical;
  }

  get info() {
    return ERROR_CATALOG[this.code];
  }
}

/** Converte exceções do navegador nos códigos do catálogo. */
export function toAiError(error: unknown, fallback: AiErrorCode = "UNKNOWN"): AiError {
  if (error instanceof AiError) return error;

  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    // A mensagem costuma ter o detalhe real ("model execution failed",
    // "session destroyed", etc.) — guardamos junto do nome, não só o nome.
    const detail = `${error.name}${error.message ? `: ${error.message}` : ""}`;
    switch (error.name) {
      case "NotAllowedError":
        return new AiError("ACTIVATION_REQUIRED", detail);
      case "NotSupportedError":
        return new AiError("MODEL_UNAVAILABLE", detail);
      case "NotReadableError":
        return new AiError("DOWNLOAD_INTERRUPTED", detail);
      case "QuotaExceededError":
        return new AiError("CONTEXT_OVERFLOW", detail);
      case "AbortError":
        // AbortError também é usado por tradução e geração. O chamador sabe
        // qual operação estava em curso; durante o boot ele passa
        // DOWNLOAD_INTERRUPTED, e durante o chat passa o erro específico da
        // tradução ou da sessão.
        return new AiError(fallback, detail);
      case "NetworkError":
        return new AiError("NETWORK_LOST", detail);
      case "InvalidStateError":
        return new AiError("COMPONENT_EVICTED", detail);
      default:
        return new AiError(fallback, detail);
    }
  }

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return new AiError("NETWORK_LOST");
  }

  const technical = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return new AiError(fallback, technical);
}
