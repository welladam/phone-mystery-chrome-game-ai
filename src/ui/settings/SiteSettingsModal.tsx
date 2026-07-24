import { Accessibility, AlertTriangle, Bug, RotateCcw, Settings, X } from "lucide-react";
import { useState } from "react";
import type { Difficulty, Preferences } from "../../engine/types";
import type { LocaleId } from "../../locales/types";
import { useEscape, useFocusTrap } from "../a11y/hooks";
import LanguageScreen from "../boot/LanguageScreen";
import { useLocale } from "../../i18n/LocaleContext";

type Props = {
  prefs: Preferences;
  difficulty: Difficulty;
  act: number;
  clues: number;
  events: number;
  onChange: (prefs: Preferences) => void;
  onExportDiagnostics: () => void;
  onLocaleChange: (locale: LocaleId) => Promise<void>;
  onRestart: () => Promise<void>;
  onClose: () => void;
};

export default function SiteSettingsModal({
  prefs,
  difficulty,
  act,
  clues,
  events,
  onChange,
  onExportDiagnostics,
  onLocaleChange,
  onRestart,
  onClose,
}: Props) {
  const { t } = useLocale();
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
            <h2 id="site-settings-title">{t("settings.title")}</h2>
          </span>
          <button type="button" onClick={onClose} aria-label={t("settings.close")}>
            <X size={18} aria-hidden />
          </button>
        </header>

        <div className="site-modal__content">
          <section className="site-modal__section">
            <h3>{t("settings.language")}</h3>
            <p>{t("settings.languageHelp")}</p>
            <LanguageScreen
              compact
              reducedMotion={prefs.reducedMotion}
              current={prefs.locale}
              onChoose={(locale) => void onLocaleChange(locale)}
            />
          </section>

          <section className="site-modal__section">
            <h3><Accessibility size={16} aria-hidden /> {t("settings.accessibility")}</h3>
            <label className="toggle">
              <input
                type="checkbox"
                checked={prefs.reducedMotion}
                onChange={(event) => onChange({ ...prefs, reducedMotion: event.target.checked })}
              />
              {t("settings.reduceMotion")}
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={prefs.largeText}
                onChange={(event) => onChange({ ...prefs, largeText: event.target.checked })}
              />
              {t("settings.largeText")}
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={prefs.sound}
                onChange={(event) => onChange({ ...prefs, sound: event.target.checked })}
              />
              {t("settings.sound")}
            </label>
          </section>

          <section className="site-modal__section">
            <h3>{t("settings.gameMode")}</h3>
            <p>
              <strong>{difficulty === "hard" ? t("settings.hard") : t("settings.normal")}</strong> · {t("settings.modeRestart")}
            </p>
          </section>

          {import.meta.env.DEV && (
            <section className="site-modal__section site-modal__section--dev">
              <h3><Bug size={16} aria-hidden /> {t("settings.diagnostics")}</h3>
              <p>{t("settings.diagnosticsSummary", { act, clues, events })}</p>
              <button type="button" className="btn btn--ghost" onClick={onExportDiagnostics}>
                {t("settings.exportDiagnostics")}
              </button>
            </section>
          )}

          <section className="site-modal__section site-modal__section--danger">
            <h3><RotateCcw size={16} aria-hidden /> {t("settings.restart")}</h3>
            {!confirmRestart ? (
              <>
                <p>{t("settings.restartDescription")}</p>
                <button type="button" className="btn btn--danger" onClick={() => setConfirmRestart(true)}>
                  {t("settings.restartFromZero")}
                </button>
              </>
            ) : (
              <div className="restart-confirm" role="alert">
                <p>
                  <AlertTriangle size={16} aria-hidden /> {t("settings.restartWarning")}
                </p>
                {restartError && (
                  <p className="restart-confirm__error">{t("settings.restartError")}</p>
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
                    {t("common.cancel")}
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
                    {restarting ? t("settings.deleting") : t("settings.deleteRestart")}
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
