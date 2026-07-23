import { Lock } from "lucide-react";
import { appIsLocked } from "../../engine/selectors";
import type { AppId, GameState } from "../../engine/types";
import { getAppVisual } from "./appVisuals";
import { AppIcon } from "./icons";
import { useLocale } from "../../i18n/LocaleContext";
import { getLocaleContent } from "../../locales/contentRegistry";

type Props = {
  state: GameState;
  badges: Partial<Record<AppId, number>>;
  onOpen: (appId: AppId) => void;
};

export default function HomeScreen({ state, badges, onOpen }: Props) {
  const { localeId, t } = useLocale();
  const apps = getLocaleContent(localeId).manifest.APPS.filter(
    (app) => state.unlockedApps.includes(app.id) && app.id !== "APP_021",
  );

  return (
    <div className="home">
      <div className="home__grid" role="list">
        {apps.map((app) => {
          const locked = appIsLocked(state, app.id);
          const badge = badges[app.id] ?? 0;
          const visual = getAppVisual(app.id, app.tone);
          return (
            <button
              key={app.id}
              type="button"
              role="listitem"
              className={`app-tile app-tile--${app.tone}`}
              onClick={() => onOpen(app.id)}
            >
              <span className="app-tile__icon" style={{ background: visual.gradient }}>
                <span className="app-tile__gloss" aria-hidden />
                <AppIcon name={visual.glyph} />
                {locked && (
                  <span className="app-tile__lock" aria-label={t("app.passwordProtected")}>
                    <Lock size={11} aria-hidden />
                  </span>
                )}
                {badge > 0 && (
                  <span className="app-tile__badge" aria-label={t("app.newItems", { count: badge })}>
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              <span className="app-tile__name">{app.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
