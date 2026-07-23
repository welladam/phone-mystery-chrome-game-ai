import { useState, type ReactElement } from "react";
import { Gavel, Lightbulb, Lock, PencilLine, Sparkles, Users } from "lucide-react";
import { hintLevel, suggestObstacle } from "../../engine/hints";
import { canAccuse, deriveContradictions } from "../../engine/rules";
import type { AppApi } from "./types";
import { Empty, Row } from "../phone/Bits";
import { useLocale } from "../../i18n/LocaleContext";
import { getLocaleContent } from "../../locales/contentRegistry";

type Tab = "notas" | "deducoes" | "pessoas" | "acusacao" | "dicas";

const LEGACY_NOTES_KEY = "clara.case-notes.v1";
const LEGACY_TIMELINE_KEY = "clara.case-timeline.v1";

const notesKey = (locale: string) => `clara.case-notes.v2:${locale}`;

function loadNotes(locale: string) {
  try {
    const localized = localStorage.getItem(notesKey(locale));
    if (localized !== null) return localized;
    if (locale !== "pt-BR") return "";
    const legacy = localStorage.getItem(LEGACY_NOTES_KEY);
    if (legacy === null) return "";
    localStorage.setItem(notesKey(locale), legacy);
    localStorage.removeItem(LEGACY_NOTES_KEY);
    return legacy;
  } catch {
    return "";
  }
}

function storeNotes(locale: string, value: string) {
  try {
    localStorage.setItem(notesKey(locale), value);
  } catch {
    // O texto continua disponível durante a sessão se o armazenamento falhar.
  }
}

export function clearNotebookStorage(locale: string) {
  try {
    localStorage.removeItem(notesKey(locale));
    if (locale === "pt-BR") localStorage.removeItem(LEGACY_NOTES_KEY);
    localStorage.removeItem(LEGACY_TIMELINE_KEY);
  } catch {
    // O save principal ainda é limpo separadamente.
  }
}

export default function NotebookApp({ api }: { api: AppApi }) {
  const { t } = useLocale();
  const [tab, setTab] = useState<Tab>("notas");
  const [notes, setNotes] = useState(() => loadNotes(api.localeId));
  const hard = api.state.difficulty === "hard";
  const accusationLocked = !canAccuse(api.state);

  const tabs: Array<[Tab, string, ReactElement, boolean, string | undefined]> = [
    ["notas", t("notebook.notes"), <PencilLine key="n" size={15} />, false, undefined],
    ["deducoes", t("notebook.deductions"), <Sparkles key="d" size={15} />, hard, t("notebook.hardUnavailable")],
    ["pessoas", t("notebook.people"), <Users key="p" size={15} />, hard, t("notebook.hardUnavailable")],
    ["acusacao", t("notebook.accusation"), <Gavel key="a" size={15} />, accusationLocked, t("notebook.act4Available")],
    ["dicas", t("notebook.hints"), <Lightbulb key="h" size={15} />, hard, t("notebook.hardUnavailable")],
  ];

  return (
    <div className="notebook">
      <nav className="notebook__tabs" aria-label={t("notebook.sections")}>
        {tabs.map(([id, label, icon, locked, reason]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? "is-active" : ""}
            onClick={() => setTab(id)}
            disabled={locked}
            title={locked ? reason : undefined}
          >
            {locked ? <Lock size={14} aria-hidden /> : icon}
            {label}
            {locked && <span className="sr-only"> — {reason}</span>}
          </button>
        ))}
      </nav>

      {tab === "notas" && (
        <section className="manual-notes">
          <div className="manual-notes__intro">
            <h3>{t("notebook.investigator")}</h3>
            <p>{t("notebook.instructions")}</p>
          </div>
          <div className="manual-notes__sheet">
            <textarea
              value={notes}
              onChange={(event) => {
                const next = event.target.value;
                setNotes(next);
                storeNotes(api.localeId, next);
              }}
              placeholder={t("notebook.placeholder")}
              aria-label={t("notebook.notesAria")}
              spellCheck
            />
          </div>
          <p className="manual-notes__saved">{t("notebook.autoSaved")}</p>
        </section>
      )}

      {tab === "deducoes" && <DeductionsPanel api={api} />}
      {tab === "pessoas" && <PeoplePanel api={api} />}
      {tab === "acusacao" && <AccusationPanel api={api} />}
      {tab === "dicas" && <HintPanel api={api} />}
    </div>
  );
}

