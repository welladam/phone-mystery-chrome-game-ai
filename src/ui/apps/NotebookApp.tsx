import { useState, type ReactElement } from "react";
import { Gavel, Lightbulb, Lock, PencilLine, Sparkles, Users } from "lucide-react";
import { hintFor, hintLevel, suggestObstacle } from "../../engine/hints";
import { canAccuse, deriveContradictions } from "../../engine/rules";
import { knownMemories } from "../../engine/selectors";
import type { AppApi } from "./types";
import { Empty, Row } from "../phone/Bits";

type Tab = "notas" | "deducoes" | "pessoas" | "acusacao" | "dicas";

const NOTES_KEY = "clara.case-notes.v1";
const LEGACY_TIMELINE_KEY = "clara.case-timeline.v1";

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
    // O texto continua disponível durante a sessão se o armazenamento falhar.
  }
}

export function clearNotebookStorage() {
  try {
    localStorage.removeItem(NOTES_KEY);
    localStorage.removeItem(LEGACY_TIMELINE_KEY);
  } catch {
    // O save principal ainda é limpo separadamente.
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
  const hard = api.state.difficulty === "hard";
  const accusationLocked = !canAccuse(api.state);

  const tabs: Array<[Tab, string, ReactElement, boolean, string | undefined]> = [
    ["notas", "Minhas notas", <PencilLine key="n" size={15} />, false, undefined],
    ["deducoes", "Deduções", <Sparkles key="d" size={15} />, hard, "Indisponível no modo Difícil"],
    ["pessoas", "Pessoas", <Users key="p" size={15} />, hard, "Indisponível no modo Difícil"],
    ["acusacao", "Acusação", <Gavel key="a" size={15} />, accusationLocked, "Disponível no Ato 4"],
    ["dicas", "Dicas", <Lightbulb key="h" size={15} />, hard, "Indisponível no modo Difícil"],
  ];

  return (
    <div className="notebook">
      <nav className="notebook__tabs" aria-label="Seções do caderno">
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
            <h3>Caderno do investigador</h3>
            <p>Anote nomes, horários, senhas e suspeitas do seu jeito.</p>
          </div>
          <div className="manual-notes__sheet">
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
          </div>
          <p className="manual-notes__saved">Salvo automaticamente neste navegador.</p>
        </section>
      )}

      {tab === "deducoes" && <DeductionsPanel api={api} />}
      {tab === "pessoas" && <PeoplePanel />}
      {tab === "acusacao" && <AccusationPanel api={api} />}
      {tab === "dicas" && <HintPanel api={api} />}
    </div>
  );
}

function DeductionsPanel({ api }: { api: AppApi }) {
  const memories = knownMemories(api.state);
  const contradictions = deriveContradictions(api.state);
  if (memories.length === 0 && contradictions.length === 0) {
    return <div className="list notebook-page"><Empty>Nenhuma dedução estabelecida até agora.</Empty></div>;
  }
  return (
    <div className="list notebook-page">
      {memories.length > 0 && <section className="panel"><h3>O que já está estabelecido</h3>{memories.map((memory) => <Row key={memory.id} title={memory.label}><p>{memory.text}</p></Row>)}</section>}
      {contradictions.length > 0 && <section className="panel panel--warn"><h3>Versões que não fecham</h3>{contradictions.map((item) => <Row key={item.id} title="Contradição"><p>{item.text}</p></Row>)}</section>}
    </div>
  );
}

function PeoplePanel() {
  return (
    <div className="list notebook-page">
      {PEOPLE.map((person) => <Row key={person.id} title={person.name} meta={person.role}>
        <p className="muted"><strong>O que disse:</strong> {person.said}</p>
        <p className="muted"><strong>O que os dados dizem:</strong> {person.data}</p>
      </Row>)}
    </div>
  );
}

function AccusationPanel({ api }: { api: AppApi }) {
  const draft = api.state.accusation;
  const lastAttempt = api.state.accusationAttempts[api.state.accusationAttempts.length - 1];
  return (
    <div className="list accusation accusation--simple notebook-page">
      <section className="panel">
        <h3>Conclusão da investigação</h3>
        <p className="muted">Antes de apontar um nome, tenha uma resposta própria para cada ponto.</p>
        <ol className="accusation-points">
          <li><strong>Responsável</strong><span>Quem causou a morte de Clara?</span></li>
          <li><strong>Motivo</strong><span>O que essa pessoa precisava impedir ou esconder?</span></li>
          <li><strong>Método</strong><span>Como a morte aconteceu e o aparelho foi manipulado?</span></li>
          <li><strong>Oportunidade</strong><span>Como a pessoa chegou até Clara sem levantar suspeita?</span></li>
        </ol>
      </section>

      <label className="accusation-answer">
        <span>Responsável pela morte de Clara</span>
        <input
          type="text"
          value={draft.responsavel ?? ""}
          onChange={(event) => api.setAccusation({ responsavel: event.target.value })}
          placeholder="Digite o nome"
          autoComplete="off"
        />
      </label>

      {lastAttempt?.outcome === "rejeitada" && (
        <section className="panel panel--warn" role="alert">
          <h3>A conclusão ainda não se sustenta</h3>
          <p>Esse nome não fecha o caso com o que foi encontrado. Revise os registros e tente novamente.</p>
        </section>
      )}

      <button
        type="button"
        className="btn btn--primary btn--wide"
        onClick={api.submitAccusation}
        disabled={!draft.responsavel?.trim()}
      >
        <Gavel size={17} aria-hidden /> Confirmar responsável
      </button>
    </div>
  );
}

function HintPanel({ api }: { api: AppApi }) {
  const obstacle = suggestObstacle(api.state);
  const hint = hintFor(obstacle);
  const level = hintLevel(api.state, obstacle);
  if (!hint) return <Empty>Nada travado no momento.</Empty>;
  return (
    <div className="list notebook-page">
      <section className="panel">
        <h3>{hint.title}</h3>
        <p className="muted">Cada novo pedido aprofunda a orientação.</p>
        {hint.steps.slice(0, level).map((step, index) => <p key={index} className="hint"><strong>Degrau {index + 1}:</strong> {step}</p>)}
        {level < 3 && <button type="button" className="btn" onClick={() => api.useHint(obstacle)}>{level === 0 ? "Pedir uma direção" : level === 1 ? "Pedir mais foco" : "Pedir a resposta"}</button>}
      </section>
    </div>
  );
}
