/**
 * Tipos centrais do motor de jogo.
 *
 * Regra de ouro: nenhum identificador aqui pode revelar a solução do caso.
 * Usamos IDs opacos e estáveis (CLUE_0xx, EVENT_0xx, LOCK_00x, MEMORY_0xx).
 */

export type ActNumber = 1 | 2 | 3 | 4;

export type AppId =
  | "APP_001" // Notificações
  | "APP_002" // Vínculo (chat)
  | "APP_003" // Galeria
  | "APP_004" // Correio
  | "APP_005" // Contatos
  | "APP_006" // Agenda
  | "APP_007" // Órbita (navegador)
  | "APP_008" // Telefone
  | "APP_009" // Voz Segura
  | "APP_010" // Bloco (notas)
  | "APP_011" // Rumo (mapas)
  | "APP_012" // Nimbo Drive
  | "APP_013" // Recuperados
  | "APP_014" // Pulso (saúde)
  | "APP_015" // Banco Aurora
  | "APP_016" // Vello
  | "APP_017" // Fluxo
  | "APP_018" // Chave
  | "APP_019" // Feito
  | "APP_020" // Ajustes
  | "APP_021"; // Caderno do Caso

export type LockId =
  | "LOCK_001"
  | "LOCK_002"
  | "LOCK_003"
  | "LOCK_004"
  | "LOCK_005"
  | "LOCK_006"
  | "LOCK_007"
  | "LOCK_008"
  | "LOCK_009";

export type CharacterId = "CHAR_002" | "CHAR_003" | "CHAR_004" | "CHAR_005";

export type ClueId = string;
export type EventId = string;
export type MemoryId = string;
export type PhotoId = string;
export type VoiceId = string;

export type ClueWeight = 1 | 2 | 3 | 4;
export type ClueKind = "fato" | "testemunhal" | "inferencial" | "falsa";

export type Clue = {
  id: ClueId;
  /** Rótulo curto exibido no caderno. */
  label: string;
  /** Descrição neutra do que a pista mostra. */
  summary: string;
  app: AppId;
  act: ActNumber;
  kind: ClueKind;
  weight: ClueWeight;
  /** Blocos probatórios usados na acusação: A (presença), B (horário), C (motivo). */
  block?: "A" | "B" | "C";
  /** Fato correspondente em inglês, injetado na IA apenas quando permitido. */
  factEN?: string;
};

export type Memory = {
  id: MemoryId;
  label: string;
  text: string;
  /** Precisa de pelo menos N destas pistas examinadas. */
  requiresAnyOf?: ClueId[];
  requiresCount?: number;
  requiresAllOf?: ClueId[];
};

export type LockKind = "pin" | "palavra" | "pergunta";

export type Lock = {
  id: LockId;
  kind: LockKind;
  /** Rótulo do campo. */
  prompt: string;
  /** Dica escrita pela própria Clara, sempre visível. */
  hint: string;
  /** Comprimento esperado (só informativo para o teclado numérico). */
  length?: number;
  /** Segundo fator opcional (código do autenticador). */
  secondFactorPrompt?: string;
  /** Registro de tentativas anteriores exibido antes de destravar. */
  priorAttempts?: string;
  /** Aceita estas respostas (já normalizadas). */
  accepts: string[];
  secondFactorAccepts?: string[];
  /** Pistas liberadas ao abrir. */
  grantsClues?: ClueId[];
  /** Aplicativo/áreas liberadas ao abrir. */
  unlocksApps?: AppId[];
};

export type PhoneAppDescriptor = {
  id: AppId;
  name: string;
  /** Nome do ícone lucide-react. */
  icon: string;
  /** Ato mínimo em que o app aparece na tela inicial. */
  availableFrom: ActNumber;
  /** Cor de acento do ícone. */
  tone: "verde" | "azul" | "ambar" | "rosa" | "cinza" | "roxo";
  /** Texto curto exibido sob o ícone quando há novidade. */
  subtitle?: string;
  /** Bloqueio que protege o app inteiro. */
  lock?: LockId;
};

export type ChatRole = "player" | "character" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  at: string;
  /** Pista anexada pelo jogador nesta mensagem. */
  clueId?: ClueId;
  /** Marca falas canônicas (não geradas pela IA). */
  scripted?: boolean;
};

export type ChatState = {
  messages: ChatMessage[];
  /** IDs de fatos já liberados para este personagem. */
  disclosed: string[];
  /** Beats canônicos já disparados. */
  beats: string[];
  /** Pistas que o jogador já apresentou a este personagem. */
  presented: ClueId[];
  /** Intenções já detectadas nesta conversa. */
  intents: string[];
  /** Bloqueio temporário (silêncio narrativo) em epoch ms. */
  silentUntil?: number;
  collapsed?: boolean;
};

