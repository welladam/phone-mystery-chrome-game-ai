import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ChevronLeft, Paperclip, Send } from "lucide-react";
import { activeCharacters, presentableClues } from "../../engine/selectors";
import type { CharacterId } from "../../engine/types";
import { useAutoScroll } from "../a11y/hooks";
import { Empty } from "../phone/Bits";
import { playSound, primeSound } from "../sound";
import type { AppApi } from "./types";
import type { ConversationApi } from "./useConversation";
import { getLocaleChat } from "../../locales/chatRegistry";
import { useLocale } from "../../i18n/LocaleContext";

type Props = {
  api: AppApi;
  conversation: ConversationApi;
  initialCharacter?: CharacterId;
  requestKey?: number;
};

export default function ChatApp({ api, conversation, initialCharacter, requestKey }: Props) {
  const { t } = useLocale();
  const chatLocale = getLocaleChat(api.localeId);
  const [openId, setOpenId] = useState<CharacterId | undefined>(initialCharacter);
  const [archived, setArchived] = useState<string>();
  const [draft, setDraft] = useState("");
  const [attached, setAttached] = useState<string>();
  const [picker, setPicker] = useState(false);

  const characters = activeCharacters(api.state);
  const threads = api.packs.act1?.ARCHIVED_THREADS ?? [];

  useEffect(() => {
    if (openId) void conversation.greet(openId);
    // Abrir a conversa do contato anônimo limpa o aviso do ícone do Chat.
    if (openId === "CHAR_005") api.markUnknownRead();
  }, [openId, conversation, api]);

  useEffect(() => {
    api.setActiveChat(openId);
    return () => api.setActiveChat(undefined);
  }, [api.setActiveChat, openId]);

  useEffect(() => {
    if (initialCharacter) setOpenId(initialCharacter);
  }, [initialCharacter, requestKey]);

  useEffect(() => {
    if (!archived) return;
    const clueId = threads.find((thread) => thread.id === archived)?.clueId;
    if (clueId && !api.state.cluesExamined.includes(clueId)) api.examine(clueId);
  }, [archived, threads, api]);

  const chat = openId ? api.state.chats[openId] : undefined;
  const history =
    openId === "CHAR_002"
      ? api.packs.act1?.HISTORY_MOTHER
      : openId === "CHAR_003"
        ? api.packs.act1?.HISTORY_BOYFRIEND
        : openId === "CHAR_004"
          ? api.packs.act1?.HISTORY_FRIEND
          : undefined;
  const scrollRef = useAutoScroll<HTMLDivElement>(chat?.messages.length, !api.reducedMotion);

  useEffect(() => {
    if (!history) return;
    history.forEach((line) => {
      if (line.clueId && !api.state.cluesExamined.includes(line.clueId)) api.examine(line.clueId);
    });
  }, [history, api]);

  const available = useMemo(
    () => (openId ? presentableClues(api.state, openId) : []),
    [api.state, openId],
  );

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!openId || (!draft.trim() && !attached)) return;
    const text = draft.trim() || t("chat.lookAtEvidence", { clue: chatLocale.getClue(attached ?? "")?.label ?? "" });
    void conversation.send(openId, text, attached);
    primeSound();
    playSound("send");
    setDraft("");
    setAttached(undefined);
  }

  /* ---------------- lista de conversas ---------------- */
  if (!openId && !archived) {
    return (
      <div className="chatlist">
        {characters.map((id) => {
          const profile = chatLocale.getCharacter(id);
          const state = api.state.chats[id];
          const last = state?.messages[state.messages.length - 1];
          return (
            <button key={id} type="button" className="chatlist__row" onClick={() => setOpenId(id)}>
              <span className={`avatar avatar--${profile.tone}`}>{profile.initials}</span>
              <span className="chatlist__body">
                <span className="chatlist__name">
                  <span className="chatlist__label">{profile.displayName}</span>
                  {state?.collapsed && <span className="chatlist__tag">{t("chat.closedTag")}</span>}
                </span>
                <span className="chatlist__preview">
                  {last ? last.text.slice(0, 62) : profile.status}
                </span>
              </span>
            </button>
          );
        })}

        <p className="chatlist__divider">{t("chat.archived")}</p>
        {threads.map((thread) => (
          <button
            key={thread.id}
            type="button"
            className="chatlist__row chatlist__row--muted"
            onClick={() => setArchived(thread.id)}
          >
            <span className="avatar avatar--cinza">#</span>
            <span className="chatlist__body">
              <span className="chatlist__name">
                <span className="chatlist__label">{thread.title}</span>
              </span>
              <span className="chatlist__preview">{thread.subtitle}</span>
            </span>
          </button>
        ))}
      </div>
    );
  }

  /* ---------------- conversa arquivada ---------------- */
  if (archived) {
    const thread = threads.find((item) => item.id === archived);
    if (!thread) return <Empty>{t("chat.notFound")}</Empty>;

    return (
      <div className="thread">
        <button type="button" className="thread__back" onClick={() => setArchived(undefined)}>
          <ChevronLeft size={16} aria-hidden /> {thread.title}
        </button>
        <div className="thread__scroll">
          {thread.lines.map((line, index) => (
            <div key={index} className={`bubble bubble--${line.self ? "self" : "them"}`}>
              <p>{line.text}</p>
              <span className="bubble__at">{line.at}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------------- conversa viva ---------------- */
  const profile = chatLocale.getCharacter(openId!);

  return (
    <div className="thread">
      <button type="button" className="thread__back" onClick={() => setOpenId(undefined)}>
        <ChevronLeft size={16} aria-hidden /> {profile.displayName}
      </button>

      <div className="thread__scroll" ref={scrollRef}>
        {history?.map((line, index) => (
          <div
            key={`history-${index}`}
            className={
              line.gap
                ? "bubble bubble--gap"
                : `bubble bubble--${line.self ? "self" : "them"}${line.clueId ? " bubble--clue" : ""}`
            }
          >
            <p>{line.text}</p>
            <span className="bubble__at">{line.at}</span>
          </div>
        ))}

        {history && (
          <div className="thread__history-divider" role="separator" aria-label={t("chat.historyDivider")}>
            <span>{t("chat.historyDivider")}</span>
          </div>
        )}

        {chat?.messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "system"
                ? "bubble bubble--system"
                : `bubble bubble--${message.role === "player" ? "self" : "them"}`
            }
          >
            {message.clueId && (
              <span className="bubble__attach">📎 {chatLocale.getClue(message.clueId)?.label}</span>
            )}
            <p>{message.text}</p>
          </div>
        ))}

        {conversation.typing === openId && (
          <div className="bubble bubble--them bubble--typing" aria-live="polite">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      {chat?.collapsed && <p className="thread__closed">{t("chat.closed")}</p>}

      {!chat?.collapsed && (
        <form className="composer" onSubmit={submit}>
          {attached && (
            <div className="composer__attached">
              📎 {chatLocale.getClue(attached)?.label}
              <button type="button" onClick={() => setAttached(undefined)} aria-label={t("chat.removeAttachment")}>
                ×
              </button>
            </div>
          )}
          <div className="composer__row">
            <button
              type="button"
              className="composer__clip"
              onClick={() => setPicker((value) => !value)}
              aria-label={t("chat.presentEvidence")}
              disabled={available.length === 0}
            >
              <Paperclip size={17} aria-hidden />
            </button>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t("chat.placeholder")}
              aria-label={t("chat.messageFor", { name: profile.displayName })}
              disabled={conversation.busy}
            />
            <button
              type="submit"
              className="composer__send"
              disabled={conversation.busy || (!draft.trim() && !attached)}
              aria-label={t("chat.send")}
            >
              <Send size={17} aria-hidden />
            </button>
          </div>

          {picker && (
            <div className="composer__picker">
              {available.length === 0 && <p className="muted">{t("chat.noEvidence")}</p>}
              {available.map((clue) => (
                <button
                  key={clue.id}
                  type="button"
                  onClick={() => {
                    setAttached(clue.id);
                    setPicker(false);
                  }}
                >
                  {clue.label}
                </button>
              ))}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
