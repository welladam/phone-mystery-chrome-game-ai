import { AlertTriangle, Download, FileDown, Power, RefreshCw, ShieldCheck } from "lucide-react";
import type { BootStep } from "../../ai/bootstrap";
import type { AiError } from "../../ai/errors";
import { exportDiagnostics } from "../../persistence/diagnostics";

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

const STATE_LABEL: Record<BootStep["state"], string> = {
  espera: "aguardando",
  correndo: "em andamento",
  ok: "concluído",
  pausado: "aguardando você",
  erro: "com problema",
};

function StepRow({ step }: { step: BootStep }) {
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
          <span className="boot-progress" role="group" aria-label="Progresso do download">
            <span
              className={`boot-progress__track${percent === undefined ? " boot-progress__track--indeterminate" : ""}`}
            >
              <span
                className="boot-progress__fill"
                style={percent === undefined ? undefined : { width: `${percent}%` }}
              />
            </span>
            <span className="boot-progress__value">
              {percent === undefined ? "calculando…" : `${percent}%`}
            </span>
          </span>
        )}
      </span>
      <span className="sr-only">{STATE_LABEL[step.state]}</span>
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
  const visibleSteps = steps.filter((step) => step.state !== "espera" || phase !== "desligado");

  return (
    <main className="boot" aria-live="polite">
      <div className="boot__panel">
        <header className="boot__header">
          <div className="boot__mark" aria-hidden>
            <Power size={26} />
          </div>
          <div>
            <p className="boot__eyebrow">Perícia digital independente · IP 0447/2026</p>
            <h1>O que Clara guardou</h1>
          </div>
        </header>

        {phase === "desligado" && (
          <section className="boot__intro">
            <p className="boot__lede">
              Este é o celular de Clara Mendonça Vasques, 24 anos, morta em 8 de março de 2026. A
              polícia arquivou o caso em cinco semanas. A mãe dela não aceitou e contratou você.
            </p>
            <p>
              Você vai abrir os aplicativos, descobrir senhas, comparar horários e conversar — pelo
              número dela — com as três pessoas mais próximas. No fim, vai precisar escrever a
              acusação e provar cada parte dela.
            </p>

            <div className="boot__explainer">
              <h2>Antes de ligar, em linguagem simples</h2>
              <ul>
                <li>
                  As conversas usam uma inteligência artificial que roda <strong>dentro do seu
                  navegador</strong>. Nada do que você escrever sai deste computador.
                </li>
                <li>
                  Na primeira vez, o Chrome precisa baixar esse componente. É um download grande e
                  acontece uma vez só — e só depois que você autorizar.
                </li>
                <li>
                  Você escreve em português. A tradução acontece no próprio aparelho e você nunca a
                  vê.
                </li>
                <li>Seu progresso fica salvo aqui no navegador. Pode fechar e voltar depois.</li>
              </ul>
            </div>

            <button className="btn btn--primary" onClick={onPowerOn} type="button">
              <Power size={18} aria-hidden />
              Ligar e inicializar
            </button>

            <details className="boot__requirements">
              <summary>Requisitos técnicos</summary>
              <ul>
                <li>Chrome de computador atualizado (versão 138 ou mais recente).</li>
                <li>Windows 10/11, macOS 13+, Linux ou Chromebook Plus. Celulares não são suportados.</li>
                <li>Cerca de 22 GB livres no disco do perfil do Chrome.</li>
                <li>Placa de vídeo com mais de 4 GB, ou 16 GB de memória e 4 núcleos.</li>
                <li>Conexão sem limite de dados apenas para o primeiro download.</li>
                <li>Endereço localhost ou HTTPS — os componentes exigem contexto seguro.</li>
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
            <h2>O Chrome precisa instalar alguns componentes</h2>
            <p>
              Falta instalar: <strong>{pending.join(", ")}</strong>.
            </p>
            <p className="boot__muted">
              O download é feito pelo próprio navegador, uma única vez. O modelo de conversa é o
              componente maior e pode ocupar vários gigabytes. Mantenha esta aba aberta e use uma
              conexão sem limite de dados. Se o download for interrompido, você pode recomeçar sem
              perder nada.
            </p>
            <button className="btn btn--primary" onClick={onAuthorize} type="button">
              <Download size={18} aria-hidden />
              Baixar e instalar
            </button>
          </section>
        )}

        {error && (
          <section className="boot__error" role="alert">
            <h2>
              <AlertTriangle size={18} aria-hidden />
              {error.info.title}
            </h2>
            <p>{error.info.cause}</p>
            <p className="boot__action">{error.info.action}</p>
            {error.info.keepsProgress && (
              <p className="boot__reassure">
                <ShieldCheck size={15} aria-hidden />
                Sua investigação continua salva.
              </p>
            )}
            <div className="boot__error-actions">
              {error.info.retryable && (
                <button className="btn btn--primary" onClick={onRetry} type="button">
                  <RefreshCw size={17} aria-hidden />
                  Tentar novamente
                </button>
              )}
              <button className="btn" onClick={() => window.location.reload()} type="button">
                Recarregar a página
              </button>
              <button className="btn btn--ghost" onClick={() => void exportDiagnostics()} type="button">
                <FileDown size={17} aria-hidden />
                Exportar diagnóstico
              </button>
            </div>
          </section>
        )}

        {restored && phase === "restaurando" && <p className="boot__restored">{restored}</p>}
      </div>
    </main>
  );
}
