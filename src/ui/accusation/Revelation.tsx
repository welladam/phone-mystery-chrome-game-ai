import { useEffect, useState } from "react";
import type { Act4Pack } from "../../content/registry";

type Props = {
  pack: Act4Pack;
  sentAudioToDiego: boolean;
  reducedMotion: boolean;
  onFinish: () => void;
};

type Movement = 1 | 2 | 3 | 4;

export default function Revelation({ pack, sentAudioToDiego, reducedMotion, onFinish }: Props) {
  const [movement, setMovement] = useState<Movement>(1);
  const [revealed, setRevealed] = useState(reducedMotion ? pack.REVEAL_TIMELINE.length : 0);

  useEffect(() => {
    if (movement !== 1 || reducedMotion) return;
    if (revealed >= pack.REVEAL_TIMELINE.length) return;
    const entry = pack.REVEAL_TIMELINE[revealed];
    const delay = entry?.hold ? 4000 : 900;
    const timer = setTimeout(() => setRevealed((value) => value + 1), delay);
    return () => clearTimeout(timer);
  }, [movement, revealed, reducedMotion, pack.REVEAL_TIMELINE]);

  return (
    <main className="reveal" aria-live="polite">
      {movement === 1 && (
        <section className="reveal__timeline">
          <h1 className="sr-only">Reconstrução</h1>
          <ol>
            {pack.REVEAL_TIMELINE.slice(0, revealed).map((entry, index) => (
              <li key={index} className={entry.emphasis ? "is-emphasis" : ""}>
                <span className="reveal__at">{entry.at}</span>
                <span className="reveal__text">{entry.text}</span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() =>
              revealed >= pack.REVEAL_TIMELINE.length
                ? setMovement(2)
                : setRevealed(pack.REVEAL_TIMELINE.length)
            }
          >
            {revealed >= pack.REVEAL_TIMELINE.length ? "Continuar" : "Mostrar tudo"}
          </button>
        </section>
      )}

      {movement === 2 && (
        <section className="reveal__chat">
          <h2>A conversa</h2>
          <div className="reveal__bubbles">
            {pack.COLLAPSE_LINES.map((line, index) => (
              <div key={index} className="bubble bubble--them">
                <p>{line.text}</p>
                <span className="bubble__at">{line.at}</span>
              </div>
            ))}
          </div>
          <p className="reveal__closing">{pack.COLLAPSE_CLOSING}</p>
          <button type="button" className="btn btn--primary" onClick={() => setMovement(3)}>
            Continuar
          </button>
        </section>
      )}

      {movement === 3 && (
        <section className="reveal__cards">
          <h2>As respostas</h2>
          {pack.REVEAL_CARDS.map((card) => (
            <article key={card.id}>
              <h3>{card.title}</h3>
              {card.body.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </article>
          ))}
          <button type="button" className="btn btn--primary" onClick={() => setMovement(4)}>
            Continuar
          </button>
        </section>
      )}

      {movement === 4 && (
        <section className="reveal__epilogue">
          <p className="reveal__audio">“{pack.REVEAL_EPILOGUE.audioLine}”</p>
          <div className="reveal__closing-block">
            {pack.REVEAL_EPILOGUE.closing.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="reveal__quiet">
            {pack.REVEAL_EPILOGUE.quiet.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          {sentAudioToDiego && (
            <div className="reveal__diego">
              <p className="muted">diego.andrade.silva · 06h48</p>
              {pack.REVEAL_EPILOGUE.diegoVariant.map((line) => (
                <p key={line}>“{line}”</p>
              ))}
            </div>
          )}

          <button type="button" className="btn" onClick={onFinish}>
            Voltar ao aparelho
          </button>
        </section>
      )}
    </main>
  );
}
