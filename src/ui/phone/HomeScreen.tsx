import { Lock } from "lucide-react";
import { APPS } from "../../content/manifest";
import { appIsLocked } from "../../engine/selectors";
import type { AppId, GameState } from "../../engine/types";
import { AppIcon } from "./icons";

type Props = {
  state: GameState;
  badges: Partial<Record<AppId, number>>;
  onOpen: (appId: AppId) => void;
};

export default function HomeScreen({ state, badges, onOpen }: Props) {
  const apps = APPS.filter((app) => state.unlockedApps.includes(app.id) && app.id !== "APP_021");

  return (
    <div className="home">
      <div className="home__grid" role="list">
        {apps.map((app) => {
          const locked = appIsLocked(state, app.id);
          const badge = badges[app.id] ?? 0;
          return (
            <button
              key={app.id}
              type="button"
              role="listitem"
              className={`app-tile app-tile--${app.tone}`}
              onClick={() => onOpen(app.id)}
            >
              <span className="app-tile__icon">
                <AppIcon name={app.icon} />
                {locked && (
                  <span className="app-tile__lock" aria-label="protegido por senha">
                    <Lock size={11} aria-hidden />
                  </span>
                )}
                {badge > 0 && (
                  <span className="app-tile__badge" aria-label={`${badge} itens novos`}>
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
