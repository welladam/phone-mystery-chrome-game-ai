import { getApp } from "../../content/manifest";
import type { AppId, CharacterId } from "../../engine/types";
import ChatApp from "./ChatApp";
import {
  FilesApp,
  HealthApp,
  MapsApp,
  NotesApp,
  NotificationsApp,
  PhotosApp,
  RecorderApp,
  SettingsApp,
} from "./CoreApps";
import NotebookApp from "./NotebookApp";
import {
  AuthApp,
  BankApp,
  BrowserApp,
  CalendarApp,
  CallsApp,
  ContactsApp,
  MailApp,
  RidesApp,
  SocialApp,
  TasksApp,
  TrashApp,
} from "./SimpleApps";
import type { AppApi } from "./types";
import type { ConversationApi } from "./useConversation";

type RenderArgs = {
  appId: AppId;
  api: AppApi;
  conversation: ConversationApi;
  initialCharacter?: CharacterId;
  chatRequestKey?: number;
};

export function renderApp({ appId, api, conversation, initialCharacter, chatRequestKey }: RenderArgs) {
  switch (appId) {
    case "APP_001":
      return <NotificationsApp api={api} />;
    case "APP_002":
      return (
        <ChatApp
          api={api}
          conversation={conversation}
          initialCharacter={initialCharacter}
          requestKey={chatRequestKey}
        />
      );
    case "APP_003":
      return <PhotosApp api={api} />;
    case "APP_004":
      return <MailApp api={api} />;
    case "APP_005":
      return <ContactsApp api={api} />;
    case "APP_006":
      return <CalendarApp api={api} />;
    case "APP_007":
      return <BrowserApp api={api} />;
    case "APP_008":
      return <CallsApp api={api} />;
    case "APP_009":
      return <RecorderApp api={api} />;
    case "APP_010":
      return <NotesApp api={api} />;
    case "APP_011":
      return <MapsApp api={api} />;
    case "APP_012":
      return <FilesApp api={api} />;
    case "APP_013":
      return <TrashApp api={api} />;
    case "APP_014":
      return <HealthApp api={api} />;
    case "APP_015":
      return <BankApp api={api} />;
    case "APP_016":
      return <RidesApp api={api} />;
    case "APP_017":
      return <SocialApp api={api} />;
    case "APP_018":
      return <AuthApp api={api} />;
    case "APP_019":
      return <TasksApp api={api} />;
    case "APP_020":
      return <SettingsApp api={api} />;
    case "APP_021":
      return <NotebookApp api={api} />;
    default:
      return null;
  }
}

export function appTitle(appId: AppId) {
  return getApp(appId)?.name ?? "Aplicativo";
}
