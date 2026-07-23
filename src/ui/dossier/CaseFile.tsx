import { useState } from "react";
import { FolderClosed, KeyRound, X } from "lucide-react";
import {
  DOSSIER_ACCESS,
  DOSSIER_HEADER,
  DOSSIER_LETTER,
  DOSSIER_METHOD,
  DOSSIER_SECTIONS,
  DOSSIER_WARNING,
} from "../../content/dossier";
import { useEscape, useFocusTrap } from "../a11y/hooks";

type Props = {
  /** "entrada" mostra a pasta fechada primeiro; "consulta" abre direto. */
  mode: "entrada" | "consulta";
  reducedMotion: boolean;
  onClose: () => void;
};

export default function CaseFile({ mode, reducedMotion, onClose }: Props) {
  const [opened, setOpened] = useState(mode === "consulta");
  const trapRef = useFocusTrap<HTMLDivElement>(true);
  useEscape(mode === "consulta", onClose);

  if (!opened) {
    return (
      <div className="casefile casefile--closed">
        <div className="casefile__stage">
          <button
            type="button"
            className={`case-folder${reducedMotion ? "" : " case-folder--breathe"}`}
            onClick={() => setOpened(true)}
            aria-label="Abrir a pasta reservada do caso"
          >
            <span className="case-folder__tab" />
            <span className="case-folder__front">
              <span className="case-folder__stamp">{DOSSIER_HEADER.stamp}</span>
              <span className="case-folder__ref">{DOSSIER_HEADER.reference}</span>
              <span className="case-folder__office">{DOSSIER_HEADER.office}</span>
              <span className="case-folder__hint">
                <FolderClosed size={15} aria-hidden />
                Toque para abrir
              </span>
            </span>
          </button>
          <p className="casefile__caption">
            Chegou junto com o aparelho. Leia antes de ligar o telefone.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`casefile casefile--${mode}`} role="dialog" aria-modal="true" aria-label="Pasta do caso">
      <article className="dossier" ref={trapRef}>
        <header className="dossier__head">
          <div>
            <p className="dossier__office">{DOSSIER_HEADER.office}</p>
            <h2>{DOSSIER_HEADER.reference}</h2>
            <p className="dossier__meta">
              {DOSSIER_HEADER.recipient} · {DOSSIER_HEADER.handedAt}
            </p>
          </div>
          <span className="dossier__stamp">{DOSSIER_HEADER.stamp}</span>
          {mode === "consulta" && (
            <button type="button" className="dossier__close" onClick={onClose} aria-label="Fechar a pasta">
              <X size={18} aria-hidden />
            </button>
          )}
        </header>

        <div className="dossier__scroll">
          <section className="dossier__letter">
            {DOSSIER_LETTER.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </section>

          {DOSSIER_SECTIONS.map((section) => (
            <section key={section.id} className="dossier__block">
              <h3>{section.title}</h3>
              <dl className="dossier__rows">
                {section.rows.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}

          <section className="dossier__block dossier__block--key">
            <h3>{DOSSIER_ACCESS.title}</h3>
            <p className="dossier__pin">
              <KeyRound size={16} aria-hidden />
              <span>Código da tela</span>
              <strong>{DOSSIER_ACCESS.pin}</strong>
            </p>
            <p>{DOSSIER_ACCESS.note}</p>
          </section>

          <section className="dossier__block">
            <h3>Como conduzir</h3>
            <ul className="dossier__list">
              {DOSSIER_METHOD.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="dossier__warning">{DOSSIER_WARNING}</p>
          </section>

        </div>

        {mode === "entrada" && (
          <footer className="dossier__foot">
            <button type="button" className="btn btn--primary" onClick={onClose}>
              Ligar o aparelho
            </button>
            <span className="dossier__foot-note">
              A pasta continua disponível durante toda a investigação.
            </span>
          </footer>
        )}
      </article>
    </div>
  );
}
