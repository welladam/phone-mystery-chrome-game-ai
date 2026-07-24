import { Check, Globe2, Lock } from "lucide-react";
import { useLocale } from "../../i18n/LocaleContext";
import { LOCALE_LIST } from "../../locales/registry";
import type { LocaleId } from "../../locales/types";
import NoirBackdrop from "./NoirBackdrop";

type Props = {
  current: LocaleId;
  onChoose: (locale: LocaleId) => void;
  compact?: boolean;
  reducedMotion?: boolean;
};

export default function LanguageScreen({ current, onChoose, compact = false, reducedMotion = false }: Props) {
  const { t } = useLocale();
  return (
    <div className={`language-screen${compact ? " language-screen--compact" : ""}`}>
      {!compact && <NoirBackdrop reducedMotion={reducedMotion} />}
      <section className="language-card" aria-labelledby="language-title">
        {!compact && (
          <header className="language-card__head">
            <Globe2 size={24} aria-hidden />
            <div>
              <p>{t("language.eyebrow")}</p>
              <h1 id="language-title">{t("language.title")}</h1>
              <span>{t("language.description")}</span>
            </div>
          </header>
        )}

        <div className="language-options">
          {LOCALE_LIST.map((bundle) => {
            const active = bundle.meta.id === current;
            return (
              <button
                type="button"
                key={bundle.meta.id}
                className={active ? "is-active" : ""}
                disabled={!bundle.meta.enabled}
                onClick={() => onChoose(bundle.meta.id)}
              >
                <span>
                  <strong>{bundle.meta.nativeName}</strong>
                  <small>{bundle.meta.id}</small>
                </span>
                {bundle.meta.enabled ? (
                  active ? <Check size={18} aria-hidden /> : <Globe2 size={18} aria-hidden />
                ) : (
                  <span className="language-options__locked">
                    <Lock size={14} aria-hidden />
                    {bundle.meta.unavailableLabel ?? t("language.unavailable")}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {!compact && <p className="language-card__note">{t("language.savedSeparately")}</p>}
      </section>
    </div>
  );
}
