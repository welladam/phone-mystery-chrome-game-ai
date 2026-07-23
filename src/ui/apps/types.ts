import type { Act1Pack, Act2Pack, Act3Pack, Act4Pack } from "../../content/registry";
import type { AppId, CharacterId, GameState, LockId } from "../../engine/types";
import type { LocaleId } from "../../locales/types";

export type ContentPacks = {
  act1?: Act1Pack;
  act2?: Act2Pack;
  act3?: Act3Pack;
  act4?: Act4Pack;
};

/** Tudo o que um aplicativo pode fazer passa por estas ações do motor. */
export type AppApi = {
  state: GameState;
  packs: ContentPacks;
  reducedMotion: boolean;
  localeId: LocaleId;
  examine: (clueId: string) => void;
  find: (clueId: string) => void;
  zoom: (photoId: string) => void;
  playVoice: (voiceId: string) => void;
  requestLock: (lockId: LockId) => void;
  openApp: (appId: AppId) => void;
  openChat: (characterId: CharacterId) => void;
  setActiveChat: (characterId?: CharacterId) => void;
  sendExcerptToFriend: () => void;
  sendAudioToDiego: () => void;
  setAccusation: (patch: Record<string, unknown>) => void;
  submitAccusation: () => void;
  useHint: (obstacleId: string) => void;
  markUnknownRead: () => void;
};
