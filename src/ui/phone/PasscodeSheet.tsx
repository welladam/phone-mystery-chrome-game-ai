import { useState, type FormEvent } from "react";
import { Lightbulb, Lock } from "lucide-react";
import { checkLock, getLock } from "../../content/manifest";
import { hintFor } from "../../engine/hints";
import type { GameState, LockId } from "../../engine/types";
import { useEscape, useFocusTrap } from "../a11y/hooks";

type Props = {
  lockId: LockId;
  state: GameState;
  reducedMotion: boolean;
  onSolved: () => void;
  onFail: () => void;
  onClose: () => void;
};

export default function PasscodeSheet({
  lockId,
  state,
  reducedMotion,
  onSolved,
  onFail,
  onClose,
}: Props) {
  const lock = getLock(lockId);
  const [value, setValue] = useState("");
  const [second, setSecond] = useState("");
  const [error, setError] = useState<string>();
  const [showHint, setShowHint] = useState(false);
  const trapRef = useFocusTrap<HTMLDivElement>(true);
  useEscape(true, onClose);

  if (!lock) return null;

  const attempts = state.lockAttempts[lockId] ?? 0;
  const offerHint = attempts >= 6;
  const hint = hintFor(lockId);
  const showPasswordHints = state.difficulty === "normal";

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!lock) return;
    if (checkLock(lock, value, second)) {
      onSolved();
      return;
    }
    onFail();
    setError(
      lock.secondFactorAccepts && value.trim()
        ? "Não abriu. Confira a resposta e também o código de verificação."
        : "Não abriu. Tente de novo — não há limite de tentativas.",
    );
    if (!reducedMotion) {
      setValue("");
    }
  }

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label="Desbloqueio">
      <div className="sheet__panel" ref={trapRef}>
        <header className="sheet__header">
          <Lock size={18} aria-hidden />
          <h3>Conteúdo protegido</h3>
        </header>

        {lock.priorAttempts && <p className="sheet__forensic">{lock.priorAttempts}</p>}

        {showPasswordHints && (
          <p className="sheet__hint">
            Dica definida pela própria titular: <strong>“{lock.hint}”</strong>
          </p>
        )}

        <form onSubmit={submit} className="sheet__form">
          <label>
            <span>{lock.prompt}</span>
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              inputMode={lock.kind === "pin" ? "numeric" : "text"}
              maxLength={lock.length ?? 40}
              autoFocus
              autoComplete="off"
            />
          </label>

          {lock.secondFactorPrompt && (
            <label>
              <span>{lock.secondFactorPrompt}</span>
              <input
                value={second}
                onChange={(event) => setSecond(event.target.value)}
                inputMode="numeric"
                maxLength={8}
                autoComplete="off"
              />
            </label>
          )}

          {error && (
            <p className="sheet__error" role="alert">
              {error}
            </p>
          )}

          <div className="sheet__actions">
            <button type="submit" className="btn btn--primary" disabled={!value.trim()}>
              Destravar
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Agora não
            </button>
          </div>
        </form>

        {showPasswordHints && offerHint && hint && (
          <div className="sheet__assist">
            {!showHint ? (
              <button type="button" className="btn btn--ghost" onClick={() => setShowHint(true)}>
                <Lightbulb size={16} aria-hidden />
                Consultar dica
              </button>
            ) : (
              <p className="sheet__assist-text">{hint.steps[0]}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
