import { useState, type FormEvent, type ReactElement } from "react";
import { Gavel, Lightbulb, PencilLine, Plus, Scale, Trash2, Users } from "lucide-react";
import { CLUES, getClue } from "../../content/manifest";
import { missingBlocks } from "../../engine/accusation";
import { hintFor, hintLevel, suggestObstacle } from "../../engine/hints";
import { canAccuse } from "../../engine/rules";
import { evidenceCoverage } from "../../engine/selectors";
import type { AppApi } from "./types";
import { Empty, Row } from "../phone/Bits";

type Tab = "notas" | "pessoas" | "linha" | "acusacao" | "dicas";

type ManualTimelineEntry = {
  id: string;
  time: string;
  title: string;
  description: string;
};

const NOTES_KEY = "clara.case-notes.v1";
const TIMELINE_KEY = "clara.case-timeline.v1";

function loadNotes() {
  try {
    return localStorage.getItem(NOTES_KEY) ?? "";
  } catch {
    return "";
  }
}

function storeNotes(value: string) {
  try {
    localStorage.setItem(NOTES_KEY, value);
  } catch {
    // Se o navegador bloquear armazenamento, o texto continua disponível
    // durante esta sessão e a investigação segue normalmente.
  }
}

function loadTimeline(): ManualTimelineEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(TIMELINE_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is ManualTimelineEntry =>
        typeof entry === "object" &&
        entry !== null &&
        typeof entry.id === "string" &&
        typeof entry.time === "string" &&
        typeof entry.title === "string" &&
        typeof entry.description === "string",
    );
  } catch {
    return [];
  }
}

function storeTimeline(entries: ManualTimelineEntry[]) {
  try {
    localStorage.setItem(TIMELINE_KEY, JSON.stringify(entries));
  } catch {
    // A linha do tempo continua disponível nesta sessão se o armazenamento
    // estiver bloqueado pelo navegador.
  }
}

export function clearNotebookStorage() {
  try {
    localStorage.removeItem(NOTES_KEY);
    localStorage.removeItem(TIMELINE_KEY);
  } catch {
    // O save principal ainda será limpo mesmo se o navegador bloquear o
    // armazenamento auxiliar do caderno.
  }
}

const PEOPLE = [
  {
    id: "P1",
    name: "Clara Mendonça Vasques",
    role: "Vítima · 24 anos · estudante de Jornalismo",
    said: "—",
    data: "Morreu na noite de 8 de março de 2026, no Mirante da Pedra Lascada.",
  },
  {
    id: "P2",
    name: "Regina Aparecida Mendonça",
    role: "Mãe · auxiliar de enfermagem",
    said: "Diz ter falado com a filha por telefone por volta das 21h.",
    data: "O aparelho registra uma mensagem de texto às 20h47 e nenhuma chamada atendida à noite.",
  },
  {
    id: "P3",
    name: "Théo Barcellos Ramalho",
    role: "Namorado · motorista de aplicativo",
    said: "Disse à polícia que ficou em casa no domingo à noite.",
    data: "Não apresentou comprovação ao inquérito. O aparelho não o coloca no local.",
  },
  {
    id: "P4",
    name: "Alice Bittencourt Fontoura",
    role: "Melhor amiga desde os 13 anos · advogada",
    said: "Diz que a última mensagem que recebeu foi às 20h41: “cheguei em casa, tô bem”.",
    data: "Essa mensagem partiu do aparelho de Clara enquanto ele estava parado no mirante.",
  },
  {
    id: "P5",
    name: "Diego Andrade da Silva",
    role: "Irmão de Wesley Andrade da Silva",
    said: "Enviou seis mensagens diretas entre fevereiro e março.",
    data: "Transmitia ao vivo de Barbacena entre 19h20 e 20h05 no dia 8 de março.",
  },
];

