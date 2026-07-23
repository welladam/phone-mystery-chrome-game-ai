/**
 * Leitores genéricos.
 *
 * Onze aplicativos do aparelho são, na prática, listas de registros com
 * metadados: contatos, agenda, chamadas, navegação, extrato, corridas,
 * tarefas, rede social, autenticador, lixeira e correio. Em vez de escrever
 * onze telas quase iguais, eles compartilham estes leitores e diferem apenas
 * nos dados — que continuam sendo exatamente os do documento narrativo.
 */

import { useState } from "react";
import { AlertTriangle, Mail, PhoneIncoming, PhoneMissed, PhoneOutgoing } from "lucide-react";
import { CALLS, CONTACTS, UNKNOWN_NUMBER } from "../../content/shared";
import { ClueMark, Empty, Row } from "../phone/Bits";
import type { AppApi } from "./types";

function useClue(api: AppApi) {
  return (clueId?: string) =>
    clueId ? (
      <ClueMark
        clueId={clueId}
        found={api.state.cluesFound.includes(clueId)}
        examined={api.state.cluesExamined.includes(clueId)}
        onExamine={api.examine}
      />
    ) : null;
}

/* ------------------------------------------------------------------ */

export function ContactsApp({ api }: { api: AppApi }) {
  const mark = useClue(api);

  return (
    <div className="list">
      {CONTACTS.map((contact) => (
        <Row
          key={contact.id}
          title={
            <span className="contactrow">
              <span className="contactrow__avatar" aria-hidden>
                {contact.name[0]?.toUpperCase()}
              </span>
              {contact.name}
            </span>
          }
          meta={contact.phone}
        >
          {contact.note && <p className="muted">“{contact.note}”</p>}
        </Row>
      ))}
      <Row title={UNKNOWN_NUMBER} meta="sem cadastro" flag>
        <p className="muted">
          Este número não está na agenda. Ele aparece uma única vez no histórico de chamadas.
        </p>
        {mark("CLUE_028")}
      </Row>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function CallsApp({ api }: { api: AppApi }) {
  const mark = useClue(api);
  const icons = {
    recebida: <PhoneIncoming size={15} aria-hidden />,
    efetuada: <PhoneOutgoing size={15} aria-hidden />,
    perdida: <PhoneMissed size={15} aria-hidden />,
  };

  return (
    <div className="list">
      {CALLS.map((call) => (
        <Row
          key={call.id}
          title={
            <span className="callrow">
              <span className={`callrow__icon callrow__icon--${call.kind}`}>{icons[call.kind]}</span>
              {call.who}
            </span>
          }
          meta={call.at}
          flag={Boolean(call.unsaved)}
        >
          <p className="muted">
            {call.kind}
            {call.duration ? ` · ${call.duration}` : ""}
            {call.unsaved ? " · número sem cadastro" : ""}
          </p>
          {mark(call.clueId)}
        </Row>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function CalendarApp({ api }: { api: AppApi }) {
  const mark = useClue(api);
  const events = api.packs.act1?.CALENDAR ?? [];

  if (!events.length) return <Empty>Nada carregado ainda.</Empty>;

  return (
    <div className="list">
      {events.map((event) => (
        <Row key={event.id} title={event.title} meta={`${event.date} · ${event.time}`}>
          <p className="muted">Criado em {event.createdAt}</p>
          {event.note && <p className="muted">{event.note}</p>}
          {mark(event.clueId)}
        </Row>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function BrowserApp({ api }: { api: AppApi }) {
  const mark = useClue(api);
  const history = api.packs.act2?.BROWSER_HISTORY ?? [];

  if (!history.length) return <Empty>Histórico ainda não recuperado.</Empty>;

  return (
    <div className="list">
      {history.map((entry) => (
        <Row key={entry.id} title={entry.query} meta={entry.at}>
          {mark(entry.clueId)}
        </Row>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function MailApp({ api }: { api: AppApi }) {
  const mark = useClue(api);
  const [open, setOpen] = useState<string>();
  const [account, setAccount] = useState<"principal" | "arquivo">("principal");

  const main = api.packs.act2?.MAIL_MAIN ?? [];
  const archiveUnlocked = api.state.solvedLocks.includes("LOCK_005");
  const archive = archiveUnlocked ? api.packs.act3?.MAIL_ARCHIVE ?? [] : [];
  const list = account === "principal" ? main : archive;

  return (
    <div className="mail">
      <div className="tabs">
        <button
          type="button"
          className={account === "principal" ? "is-active" : ""}
          onClick={() => setAccount("principal")}
        >
          clara.mendonca.vasques
        </button>
        <button
          type="button"
          className={account === "arquivo" ? "is-active" : ""}
          onClick={() => {
            setAccount("arquivo");
            if (!archiveUnlocked) api.requestLock("LOCK_005");
          }}
        >
          clara.vsq.arquivo {archiveUnlocked ? "" : "🔒"}
        </button>
      </div>

      {account === "arquivo" && !archiveUnlocked && (
        <Empty>
          Esta conta pede a resposta de segurança e um código de verificação. O Autenticador
          mostra que a conta existe.
        </Empty>
      )}

      {list.map((item) => (
        <article key={item.id} className="mail__item">
          <button type="button" className="mail__head" onClick={() => setOpen(open === item.id ? undefined : item.id)}>
            <Mail size={15} aria-hidden />
            <span className="mail__from">{item.from}</span>
            <span className="mail__subject">{item.subject}</span>
            <span className="mail__at">{item.at}</span>
          </button>
          {open === item.id && (
            <div className="mail__body">
              <pre>{item.body}</pre>
              {mark(item.clueId)}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function BankApp({ api }: { api: AppApi }) {
  const mark = useClue(api);
  const pack = api.packs.act2;
  if (!pack) return <Empty>Carregando…</Empty>;

  return (
    <div className="list">
      <section className="panel">
        <h3>Recorrência ativa</h3>
        <p className="panel__big">{pack.BANK_RECURRING.label}</p>
        <p className="muted">
          {pack.BANK_RECURRING.amount} · {pack.BANK_RECURRING.day} · {pack.BANK_RECURRING.count}{" "}
          ocorrências desde {pack.BANK_RECURRING.since} · total {pack.BANK_RECURRING.total}
        </p>
        <p className="muted">{pack.BANK_RECURRING.description}</p>
        {mark("CLUE_014")}
      </section>

      {pack.BANK_STATEMENT.map((tx) => (
        <Row
          key={tx.id}
          title={tx.label}
          meta={<span className="amount">{tx.amount}</span>}
          flag={"flag" in tx && Boolean(tx.flag)}
        >
          <p className="muted">{tx.at}</p>
          {mark(tx.clueId)}
        </Row>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function RidesApp({ api }: { api: AppApi }) {
  const mark = useClue(api);
  const own = api.packs.act3?.RIDES_OWN ?? [];
  const shared = api.packs.act3?.RIDES_SHARED;

  return (
    <div className="list">
      <h3 className="section-title">Corridas solicitadas por Clara</h3>
      {own.length ? (
        own.map((ride) => (
          <Row key={ride.id} title={ride.route} meta={ride.at}>
            <p className="muted">{ride.price}</p>
          </Row>
        ))
      ) : (
        <Empty>Nenhuma corrida no período carregado.</Empty>
      )}

      <h3 className="section-title">Compartilhado comigo</h3>
      {!shared ? (
        <Empty>
          Nada aqui ainda. Capturas de tela enviadas por terceiros aparecem nesta aba quando você as
          recebe em conversa.
        </Empty>
      ) : (
        <>
          <p className="muted">{shared.header}</p>
          <p className="muted">{shared.note}</p>
          {shared.trips.map((trip) => (
            <Row key={trip.at} title={trip.route} meta={trip.at} flag={"flag" in trip && Boolean(trip.flag)}>
              <p className="muted">{trip.price}</p>
            </Row>
          ))}
          <p className="callout">{shared.summary}</p>
          {mark("CLUE_019")}
          {mark("CLUE_020")}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function SocialApp({ api }: { api: AppApi }) {
  const mark = useClue(api);
  const pack = api.packs.act2;
  if (!pack) return <Empty>Carregando…</Empty>;

  return (
    <div className="list social">
      <section className="panel social__header">
        <span className="social__avatar-ring">
          <span className="social__avatar">{pack.SOCIAL_PROFILE.handle[0]?.toUpperCase()}</span>
        </span>
        <div>
          <h3>@{pack.SOCIAL_PROFILE.handle}</h3>
          <p className="muted">
            Última publicação em {pack.SOCIAL_PROFILE.lastPost} · {pack.SOCIAL_PROFILE.silence}
          </p>
        </div>
      </section>

      <h3 className="section-title">Mensagens diretas · diego.andrade.silva</h3>
      <div className="social__dms">
        {pack.DM_DIEGO.map((dm, index) => (
          <Row key={dm.at} title={`Mensagem ${index + 1}`} meta={dm.at}>
            <p className="quote">{dm.text}</p>
          </Row>
        ))}
      </div>
      {mark("CLUE_018")}

      <h3 className="section-title">Salvos</h3>
      <div className="social__grid">
        {pack.SOCIAL_PROFILE.saved.map((item) => (
          <Row key={item.id} title={item.label} meta="captura de tela" flag>
            <p className="muted">{item.note}</p>
            {mark(item.clueId)}
          </Row>
        ))}
      </div>

      <h3 className="section-title">Stories arquivados</h3>
      <div className="social__grid">
        {pack.SOCIAL_PROFILE.archivedStories.map((item) => (
          <Row key={item.id} title={item.note} meta={item.at}>
            {mark(item.clueId)}
          </Row>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function TasksApp({ api }: { api: AppApi }) {
  const mark = useClue(api);
  const tasks = api.packs.act2?.TASKS ?? [];

  return (
    <div className="list">
      {tasks.map((task) => (
        <Row
          key={task.id}
          title={
            <span className={"struck" in task && task.struck ? "is-struck" : ""}>
              <span className={`task-check${task.done ? " is-done" : ""}`} aria-hidden>
                {task.done ? "☑" : "☐"}
              </span>{" "}
              {task.text}
            </span>
          }
          meta={"due" in task && task.due ? task.due : undefined}
        >
          <p className="muted">Criada em {task.created}</p>
          {"note" in task && task.note && <p className="muted">{task.note}</p>}
          {mark(task.clueId)}
        </Row>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function AuthApp({ api }: { api: AppApi }) {
  const codes = api.packs.act3?.AUTH_CODES ?? [];
  if (!codes.length) return <Empty>Carregando…</Empty>;

  return (
    <div className="list">
      <p className="muted">
        Este aplicativo guarda apenas códigos de verificação, nunca senhas. Ele revela quais contas
        existem.
      </p>
      {codes.map((entry) => (
        <Row key={entry.account} title={entry.account} meta="expira em 21s" flag={Boolean(entry.highlight)}>
          <p className="code">{entry.code}</p>
        </Row>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function TrashApp({ api }: { api: AppApi }) {
  const mark = useClue(api);
  const [open, setOpen] = useState<string>();
  const items = api.packs.act2?.TRASH ?? [];

  return (
    <div className="list">
      <p className="muted">Itens recuperados da imagem forense de 12/03/2026.</p>
      {items.map((item) => (
        <article key={item.id} className="mail__item">
          <button type="button" className="mail__head" onClick={() => setOpen(open === item.id ? undefined : item.id)}>
            <AlertTriangle size={14} aria-hidden />
            <span className="mail__from">{item.label}</span>
            <span className="mail__subject">{item.kind}</span>
            <span className="mail__at">apagado em {item.deletedAt}</span>
          </button>
          {open === item.id && (
            <div className="mail__body">
              <pre>{item.body}</pre>
              {mark(item.clueId)}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
