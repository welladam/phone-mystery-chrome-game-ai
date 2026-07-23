import { Accessibility, AlertTriangle, Bug, RotateCcw, Settings, X } from "lucide-react";
import { useState } from "react";
import type { Preferences } from "../../engine/types";
import { useEscape, useFocusTrap } from "../a11y/hooks";

type Props = {
  prefs: Preferences;
  act: number;
  clues: number;
  events: number;
  onChange: (prefs: Preferences) => void;
  onExportDiagnostics: () => void;
  onRestart: () => Promise<void>;
  onClose: () => void;
};

export default function SiteSettingsModal({
  prefs,
  act,
  clues,
  events,
  onChange,
  onExportDiagnostics,
  onRestart,
  onClose,
}: Props) {
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [restartError, setRestartError] = useState(false);
  const trapRef = useFocusTrap<HTMLDivElement>(true);
  useEscape(true, onClose);

  return (
    <div
      className="site-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="site-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="site-settings-title" ref={trapRef}>
        <header className="site-modal__head">
          <span>
            <Settings size={19} aria-hidden />
            <h2 id="site-settings-title">Opções da investigação</h2>
          </span>
          <button type="button" onClick={onClose} aria-label="Fechar opções">
            <X size={18} aria-hidden />
          </button>
        </header>

        <div className="site-modal__content">
          <section className="site-modal__section">
            <h3><Accessibility size={16} aria-hidden /> Acessibilidade</h3>
            <label className="toggle">
              <input
                type="checkbox"
                checked={prefs.reducedMotion}
                onChange={(event) => onChange({ ...prefs, reducedMotion: event.target.checked })}
              />
              Reduzir animações
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={prefs.largeText}
                onChange={(event) => onChange({ ...prefs, largeText: event.target.checked })}
              />
              Usar texto maior
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={prefs.sound}
                onChange={(event) => onChange({ ...prefs, sound: event.target.checked })}
              />
              Efeitos sonoros
            </label>
          </section>

          {import.meta.env.DEV && (
            <section className="site-modal__section site-modal__section--dev">
              <h3><Bug size={16} aria-hidden /> Diagnóstico</h3>
              <p>Ato {act} · {clues} descobertas · {events} eventos</p>
              <button type="button" className="btn btn--ghost" onClick={onExportDiagnostics}>
                Exportar diagnóstico
              </button>
            </section>
          )}

          <section className="site-modal__section site-modal__section--danger">
            <h3><RotateCcw size={16} aria-hidden /> Reiniciar investigação</h3>
            {!confirmRestart ? (
              <>
                <p>Apaga o progresso, as conversas e tudo que foi escrito no caderno.</p>
                <button type="button" className="btn btn--danger" onClick={() => setConfirmRestart(true)}>
                  Reiniciar o jogo do zero
                </button>
              </>
            ) : (
              <div className="restart-confirm" role="alert">
                <p>
                  <AlertTriangle size={16} aria-hidden /> Esta ação não pode ser desfeita. Os modelos
                  locais do Chrome não serão apagados.
                </p>
                {restartError && (
                  <p className="restart-confirm__error">Não foi possível apagar o progresso. Tente novamente.</p>
                )}
                <div className="restart-confirm__actions">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => {
                      setConfirmRestart(false);
                      setRestartError(false);
                    }}
                    disabled={restarting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn--danger"
                    disabled={restarting}
                    onClick={() => {
                      setRestarting(true);
                      setRestartError(false);
                      void onRestart().catch(() => {
                        setRestarting(false);
                        setRestartError(true);
                      });
                    }}
                  >
                    {restarting ? "Apagando…" : "Apagar e reiniciar"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
