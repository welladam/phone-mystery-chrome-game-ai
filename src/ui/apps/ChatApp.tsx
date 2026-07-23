import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ChevronLeft, Paperclip, Send } from "lucide-react";
import { CHARACTERS } from "../../content/characters/base";
import { getClue } from "../../content/manifest";
import { activeCharacters, presentableClues } from "../../engine/selectors";
import type { CharacterId } from "../../engine/types";
import { useAutoScroll } from "../a11y/hooks";
import { Empty } from "../phone/Bits";
import type { AppApi } from "./types";
import type { ConversationApi } from "./useConversation";

type Props = {
  api: AppApi;
  conversation: ConversationApi;
  initialCharacter?: CharacterId;
};

export default function ChatApp({ api, conversation, initialCharacter }: Props) {
  const [openId, setOpenId] = useState<CharacterId | undefined>(initialCharacter);
  const [archived, setArchived] = useState<string>();
  const [draft, setDraft] = useState("");
  const [attached, setAttached] = useState<string>();
  const [picker, setPicker] = useState(false);

  const characters = activeCharacters(api.state);
  const threads = api.packs.act1?.ARCHIVED_THREADS ?? [];

  useEffect(() => {
    if (openId) void conversation.greet(openId);
    // Abrir a conversa do contato anônimo limpa o aviso do ícone do Vínculo.
    if (openId === "CHAR_005") api.markUnknownRead();
  }, [openId, conversation, api]);

  useEffect(() => {
    if (!archived) return;
    const clueId = threads.find((thread) => thread.id === archived)?.clueId;
    if (clueId && !api.state.cluesExamined.includes(clueId)) api.examine(clueId);
  }, [archived, threads, api]);

  const chat = openId ? api.state.chats[openId] : undefined;
  const scrollRef = useAutoScroll<HTMLDivElement>(chat?.messages.length, !api.reducedMotion);

  const available = useMemo(
    () => (openId ? presentableClues(api.state, openId) : []),
    [api.state, openId],
  );

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!openId || (!draft.trim() && !attached)) return;
    const text = draft.trim() || `Quero que você olhe isto: ${getClue(attached ?? "")?.label ?? ""}`;
    void conversation.send(openId, text, attached);
    setDraft("");
    setAttached(undefined);
  }

  /* ---------------- lista de conversas ---------------- */
  if (!openId && !archived) {
    return (
      <div className="chatlist">
        {characters.map((id) => {
          const profile = CHARACTERS[id];
          const state = api.state.chats[id];
          const last = state?.messages[state.messages.length - 1];
          return (
            <button key={id} type="button" className="chatlist__row" onClick={() => setOpenId(id)}>
              <span className={`avatar avatar--${profile.tone}`}>{profile.initials}</span>
              <span className="chatlist__body">
                <span className="chatlist__name">
                  {profile.displayName}
                  {state?.collapsed && <span className="chatlist__tag">encerrada</span>}
                </span>
                <span className="chatlist__preview">
                  {last ? last.text.slice(0, 62) : profile.status}
                </span>
              </span>
            </button>
          );
        })}

        <p className="chatlist__divider">Conversas antigas do aparelho</p>
        {threads.map((thread) => (
          <button
            key={thread.id}
            type="button"
            className="chatlist__row chatlist__row--muted"
            onClick={() => setArchived(thread.id)}
          >
            <span className="avatar avatar--cinza">#</span>
            <span className="chatlist__body">
              <span className="chatlist__name">{thread.title}</span>
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
    if (!thread) return <Empty>Conversa não encontrada.</Empty>;

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
  const profile = CHARACTERS[openId!];
  const history =
    openId === "CHAR_002"
      ? api.packs.act1?.HISTORY_MOTHER
      : openId === "CHAR_003"
        ? api.packs.act1?.HISTORY_BOYFRIEND
        : openId === "CHAR_004"
          ? api.packs.act1?.HISTORY_FRIEND
          : undefined;

  return (
    <div className="thread">
      <button type="button" className="thread__back" onClick={() => setOpenId(undefined)}>
        <ChevronLeft size={16} aria-hidden /> {profile.displayName}
      </button>

      <div className="thread__scroll" ref={scrollRef}>
        {history && (
          <details
            className="thread__history"
            onToggle={(event) => {
              if (!event.currentTarget.open) return;
              history.forEach((line) => {
                if (line.clueId && !api.state.cluesExamined.includes(line.clueId)) api.examine(line.clueId);
              });
            }}
          >
            <summary>Histórico anterior no aparelho ({history.length} mensagens)</summary>
            {history.map((line, index) => (
              <div
                key={index}
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
          </details>
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
              <span className="bubble__attach">📎 {getClue(message.clueId)?.label}</span>
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

      {chat?.collapsed && <p className="thread__closed">Esta conversa foi encerrada do outro lado.</p>}

      {!chat?.collapsed && (
        <form className="composer" onSubmit={submit}>
          {attached && (
            <div className="composer__attached">
              📎 {getClue(attached)?.label}
              <button type="button" onClick={() => setAttached(undefined)} aria-label="Remover anexo">
                ×
              </button>
            </div>
          )}
          <div className="composer__row">
            <button
              type="button"
              className="composer__clip"
              onClick={() => setPicker((value) => !value)}
              aria-label="Apresentar uma prova"
              disabled={available.length === 0}
            >
              <Paperclip size={17} aria-hidden />
            </button>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Escreva em português…"
              aria-label={`Mensagem para ${profile.displayName}`}
              disabled={conversation.busy}
            />
            <button
              type="submit"
              className="composer__send"
              disabled={conversation.busy || (!draft.trim() && !attached)}
              aria-label="Enviar"
            >
              <Send size={17} aria-hidden />
            </button>
          </div>

          {picker && (
            <div className="composer__picker">
              {available.length === 0 && <p className="muted">Nenhuma pista nova para apresentar.</p>}
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
