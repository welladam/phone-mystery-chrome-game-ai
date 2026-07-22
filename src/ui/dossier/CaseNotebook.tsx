import { ChevronLeft, NotebookPen, X } from "lucide-react";
import NotebookApp from "../apps/NotebookApp";
import type { AppApi } from "../apps/types";

type Props = {
  api: AppApi;
  open: boolean;
  onToggle: () => void;
};

export default function CaseNotebook({ api, open, onToggle }: Props) {
  if (!open) {
    return (
      <button type="button" className="case-notebook-tab" onClick={onToggle}>
        <NotebookPen size={19} aria-hidden />
        <span>Abrir caderno</span>
        <ChevronLeft size={16} aria-hidden />
      </button>
    );
  }

  return (
    <aside className="case-notebook" aria-label="Caderno do caso">
      <header className="case-notebook__head">
        <span className="case-notebook__title">
          <NotebookPen size={19} aria-hidden />
          <span>
            <strong>Caderno do caso</strong>
            <small>Suas anotações ficam neste navegador</small>
          </span>
        </span>
        <button type="button" onClick={onToggle} aria-label="Fechar caderno">
          <X size={18} aria-hidden />
        </button>
      </header>
      <div className="case-notebook__body">
        <NotebookApp api={api} />
      </div>
    </aside>
  );
}
