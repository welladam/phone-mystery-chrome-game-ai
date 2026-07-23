import { ChevronLeft, NotebookPen, X } from "lucide-react";
import NotebookApp from "../apps/NotebookApp";
import type { AppApi } from "../apps/types";
import { useLocale } from "../../i18n/LocaleContext";

type Props = {
  api: AppApi;
  open: boolean;
  onToggle: () => void;
};

export default function CaseNotebook({ api, open, onToggle }: Props) {
  const { t } = useLocale();
  if (!open) {
    return (
      <button type="button" className="case-notebook-tab" onClick={onToggle}>
        <NotebookPen size={19} aria-hidden />
        <span>{t("notebook.open")}</span>
        <ChevronLeft size={16} aria-hidden />
      </button>
    );
  }

  return (
    <aside className="case-notebook" aria-label={t("notebook.label")}>
      <header className="case-notebook__head">
        <span className="case-notebook__title">
          <NotebookPen size={19} aria-hidden />
          <span>
            <strong>{t("notebook.label")}</strong>
            <small>{t("notebook.savedHere")}</small>
          </span>
        </span>
        <button type="button" onClick={onToggle} aria-label={t("notebook.close")}>
          <X size={18} aria-hidden />
        </button>
      </header>
      <div className="case-notebook__body">
        <NotebookApp api={api} />
      </div>
    </aside>
  );
}
