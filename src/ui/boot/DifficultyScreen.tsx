import { EyeOff, Lightbulb, ShieldCheck } from "lucide-react";
import type { Difficulty } from "../../engine/types";

export default function DifficultyScreen({ onChoose }: { onChoose: (value: Difficulty) => void }) {
  return (
    <main className="difficulty-screen">
      <section className="difficulty-screen__panel" aria-labelledby="difficulty-title">
        <p className="difficulty-screen__eyebrow">Antes de ligar o aparelho</p>
        <h1 id="difficulty-title">Como você quer investigar?</h1>
        <p className="difficulty-screen__intro">
          O modo escolhido fica vinculado a esta investigação. Para trocar depois, será necessário
          reiniciar o caso.
        </p>

        <div className="difficulty-screen__options">
          <button type="button" onClick={() => onChoose("normal")}>
            <span className="difficulty-screen__icon"><Lightbulb size={23} aria-hidden /></span>
            <strong>Normal</strong>
            <span>Deduções, pessoas, dicas e sinais visuais ajudam a organizar as descobertas.</span>
            <em>Recomendado para a primeira investigação</em>
          </button>
          <button type="button" onClick={() => onChoose("hard")}>
            <span className="difficulty-screen__icon difficulty-screen__icon--hard"><EyeOff size={23} aria-hidden /></span>
            <strong>Difícil</strong>
            <span>Sem dicas, deduções automáticas ou destaques. Você terá apenas os dados e suas notas.</span>
            <em><ShieldCheck size={14} aria-hidden /> O progresso continua registrado em silêncio</em>
          </button>
        </div>
      </section>
    </main>
  );
}