function DeductionsPanel({ api }: { api: AppApi }) {
  const { t } = useLocale();
  const content = getLocaleContent(api.localeId).manifest;
  const memories = content.MEMORIES.filter((memory) => api.state.memories.includes(memory.id));
  const contradictionIds = new Set(deriveContradictions(api.state).map((item) => item.id));
  const contradictions = content.CONTRADICTIONS.filter((item) => contradictionIds.has(item.id));
  if (memories.length === 0 && contradictions.length === 0) {
    return <div className="list notebook-page"><Empty>{t("notebook.noDeductions")}</Empty></div>;
  }
  return (
    <div className="list notebook-page">
      {memories.length > 0 && <section className="panel"><h3>{t("notebook.established")}</h3>{memories.map((memory) => <Row key={memory.id} title={memory.label}><p>{memory.text}</p></Row>)}</section>}
      {contradictions.length > 0 && <section className="panel panel--warn"><h3>{t("notebook.versionsConflict")}</h3>{contradictions.map((item) => <Row key={item.id} title={t("notebook.contradiction")}><p>{item.text}</p></Row>)}</section>}
    </div>
  );
}

function PeoplePanel({ api }: { api: AppApi }) {
  const { t } = useLocale();
  const people = getLocaleContent(api.localeId).notebookPeople;
  return (
    <div className="list notebook-page">
      {people.map((person) => <Row key={person.id} title={person.name} meta={person.role}>
        <p className="muted"><strong>{t("notebook.whatSaid")}</strong> {person.said}</p>
        <p className="muted"><strong>{t("notebook.whatDataSays")}</strong> {person.data}</p>
      </Row>)}
    </div>
  );
}

function AccusationPanel({ api }: { api: AppApi }) {
  const { t } = useLocale();
  const draft = api.state.accusation;
  const lastAttempt = api.state.accusationAttempts[api.state.accusationAttempts.length - 1];
  return (
    <div className="list accusation accusation--simple notebook-page">
      <section className="panel">
        <h3>{t("accusation.conclusion")}</h3>
        <p className="muted">{t("accusation.intro")}</p>
        <ol className="accusation-points">
          <li><strong>{t("accusation.responsible")}</strong><span>{t("accusation.responsibleQuestion")}</span></li>
          <li><strong>{t("accusation.motive")}</strong><span>{t("accusation.motiveQuestion")}</span></li>
          <li><strong>{t("accusation.method")}</strong><span>{t("accusation.methodQuestion")}</span></li>
          <li><strong>{t("accusation.opportunity")}</strong><span>{t("accusation.opportunityQuestion")}</span></li>
        </ol>
      </section>

      <label className="accusation-answer">
        <span>{t("accusation.answerLabel")}</span>
        <input
          type="text"
          value={draft.responsavel ?? ""}
          onChange={(event) => api.setAccusation({ responsavel: event.target.value })}
          placeholder={t("accusation.placeholder")}
          autoComplete="off"
        />
      </label>

      {lastAttempt?.outcome === "rejeitada" && (
        <section className="panel panel--warn" role="alert">
          <h3>{t("accusation.invalidTitle")}</h3>
          <p>{t("accusation.invalidText")}</p>
        </section>
      )}

      <button
        type="button"
        className="btn btn--primary btn--wide"
        onClick={api.submitAccusation}
        disabled={!draft.responsavel?.trim()}
      >
        <Gavel size={17} aria-hidden /> {t("accusation.confirm")}
      </button>
    </div>
  );
}

function HintPanel({ api }: { api: AppApi }) {
  const { t } = useLocale();
  const obstacle = suggestObstacle(api.state);
  const hint = getLocaleContent(api.localeId).hints.hintFor(obstacle);
  const level = hintLevel(api.state, obstacle);
  if (!hint) return <Empty>{t("hint.none")}</Empty>;
  return (
    <div className="list notebook-page">
      <section className="panel">
        <h3>{hint.title}</h3>
        <p className="muted">{t("hint.deepens")}</p>
        {hint.steps.slice(0, level).map((step, index) => <p key={index} className="hint"><strong>{t("hint.step", { step: index + 1 })}</strong> {step}</p>)}
        {level < 3 && <button type="button" className="btn" onClick={() => api.useHint(obstacle)}>{level === 0 ? t("hint.direction") : level === 1 ? t("hint.focus") : t("hint.answer")}</button>}
      </section>
    </div>
  );
}