export default function NotebookApp({ api }: { api: AppApi }) {
  const [tab, setTab] = useState<Tab>("notas");
  const [notes, setNotes] = useState(loadNotes);

  return (
    <div className="notebook">
      <nav className="notebook__tabs" aria-label="Seções do caderno">
        {(
          [
            ["notas", "Minhas notas", <PencilLine key="n" size={15} />],
            ["pessoas", "Pessoas", <Users key="b" size={15} />],
            ["linha", "Linha do tempo", <Scale key="c" size={15} />],
            ["acusacao", "Acusação", <Gavel key="e" size={15} />],
            ["dicas", "Dicas", <Lightbulb key="f" size={15} />],
          ] as Array<[Tab, string, ReactElement]>
        ).map(([id, label, icon]) => (
          <button key={id} type="button" className={tab === id ? "is-active" : ""} onClick={() => setTab(id)}>
            {icon}
            {label}
          </button>
        ))}
      </nav>

      {tab === "notas" && (
        <section className="manual-notes">
          <div className="manual-notes__intro">
            <h3>Caderno do investigador</h3>
            <p>Anote nomes, horários, senhas e suspeitas do seu jeito.</p>
          </div>
          <textarea
            value={notes}
            onChange={(event) => {
              const next = event.target.value;
              setNotes(next);
              storeNotes(next);
            }}
            placeholder={"Ex.: 19h58 — última leitura cardíaca\nQuem tinha acesso ao carro?\nSenha possível: ..."}
            aria-label="Anotações pessoais sobre o caso"
            spellCheck
          />
          <p className="manual-notes__saved">Salvo automaticamente neste navegador.</p>
        </section>
      )}

      {tab === "pessoas" && (
        <div className="list notebook-page">
          {PEOPLE.map((person) => (
            <Row key={person.id} title={person.name} meta={person.role}>
              <p className="muted">
                <strong>O que disse:</strong> {person.said}
              </p>
              <p className="muted">
                <strong>O que os dados dizem:</strong> {person.data}
              </p>
            </Row>
          ))}
        </div>
      )}

      {tab === "linha" && <TimelinePanel />}

      {tab === "acusacao" && <AccusationPanel api={api} />}

      {tab === "dicas" && <HintPanel api={api} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function TimelinePanel() {
  const [entries, setEntries] = useState(loadTimeline);
  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!time || !title.trim()) return;

    const next = [
      ...entries,
      {
        id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `tl-${Date.now()}`,
        time,
        title: title.trim(),
        description: description.trim(),
      },
    ];

    setEntries(next);
    storeTimeline(next);
    setTime("");
    setTitle("");
    setDescription("");
  }

  function remove(id: string) {
    const next = entries.filter((entry) => entry.id !== id);
    setEntries(next);
    storeTimeline(next);
  }

  return (
    <section className="manual-timeline notebook-page">
      <div className="manual-timeline__intro">
        <h3>Linha do tempo do investigador</h3>
        <p>Organize os acontecimentos com seus próprios horários e conclusões.</p>
      </div>

      <form className="manual-timeline__form" onSubmit={submit}>
        <label>
          <span>Horário</span>
          <input
            type="text"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            placeholder="19h58"
            maxLength={12}
            required
          />
        </label>
        <label>
          <span>Título</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Última leitura cardíaca"
            required
          />
        </label>
        <label className="manual-timeline__description">
          <span>Descrição</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="O que aconteceu e por que isso importa?"
          />
        </label>
        <button type="submit" className="manual-timeline__add">
          <Plus size={16} aria-hidden /> Adicionar à linha do tempo
        </button>
      </form>

      <div className="manual-timeline__entries" aria-live="polite">
        {entries.length === 0 && (
          <p className="manual-timeline__empty">Nenhum acontecimento anotado ainda.</p>
        )}
        {entries.map((entry) => (
          <article key={entry.id} className="manual-timeline__entry">
            <time>{entry.time}</time>
            <div>
              <h4>{entry.title}</h4>
              {entry.description && <p>{entry.description}</p>}
            </div>
            <button type="button" onClick={() => remove(entry.id)} aria-label={`Remover ${entry.title}`}>
              <Trash2 size={15} aria-hidden />
            </button>
          </article>
        ))}
      </div>
      <p className="manual-notes__saved">Salvo automaticamente neste navegador.</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function AccusationPanel({ api }: { api: AppApi }) {
  const pack = api.packs.act4;
  const unlocked = canAccuse(api.state);
  const draft = api.state.accusation;
  const coverage = evidenceCoverage(draft.evidencias);
  const missing = missingBlocks(draft.evidencias);
  const found = CLUES.filter((clue) => api.state.cluesFound.includes(clue.id));
  const lastAttempt = api.state.accusationAttempts[api.state.accusationAttempts.length - 1];
  const feedback = lastAttempt && pack ? pack.FEEDBACK[lastAttempt.feedbackId] : undefined;

  if (!unlocked) {
    return (
      <div className="list notebook-page">
        <Empty>
          O formulário abre quando a investigação chegar ao ato final e a gravação do mirante estiver
          em mãos.
        </Empty>
      </div>
    );
  }

  if (!pack) return <div className="notebook-page"><Empty>Carregando o material final…</Empty></div>;

  return (
    <div className="list accusation notebook-page">
      <section className="panel">
        <h3>Pedido de reabertura — IP 0447/2026</h3>
        <p className="muted">
          Preencha. Isto vai ser lido pela Dra. Yara Trindade antes de qualquer autoridade.
        </p>
      </section>

      {pack.ACCUSATION_FIELDS.map((field) => (
        <fieldset key={field.id} className="panel">
          <legend>{field.legend}</legend>
          {field.options.map((option) => (
            <label key={option.id} className="choice">
              <input
                type="radio"
                name={field.id}
                checked={(draft as Record<string, unknown>)[field.id] === option.id}
                onChange={() => api.setAccusation({ [field.id]: option.id })}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>
      ))}

      <fieldset className="panel">
        <legend>5. Sequência dos acontecimentos</legend>
        <p className="muted">Toque nas cartas na ordem correta.</p>
        <div className="sequence">
          {pack.SEQUENCE_CARDS.map((card) => {
            const index = draft.sequencia.indexOf(card.id);
            return (
              <button
                key={card.id}
                type="button"
                className={index >= 0 ? "is-picked" : ""}
                onClick={() => api.toggleSequence(card.id)}
              >
                {index >= 0 && <span className="sequence__n">{index + 1}</span>}
                {card.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="panel">
        <legend>6. Evidências fundamentais</legend>
        <p className="muted">
          Mínimo de três, cobrindo os três blocos: presença, horário e motivo.
          {missing.length > 0 && ` Ainda falta provar ${missing.join(" e ")}.`}
        </p>
        <p className="muted">Blocos cobertos: {coverage.blocks.join(", ") || "nenhum"}</p>
        <div className="evidence">
          {found.map((clue) => {
            const picked = draft.evidencias.includes(clue.id);
            return (
              <button
                key={clue.id}
                type="button"
                className={picked ? "is-picked" : ""}
                onClick={() => api.toggleEvidence(clue.id)}
              >
                {clue.label}
                {clue.block && <span className="evidence__block">bloco {clue.block}</span>}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="panel">
        <legend>{pack.DESCONHECIDA_FIELD.legend}</legend>
        {pack.DESCONHECIDA_FIELD.options.map((option) => (
          <label key={option.id} className="choice">
            <input
              type="radio"
              name="desconhecida"
              checked={draft.desconhecida === option.id}
              onChange={() => api.setAccusation({ desconhecida: option.id })}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>

      {feedback && lastAttempt?.outcome !== "aceita" && (
        <section className="panel panel--warn" role="alert">
          <h3>{feedback.title}</h3>
          <pre className="feedback">{feedback.body}</pre>
          {feedback.highlight && (
            <p className="muted">
              Reveja no caderno: <strong>{getClue(feedback.highlight)?.label}</strong>
            </p>
          )}
        </section>
      )}

      <button type="button" className="btn btn--primary btn--wide" onClick={api.submitAccusation}>
        <Gavel size={17} aria-hidden />
        Protocolar acusação
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function HintPanel({ api }: { api: AppApi }) {
  const obstacle = suggestObstacle(api.state);
  const hint = hintFor(obstacle);
  const level = hintLevel(api.state, obstacle);

  if (!hint) return <Empty>Nada travado no momento.</Empty>;

  return (
    <div className="list notebook-page">
      <section className="panel">
        <h3>{hint.title}</h3>
        <p className="muted">
          As dicas vêm em três degraus: direção, foco e resposta. Cada degrau precisa de um novo
          pedido. Usar dica não penaliza nada.
        </p>
        {hint.steps.slice(0, level).map((step, index) => (
          <p key={index} className="hint">
            <strong>Degrau {index + 1}:</strong> {step}
          </p>
        ))}
        {level < 3 && (
          <button type="button" className="btn" onClick={() => api.useHint(obstacle)}>
            {level === 0 ? "Pedir uma direção" : level === 1 ? "Pedir mais foco" : "Pedir a resposta"}
          </button>
        )}
      </section>
    </div>
  );
}
