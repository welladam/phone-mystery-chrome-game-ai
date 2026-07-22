import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  contained?: boolean;
  onBack: () => void;
  actions?: ReactNode;
  children: ReactNode;
};

export default function AppShell({ title, subtitle, contained = false, onBack, actions, children }: Props) {
  return (
    <section className="appshell" aria-label={title}>
      <header className="appshell__bar">
        <button type="button" className="appshell__back" onClick={onBack}>
          <ChevronLeft size={20} aria-hidden />
          <span>Voltar</span>
        </button>
        <div className="appshell__title">
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="appshell__actions">{actions}</div>
      </header>
      <div className={`appshell__body${contained ? " appshell__body--contained" : ""}`}>{children}</div>
    </section>
  );
}
