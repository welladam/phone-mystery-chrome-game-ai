import { Brain, ChevronRight, UnlockKeyhole } from "lucide-react";
import { useFocusTrap } from "../a11y/hooks";

export type NarrativeNotice =
  | {
      id: string;
      kind: "deduction";
      title: string;
      text: string;
    }
  | {
      id: string;
      kind: "act";
      act: number;
      title: string;
      text: string;
      apps: string[];
    };

type Props = {
  notice: NarrativeNotice;
  remaining: number;
  onContinue: () => void;
};

export default function ProgressNotice({ notice, remaining, onContinue }: Props) {
  const trapRef = useFocusTrap<HTMLDivElement>(true);

  return (
    <div className="progress-notice" role="presentation">
      <div
        className={`progress-notice__card progress-notice__card--${notice.kind}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="progress-notice-title"
        aria-describedby="progress-notice-text"
        ref={trapRef}
      >
        <div className="progress-notice__glow" aria-hidden />
        <header className="progress-notice__head">
          <span className="progress-notice__icon" aria-hidden>
            {notice.kind === "deduction" ? <Brain size={24} /> : <UnlockKeyhole size={24} />}
          </span>
          <div>
            <p className="progress-notice__eyebrow">
              {notice.kind === "deduction" ? "Nova dedução" : `Ato ${notice.act} desbloqueado`}
            </p>
            <h2 id="progress-notice-title">{notice.title}</h2>
          </div>
        </header>

        <p className="progress-notice__text" id="progress-notice-text">
          {notice.text}
        </p>

        {notice.kind === "act" && notice.apps.length > 0 && (
          <section className="progress-notice__apps" aria-label="Novos aplicativos disponíveis">
            <span>Novos acessos no aparelho</span>
            <ul>
              {notice.apps.map((app) => <li key={app}>{app}</li>)}
            </ul>
          </section>
        )}

        <footer className="progress-notice__foot">
          <span>{remaining > 0 ? `Mais ${remaining} revelação${remaining > 1 ? "ões" : ""}` : "Progresso salvo"}</span>
          <button type="button" className="btn btn--primary" onClick={onContinue}>
            Continuar <ChevronRight size={17} aria-hidden />
          </button>
        </footer>
      </div>
    </div>
  );
}
