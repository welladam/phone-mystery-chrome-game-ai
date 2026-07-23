import { EyeOff, Lightbulb, ShieldCheck } from "lucide-react";
import type { Difficulty } from "../../engine/types";
import { useLocale } from "../../i18n/LocaleContext";

export default function DifficultyScreen({ onChoose }: { onChoose: (value: Difficulty) => void }) {
  const { t } = useLocale();
  return (
    <main className="difficulty-screen">
      <section className="difficulty-screen__panel" aria-labelledby="difficulty-title">
        <p className="difficulty-screen__eyebrow">{t("difficulty.eyebrow")}</p>
        <h1 id="difficulty-title">{t("difficulty.title")}</h1>
        <p className="difficulty-screen__intro">
          {t("difficulty.intro")}
        </p>

        <div className="difficulty-screen__options">
          <button type="button" onClick={() => onChoose("normal")}>
            <span className="difficulty-screen__icon"><Lightbulb size={23} aria-hidden /></span>
            <strong>{t("settings.normal")}</strong>
            <span>{t("difficulty.normalDescription")}</span>
            <em>{t("difficulty.normalNote")}</em>
          </button>
          <button type="button" onClick={() => onChoose("hard")}>
            <span className="difficulty-screen__icon difficulty-screen__icon--hard"><EyeOff size={23} aria-hidden /></span>
            <strong>{t("settings.hard")}</strong>
            <span>{t("difficulty.hardDescription")}</span>
            <em><ShieldCheck size={14} aria-hidden /> {t("difficulty.hardNote")}</em>
          </button>
        </div>
      </section>
    </main>
  );
}
