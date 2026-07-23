import * as ptBRChat from "./pt-BR/chat";
import type { LocaleId } from "./types";

export type LocaleChatPack = typeof ptBRChat;

const CHAT_PACKS: Partial<Record<LocaleId, LocaleChatPack>> = {
  "pt-BR": ptBRChat,
};

export function getLocaleChat(locale: LocaleId): LocaleChatPack {
  const pack = CHAT_PACKS[locale];
  if (!pack) throw new Error(`Chat indisponível para o locale ${locale}`);
  return pack;
}

