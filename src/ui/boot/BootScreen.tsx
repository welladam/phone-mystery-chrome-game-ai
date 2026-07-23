import { AlertTriangle, Download, FileDown, Power, RefreshCw, ShieldCheck } from "lucide-react";
import type { BootStep } from "../../ai/bootstrap";
import type { AiError } from "../../ai/errors";
import { exportDiagnostics } from "../../persistence/diagnostics";
import { useLocale } from "../../i18n/LocaleContext";

export type BootPhase =
  | "desligado"
  | "verificando"
  | "aguardando-autorizacao"
  | "preparando"
  | "restaurando"
  | "erro";

type Props = {
  phase: BootPhase;
  steps: BootStep[];
  error?: AiError;
  pending: string[];
  restored?: string;
  onPowerOn: () => void;
  onAuthorize: () => void;
  onRetry: () => void;
};

function StepRow({ step }: { step: BootStep }) {
  const { t } = useLocale();
  const stateLabel: Record<BootStep["state"], string> = {
    espera: t("boot.state.waiting"),
    correndo: t("boot.state.running"),
    ok: t("boot.state.done"),
    pausado: t("boot.state.paused"),
    erro: t("boot.state.error"),
  };
  const percent = typeof step.progress === "number" ? Math.round(step.progress * 100) : undefined;
  const isDownloadDetail = step.detail?.toLowerCase().startsWith("baixando") ?? false;
  const showBar = step.state === "correndo" && step.id === "download" && (percent !== undefined || isDownloadDetail);

  return (
    <li className={`boot-step boot-step--${step.state}`}>
      <span className="boot-step__dot" aria-hidden />
      <span className="boot-step__body">
        <span className="boot-step__label">{step.label}</span>
        {step.detail && <span className="boot-step__detail">{step.detail}</span>}
        {showBar && (
          <span className="boot-progress" role="group" aria-label={t("boot.downloadProgress")}>
            <span
              className={`boot-progress__track${percent === undefined ? " boot-progress__track--indeterminate" : ""}`}
            >
              <span
                className="boot-progress__fill"
                style={percent === undefined ? undefined : { width: `${percent}%` }}
              />
            </span>
            <span className="boot-progress__value">
              {percent === undefined ? t("boot.calculating") : `${percent}%`}
            </span>
          </span>
        )}
      </span>
      <span className="sr-only">{stateLabel[step.state]}</span>
    </li>
  );
}

export default function BootScreen({
  phase,
  steps,
  error,
  pending,
  restored,
  onPowerOn,
  onAuthorize,
  onRetry,
}: Props) {
  const { locale, t } = useLocale();
  const visibleSteps = steps.filter((step) => step.state !== "espera" || phase !== "desligado");
  const errorInfo = error ? locale.errors?.[error.code] ?? error.info : undefined;

  return (
    <main className="boot" aria-live="polite">
      <div className="boot__panel">
        <header className="boot__header">
          <div className="boot__mark" aria-hidden>
            <Power size={26} />
          </div>
          <div>
            <p className="boot__eyebrow">{t("boot.eyebrow")}</p>
            <h1>{locale.meta.title}</h1>
          </div>
        </header>

        {phase === "desligado" && (
          <section className="boot__intro">
            <p className="boot__lede">
              {t("boot.intro1")}
            </p>
            <p>
              {t("boot.intro2")}
            </p>

            <div className="boot__explainer">
              <h2>{t("boot.simpleTitle")}</h2>
              <ul>
                <li>
                  {t("boot.aiLocal")}
                </li>
                <li>
                  {t("boot.firstDownload")}
                </li>
                <li>
                  {t("boot.translation")}
                </li>
                <li>{t("boot.saved")}</li>
              </ul>
            </div>

            <button className="btn btn--primary" onClick={onPowerOn} type="button">
              <Power size={18} aria-hidden />
              {t("boot.powerOn")}
            </button>

            <details className="boot__requirements">
              <summary>{t("boot.requirements")}</summary>
              <ul>
                <li>{t("boot.reqChrome")}</li>
                <li>{t("boot.reqOs")}</li>
                <li>{t("boot.reqDisk")}</li>
                <li>{t("boot.reqHardware")}</li>
                <li>{t("boot.reqNetwork")}</li>
                <li>{t("boot.reqSecure")}</li>
              </ul>
            </details>
          </section>
        )}

        {phase !== "desligado" && (
          <ol className="boot__steps">
            {visibleSteps.map((step) => (
              <StepRow key={step.id} step={step} />
            ))}
          </ol>
        )}

        {phase === "aguardando-autorizacao" && !error && (
          <section className="boot__authorize">
            <h2>{t("boot.installTitle")}</h2>
            <p>
              {t("boot.missing", { items: pending.join(", ") })}
            </p>
            <p className="boot__muted">
              {t("boot.installHelp")}
            </p>
            <button className="btn btn--primary" onClick={onAuthorize} type="button">
              <Download size={18} aria-hidden />
              {t("boot.downloadInstall")}
            </button>
          </section>
        )}

        {error && errorInfo && (
          <section className="boot__error" role="alert">
            <h2>
              <AlertTriangle size={18} aria-hidden />
              {errorInfo.title}
            </h2>
            <p>{errorInfo.cause}</p>
            <p className="boot__action">{errorInfo.action}</p>
            {errorInfo.keepsProgress && (
              <p className="boot__reassure">
                <ShieldCheck size={15} aria-hidden />
                {t("boot.progressSafe")}
              </p>
            )}
            <div className="boot__error-actions">
              {errorInfo.retryable && (
                <button className="btn btn--primary" onClick={onRetry} type="button">
                  <RefreshCw size={17} aria-hidden />
                  {t("boot.install")}
                </button>
              )}
              <button className="btn" onClick={() => window.location.reload()} type="button">
                {t("boot.reload")}
              </button>
              <button className="btn btn--ghost" onClick={() => void exportDiagnostics()} type="button">
                <FileDown size={17} aria-hidden />
                {t("settings.exportDiagnostics")}
              </button>
            </div>
          </section>
        )}

        {restored && phase === "restaurando" && <p className="boot__restored">{restored}</p>}
      </div>
    </main>
  );
}
