import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Download,
  FileDown,
  Pause,
  Power,
  RefreshCw,
  ShieldCheck,
  Volume2,
  X,
} from "lucide-react";
import type { BootStep } from "../../ai/bootstrap";
import type { AiError, AiErrorInfo } from "../../ai/errors";
import { POSTER_SRC } from "../../content/assets";
import { exportDiagnostics } from "../../persistence/diagnostics";
import { useLocale } from "../../i18n/LocaleContext";
import { useFocusTrap } from "../a11y/hooks";
import NoirBackdrop from "./NoirBackdrop";

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
  reducedMotion: boolean;
  onPowerOn: () => void;
  onAuthorize: () => void;
  onRetry: () => void;
};

/** Real progress weight—never an invented number, matching the startup logic. */
function computeProgress(steps: BootStep[]) {
  if (steps.length === 0) return 0;
  const weight = steps.reduce((sum, step) => {
    if (step.state === "ok") return sum + 1;
    if (step.state === "correndo") return sum + (step.progress ?? 0.5);
    return sum;
  }, 0);
  return Math.min(100, Math.round((weight / steps.length) * 100));
}

/** Types atmospheric quotes one by one; reducedMotion shows the first one statically. */
function useTypedQuote(quotes: string[], reducedMotion: boolean) {
  const [text, setText] = useState(quotes[0] ?? "");

  useEffect(() => {
    if (reducedMotion || quotes.length === 0) {
      setText(quotes[0] ?? "");
      return;
    }
    let quoteIndex = 0;
    let charIndex = 0;
    let holding = false;
    setText("");
    const timer = setInterval(() => {
      if (holding) return;
      const quote = quotes[quoteIndex];
      if (charIndex < quote.length) {
        charIndex += 1;
        setText(quote.slice(0, charIndex));
        return;
      }
      holding = true;
      setTimeout(() => {
        quoteIndex = (quoteIndex + 1) % quotes.length;
        charIndex = 0;
        holding = false;
        setText("");
      }, 1500);
    }, 45);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return text;
}

function formatBytes(value: number, language: string) {
  const units = ["B", "KB", "MB", "GB"];
  let amount = Math.max(0, value);
  let unit = 0;
  while (amount >= 1000 && unit < units.length - 1) {
    amount /= 1000;
    unit += 1;
  }
  return `${new Intl.NumberFormat(language, {
    maximumFractionDigits: unit === 0 ? 0 : amount >= 100 ? 0 : 1,
  }).format(amount)} ${units[unit]}`;
}

function formatDuration(seconds: number, language: string) {
  const rounded = Math.max(1, Math.round(seconds));
  if (rounded < 60) return new Intl.NumberFormat(language).format(rounded);
  const minutes = Math.ceil(rounded / 60);
  return new Intl.NumberFormat(language).format(minutes);
}

function StepPill({ step }: { step: BootStep }) {
  const { t, locale } = useLocale();
  const stateLabel: Record<BootStep["state"], string> = {
    espera: t("boot.state.waiting"),
    correndo: t("boot.state.running"),
    ok: t("boot.state.done"),
    pausado: t("boot.state.paused"),
    erro: t("boot.state.error"),
  };
  const percent = typeof step.progress === "number" ? Math.round(step.progress * 100) : undefined;
  const showBar = step.state === "correndo" && step.id === "download";
  const metrics = step.download;
  const metricParts: string[] = [];
  if (metrics?.loadedBytes !== undefined && metrics.totalBytes !== undefined) {
    metricParts.push(t("boot.download.bytes", {
      loaded: formatBytes(metrics.loadedBytes, locale.meta.htmlLang),
      total: formatBytes(metrics.totalBytes, locale.meta.htmlLang),
    }));
  }
  if (metrics?.bytesPerSecond !== undefined) {
    metricParts.push(t("boot.download.byteSpeed", {
      speed: formatBytes(metrics.bytesPerSecond, locale.meta.htmlLang),
    }));
  } else if (metrics?.progressPerSecond !== undefined && metrics.progressPerSecond > 0) {
    metricParts.push(t("boot.download.percentSpeed", {
      speed: new Intl.NumberFormat(locale.meta.htmlLang, { maximumFractionDigits: 1 })
        .format(metrics.progressPerSecond * 100),
    }));
  }
  if (metrics?.etaSeconds !== undefined && Number.isFinite(metrics.etaSeconds)) {
    const isMinutes = metrics.etaSeconds >= 60;
    metricParts.push(t(isMinutes ? "boot.download.etaMinutes" : "boot.download.etaSeconds", {
      time: formatDuration(metrics.etaSeconds, locale.meta.htmlLang),
    }));
  }

  return (
    <li className={`boot-steps__item boot-steps__item--${step.state}`}>
      <span className="boot-steps__icon" aria-hidden>
        {step.state === "ok" && <Check size={13} />}
        {step.state === "correndo" && <span className="boot-steps__spinner" />}
        {step.state === "pausado" && <Pause size={12} />}
        {step.state === "erro" && <X size={13} />}
        {step.state === "espera" && <span className="boot-steps__dot" />}
      </span>
      <span className="boot-steps__body">
        <span className="boot-steps__label">{step.label}</span>
        {step.detail && <span className="boot-steps__detail">{step.detail}</span>}
        {showBar && (
          <span className="boot-progress" role="group" aria-label={t("boot.downloadProgress")}>
            <span className="boot-progress__row">
              <span
                className={`boot-progress__track${percent === undefined ? " boot-progress__track--indeterminate" : ""}`}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
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
            {metricParts.length > 0 && (
              <span className="boot-progress__metrics">{metricParts.join(" · ")}</span>
            )}
            {metrics && metrics.totalBytes === undefined && (
              <span className="boot-progress__limitation">{t("boot.download.bytesUnavailable")}</span>
            )}
          </span>
        )}
      </span>
      <span className="sr-only">{stateLabel[step.state]}</span>
    </li>
  );
}

type BootActionModalProps = {
  kind: "install" | "error";
  pending: string[];
  error?: AiError;
  errorInfo?: Pick<AiErrorInfo, "title" | "cause" | "action" | "retryable" | "keepsProgress">;
  onAuthorize: () => void;
  onRetry: () => void;
};

function BootActionModal({
  kind,
  pending,
  error,
  errorInfo,
  onAuthorize,
  onRetry,
}: BootActionModalProps) {
  const { t } = useLocale();
  const dialogRef = useFocusTrap<HTMLDivElement>(true);
  const [busy, setBusy] = useState(false);
  const isError = kind === "error";
  const needsDownloadConsent =
    error?.code === "ACTIVATION_REQUIRED" || error?.code === "DOWNLOAD_NOT_AUTHORIZED";
  const titleId = `boot-action-title-${kind}`;
  const descriptionId = `boot-action-description-${kind}`;
  const pendingKey = pending.join("|");

  useEffect(() => {
    setBusy(false);
  }, [kind, error?.code, pendingKey]);

  return (
    <div className={`boot-action-modal boot-action-modal--${kind}`} role="presentation">
      <div
        ref={dialogRef}
        className="boot-action-modal__dialog"
        role={isError ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className="boot-action-modal__icon" aria-hidden>
          {isError ? <AlertTriangle size={25} /> : <Download size={25} />}
        </div>

        <p className="boot-action-modal__eyebrow">
          {isError ? t("boot.attentionRequired") : t("boot.actionRequired")}
        </p>

        {!isError && (
          <>
            <h3 id={titleId}>{t("boot.installTitle")}</h3>
            <div id={descriptionId} className="boot-action-modal__copy">
              <p className="boot-action-modal__lead">{t("boot.missing", { items: pending.join(", ") })}</p>
              <p>{t("boot.installHelp")}</p>
            </div>
            <p className="boot-action-modal__notice">
              <ShieldCheck size={15} aria-hidden />
              {t("boot.phoneWaitsForInstall")}
            </p>
            <button
              type="button"
              className="boot-action-modal__primary"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                onAuthorize();
              }}
            >
              {busy ? <RefreshCw className="boot-action-modal__spinning" size={18} aria-hidden /> : <Download size={18} aria-hidden />}
              {busy ? t("boot.acceptingDownload") : t("boot.acceptDownload")}
            </button>
          </>
        )}

        {isError && errorInfo && (
          <>
            <h3 id={titleId}>{errorInfo.title}</h3>
            <div id={descriptionId} className="boot-action-modal__copy">
              <p className="boot-action-modal__lead">{errorInfo.cause}</p>
              <p>{errorInfo.action}</p>
            </div>
            {errorInfo.keepsProgress && (
              <p className="boot-action-modal__notice">
                <ShieldCheck size={15} aria-hidden />
                {t("boot.progressSafe")}
              </p>
            )}
            <div className="boot-action-modal__actions">
              {errorInfo.retryable && (
                <button
                  type="button"
                  className="boot-action-modal__primary"
                  disabled={busy}
                  onClick={() => {
                    setBusy(true);
                    onRetry();
                  }}
                >
                  {needsDownloadConsent && !busy ? (
                    <ShieldCheck size={18} aria-hidden />
                  ) : (
                    <RefreshCw
                      className={busy ? "boot-action-modal__spinning" : undefined}
                      size={18}
                      aria-hidden
                    />
                  )}
                  {busy
                    ? needsDownloadConsent
                      ? t("boot.acceptingDownload")
                      : t("boot.retrying")
                    : needsDownloadConsent
                      ? t("boot.acceptContinue")
                      : t("boot.tryAgain")}
                </button>
              )}
              <button
                type="button"
                className="boot-action-modal__secondary"
                disabled={busy}
                onClick={() => window.location.reload()}
              >
                {t("boot.reload")}
              </button>
              <button
                type="button"
                className="boot-action-modal__secondary"
                disabled={busy}
                onClick={() => void exportDiagnostics()}
              >
                <FileDown size={16} aria-hidden />
                {t("settings.exportDiagnostics")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PosterCard({ reducedMotion }: { reducedMotion: boolean }) {
  const { t } = useLocale();
  const tiltRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const tilt = tiltRef.current;
    if (!tilt) return;

    function handleMove(event: PointerEvent) {
      const rect = tilt!.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      tilt!.style.transform = `rotateY(${px * 6}deg) rotateX(${-py * 6}deg)`;
      if (glowRef.current) {
        glowRef.current.style.backgroundPosition = `${(px + 0.5) * 100}% ${(py + 0.5) * 100}%`;
      }
    }
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [reducedMotion]);

  return (
    <div className="boot-entrada__poster">
      <div className="boot-entrada__poster-tilt" ref={tiltRef}>
        <div className="boot-entrada__poster-frame" />
        <span className="boot-entrada__bracket boot-entrada__bracket--tl" />
        <span className="boot-entrada__bracket boot-entrada__bracket--tr" />
        <span className="boot-entrada__bracket boot-entrada__bracket--bl" />
        <span className="boot-entrada__bracket boot-entrada__bracket--br" />
        <div className="boot-entrada__poster-shot">
          <img src={POSTER_SRC} alt="O Mistério de Clara" draggable={false} />
          <div className="boot-entrada__poster-glow" ref={glowRef} />
          <div className="boot-entrada__poster-shade" />
        </div>
        <div className="boot-entrada__evidence-tag">
          <span className="boot-entrada__evidence-dot" aria-hidden />
          {t("boot.evidenceTag")}
        </div>
      </div>
      <p className="boot-entrada__caption">
        <span className="boot-entrada__caption-label">&gt; {t("boot.evidenceItem")}:</span> {t("boot.evidenceItemValue")}
        <br />
        <span className="boot-entrada__caption-label">&gt; {t("boot.evidenceReturned")}:</span> {t("boot.evidenceReturnedValue")}
        <br />
        <span className="boot-entrada__caption-label">&gt; {t("boot.evidenceStatus")}:</span>{" "}
        <span className="boot-entrada__caption-status">{t("boot.evidenceArchived")}</span>
      </p>
    </div>
  );
}

function EntradaView({ onPowerOn, reducedMotion }: { onPowerOn: () => void; reducedMotion: boolean }) {
  const { t, locale } = useLocale();

  return (
    <div className="boot-entrada mc-reveal">
      <PosterCard reducedMotion={reducedMotion} />

      <div className="boot-entrada__dossier">
        <p className="boot-entrada__eyebrow">
          <span className="boot-entrada__eyebrow-rule" aria-hidden />
          {t("boot.eyebrow")}
        </p>
        <h1 className="boot-entrada__title">
          {t("boot.title1")}
          <br />
          <span className="boot-entrada__title-accent">{t("boot.title2")}</span>
        </h1>
        <p className="boot-entrada__tagline">“{t("boot.tagline")}”</p>

        <section className="boot-entrada__section boot-entrada__section--case">
          <p className="boot-entrada__section-head">01 — {t("boot.caseHead")}</p>
          <p className="boot-entrada__section-body">{t("boot.caseBody")}</p>
        </section>

        <section className="boot-entrada__section boot-entrada__section--how">
          <p className="boot-entrada__section-head">02 — {t("boot.howHead")}</p>
          <div className="boot-entrada__checklist">
            {locale.bootHowItems.map((item) => (
              <div key={item} className="boot-entrada__checklist-row">
                <span className="boot-entrada__check" aria-hidden>
                  ✓
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <button type="button" className="boot-entrada__cta" onClick={onPowerOn}>
          <span className="boot-entrada__cta-sheen" aria-hidden />
          <span className="boot-entrada__cta-label">
            <Power size={18} aria-hidden />
            {t("boot.powerOn")}
            <span aria-hidden>→</span>
          </span>
        </button>

        <p className="boot-entrada__audio-hint">
          <Volume2 size={13} aria-hidden />
          {t("boot.audioHint")}
        </p>
        <p className="boot-entrada__footnote">{t("boot.footnote")}</p>

        <details className="boot-entrada__requirements">
          <summary>{t("boot.requirements")}</summary>
          <ul>
            <li>{t("boot.reqChrome")}</li>
            <li>{t("boot.reqOs")}</li>
            <li>{t("boot.reqDisk")}</li>
            <li>{t("boot.reqHardware")}</li>
            <li>{t("boot.reqNetwork")}</li>
            <li>{t("boot.reqSecure")}</li>
          </ul>
          <section className="boot-entrada__uninstall" aria-labelledby="boot-uninstall-title">
            <h3 id="boot-uninstall-title">{t("boot.uninstallTitle")}</h3>
            <ol>
              <li>{t("boot.uninstallStep1")}</li>
              <li>{t("boot.uninstallStep2")}</li>
            </ol>
            <p>{t("boot.uninstallEffect")}</p>
          </section>
        </details>
      </div>
    </div>
  );
}

type CarregandoProps = {
  phase: BootPhase;
  steps: BootStep[];
  error?: AiError;
  errorInfo?: Pick<AiErrorInfo, "title" | "cause" | "action" | "retryable" | "keepsProgress">;
  pending: string[];
  reducedMotion: boolean;
  onAuthorize: () => void;
  onRetry: () => void;
};

function CarregandoView({
  phase,
  steps,
  error,
  errorInfo,
  pending,
  reducedMotion,
  onAuthorize,
  onRetry,
}: CarregandoProps) {
  const { t, locale } = useLocale();
  const percent = computeProgress(steps);
  const typed = useTypedQuote(locale.bootAtmosphere, reducedMotion);
  const showAuthorize = phase === "aguardando-autorizacao" && !error;
  const showQuote = !error && !showAuthorize;
  const actionKind = showAuthorize ? "install" : error && errorInfo ? "error" : undefined;

  return (
    <div className={`boot-carregando mc-reveal${actionKind ? " boot-carregando--blocked" : ""}`}>
      <div
        className="boot-carregando__background"
        aria-hidden={actionKind ? true : undefined}
      >
        <div className="boot-carregando__seal" role="img" aria-label={`${percent}%`}>
          <span className="boot-carregando__seal-ring boot-carregando__seal-ring--outer" />
          <span className="boot-carregando__seal-ring boot-carregando__seal-ring--inner" />
          <span className="boot-carregando__seal-percent">
            {percent}
            <small>%</small>
          </span>
        </div>

        <div className="boot-carregando__head">
          <p className="boot-carregando__eyebrow">{t("boot.loadingEyebrow")}</p>
          <h2 className="boot-carregando__title">{t("boot.loadingTitle")}</h2>
        </div>

        <div className="boot-carregando__bar">
          <div className="boot-carregando__bar-fill" style={{ width: `${percent}%` }} />
        </div>

        <ul className="boot-carregando__steps">
          {steps.map((step) => (
            <StepPill key={step.id} step={step} />
          ))}
        </ul>

        {showQuote && (
          <p className="boot-carregando__quote">
            “{typed}”<span className="boot-carregando__caret" aria-hidden>
              ▍
            </span>
          </p>
        )}
      </div>

      {actionKind && (
        <BootActionModal
          key={`${actionKind}-${error?.code ?? pending.join("|")}`}
          kind={actionKind}
          pending={pending}
          error={error}
          errorInfo={errorInfo}
          onAuthorize={onAuthorize}
          onRetry={onRetry}
        />
      )}
    </div>
  );
}

function ProntoView({ restored }: { restored?: string }) {
  const { t } = useLocale();
  return (
    <div className="boot-pronto mc-reveal">
      <div className="boot-pronto__phone">
        <span className="boot-pronto__phone-notch" aria-hidden />
        <span className="boot-pronto__phone-dot" aria-hidden />
        <span className="boot-pronto__phone-tag">{t("boot.readyPhoneTag")}</span>
        <span className="boot-pronto__phone-clock">06:32</span>
      </div>
      <div>
        <p className="boot-pronto__eyebrow">{t("boot.readyEyebrow")}</p>
        <h2 className="boot-pronto__title">{t("boot.readyTitle")}</h2>
        <p className="boot-pronto__body">{t("boot.readyBody")}</p>
        {restored && <p className="boot-pronto__restored">{restored}</p>}
      </div>
    </div>
  );
}

export default function BootScreen({
  phase,
  steps,
  error,
  pending,
  restored,
  reducedMotion,
  onPowerOn,
  onAuthorize,
  onRetry,
}: Props) {
  const { locale } = useLocale();
  const errorInfo = error ? locale.errors?.[error.code] ?? error.info : undefined;

  return (
    <main className="boot-scene" aria-live="polite">
      <NoirBackdrop reducedMotion={reducedMotion} />

      {phase === "desligado" && <EntradaView onPowerOn={onPowerOn} reducedMotion={reducedMotion} />}

      {phase !== "desligado" && phase !== "restaurando" && (
        <CarregandoView
          phase={phase}
          steps={steps}
          error={error}
          errorInfo={errorInfo}
          pending={pending}
          reducedMotion={reducedMotion}
          onAuthorize={onAuthorize}
          onRetry={onRetry}
        />
      )}

      {phase === "restaurando" && <ProntoView restored={restored} />}
    </main>
  );
}
