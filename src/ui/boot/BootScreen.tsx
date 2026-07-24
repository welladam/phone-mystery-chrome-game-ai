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

/** Peso real de progresso — nunca número inventado (mesmo espírito do bootstrap). */
function computeProgress(steps: BootStep[]) {
  if (steps.length === 0) return 0;
  const weight = steps.reduce((sum, step) => {
    if (step.state === "ok") return sum + 1;
    if (step.state === "correndo") return sum + (step.progress ?? 0.5);
    return sum;
  }, 0);
  return Math.min(100, Math.round((weight / steps.length) * 100));
}

/** Digita as citações atmosféricas uma a uma; com reducedMotion, mostra a primeira, estática. */
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

function StepPill({ step }: { step: BootStep }) {
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

  return (
    <div className="boot-carregando mc-reveal">
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

      {showAuthorize && (
        <section className="boot-card boot-card--amber">
          <h3>{t("boot.installTitle")}</h3>
          <p>{t("boot.missing", { items: pending.join(", ") })}</p>
          <p className="boot-card__muted">{t("boot.installHelp")}</p>
          <button type="button" className="boot-card__cta" onClick={onAuthorize}>
            <Download size={17} aria-hidden />
            {t("boot.downloadInstall")}
          </button>
        </section>
      )}

      {error && errorInfo && (
        <section className="boot-card boot-card--danger" role="alert">
          <h3>
            <AlertTriangle size={16} aria-hidden />
            {errorInfo.title}
          </h3>
          <p>{errorInfo.cause}</p>
          <p className="boot-card__muted">{errorInfo.action}</p>
          {errorInfo.keepsProgress && (
            <p className="boot-card__reassure">
              <ShieldCheck size={14} aria-hidden />
              {t("boot.progressSafe")}
            </p>
          )}
          <div className="boot-card__actions">
            {errorInfo.retryable && (
              <button type="button" className="boot-card__cta" onClick={onRetry}>
                <RefreshCw size={15} aria-hidden />
                {t("boot.install")}
              </button>
            )}
            <button type="button" className="boot-card__ghost" onClick={() => window.location.reload()}>
              {t("boot.reload")}
            </button>
            <button type="button" className="boot-card__ghost" onClick={() => void exportDiagnostics()}>
              <FileDown size={15} aria-hidden />
              {t("settings.exportDiagnostics")}
            </button>
          </div>
        </section>
      )}

      {showQuote && (
        <p className="boot-carregando__quote">
          “{typed}”<span className="boot-carregando__caret" aria-hidden>
            ▍
          </span>
        </p>
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
