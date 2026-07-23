import type { CSSProperties, ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { getApp } from "../../content/manifest";
import type { AppId } from "../../engine/types";
import { getAppVisual } from "./appVisuals";

type Props = {
  appId: AppId;
  title: string;
  subtitle?: string;
  contained?: boolean;
  onBack: () => void;
  actions?: ReactNode;
  children: ReactNode;
};

export default function AppShell({ appId, title, subtitle, contained = false, onBack, actions, children }: Props) {
  const visual = getAppVisual(appId, getApp(appId)?.tone ?? "cinza");
  const themeVars = {
    "--app-accent": visual.accent,
    "--app-grad": visual.gradient,
  } as CSSProperties;

  return (
    <section className="appshell" data-app={appId} style={themeVars} aria-label={title}>
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
