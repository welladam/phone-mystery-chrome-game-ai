import type { CSSProperties, ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import type { AppId } from "../../engine/types";
import { getAppVisual } from "./appVisuals";
import { useLocale } from "../../i18n/LocaleContext";
import { getLocaleContent } from "../../locales/contentRegistry";

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
  const { localeId, t } = useLocale();
  const visual = getAppVisual(appId, getLocaleContent(localeId).manifest.getApp(appId)?.tone ?? "cinza");
  const themeVars = {
    "--app-accent": visual.accent,
    "--app-grad": visual.gradient,
  } as CSSProperties;

  return (
    <section className="appshell" data-app={appId} style={themeVars} aria-label={title}>
      <header className="appshell__bar">
        <button type="button" className="appshell__back" onClick={onBack}>
          <ChevronLeft size={20} aria-hidden />
          <span>{t("app.back")}</span>
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