export type AccusationDraft = {
  responsavel?: string;
  motivo?: string;
  metodo?: string;
  oportunidade?: string;
  sequencia: string[];
  evidencias: ClueId[];
  contradicao?: string;
  contradicaoExplicacao?: string;
  desconhecida?: string;
};

export type AccusationAttempt = {
  at: string;
  outcome: "aceita" | "parcial" | "rejeitada";
  feedbackId: string;
};

export type TimelineNodeId =
  | "NODE_1"
  | "NODE_2"
  | "NODE_3"
  | "NODE_4"
  | "NODE_5"
  | "NODE_6"
  | "NODE_7"
  | "NODE_8"
  | "NODE_9";

export type Preferences = {
  reducedMotion: boolean;
  largeText: boolean;
  lastApp?: AppId;
};

export type GameState = {
  saveVersion: number;
  act: ActNumber;
  /** Aparelho já destravado com o PIN da tela. */
  phoneUnlocked: boolean;
  unlockedApps: AppId[];
  solvedLocks: LockId[];
  lockAttempts: Record<string, number>;
  cluesFound: ClueId[];
  cluesExamined: ClueId[];
  memories: MemoryId[];
  eventsFired: EventId[];
  chats: Record<string, ChatState>;
  /** Conhecimento compartilhado entre CHAR_004 e CHAR_005 (mesma pessoa). */
  sharedLeak: string[];
  unknownEntered: boolean;
  /** Registro de qual janela está "digitando" — nunca duas ao mesmo tempo. */
  typingLock?: CharacterId;
  notificationsSeen: string[];
  zoomed: PhotoId[];
  playedVoices: VoiceId[];
  timeline: Partial<Record<TimelineNodeId, ClueId>>;
  accusation: AccusationDraft;
  accusationAttempts: AccusationAttempt[];
  hintsUsed: Record<string, number>;
  metaAttempts: number;
  revealShown: boolean;
  sentAudioToDiego: boolean;
  startedAt: string;
  lastSavedAt: string;
  /** Marca de tempo da entrada no ato atual (usada nos fallbacks anti-bloqueio). */
  actEnteredAt: number;
};

export type GameAction =
  | { type: "RESTORE"; state: GameState }
  | { type: "UNLOCK_PHONE" }
  | { type: "OPEN_APP"; appId: AppId }
  | { type: "FIND_CLUE"; clueId: ClueId }
  | { type: "EXAMINE_CLUE"; clueId: ClueId }
  | { type: "ZOOM_PHOTO"; photoId: PhotoId }
  | { type: "PLAY_VOICE"; voiceId: VoiceId }
  | { type: "SOLVE_LOCK"; lockId: LockId }
  | { type: "FAIL_LOCK"; lockId: LockId }
  | { type: "SEE_NOTIFICATION"; notificationId: string }
  | { type: "CHAT_APPEND"; characterId: CharacterId; message: ChatMessage }
  | { type: "CHAT_DISCLOSE"; characterId: CharacterId; factIds: string[] }
  | { type: "CHAT_BEAT"; characterId: CharacterId; beatId: string }
  | { type: "CHAT_INTENT"; characterId: CharacterId; intent: string }
  | { type: "CHAT_PRESENT"; characterId: CharacterId; clueId: ClueId }
  | { type: "CHAT_SILENCE"; characterId: CharacterId; untilMs: number }
  | { type: "CHAT_COLLAPSE"; characterId: CharacterId }
  | { type: "SET_TYPING"; characterId?: CharacterId }
  | { type: "LEAK"; token: string }
  | { type: "FIRE_EVENT"; eventId: EventId }
  | { type: "PLACE_NODE"; node: TimelineNodeId; clueId: ClueId }
  | { type: "CLEAR_NODE"; node: TimelineNodeId }
  | { type: "SET_ACCUSATION"; patch: Partial<AccusationDraft> }
  | { type: "TOGGLE_SEQUENCE"; cardId: string }
  | { type: "TOGGLE_EVIDENCE"; clueId: ClueId }
  | { type: "RECORD_ACCUSATION"; attempt: AccusationAttempt }
  | { type: "SHOW_REVEAL" }
  | { type: "SEND_AUDIO_TO_DIEGO" }
  | { type: "USE_HINT"; obstacleId: string }
  | { type: "META_ATTEMPT" }
  | { type: "TOUCH_SAVE" };
