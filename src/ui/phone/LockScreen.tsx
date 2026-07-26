import { useEffect, useState } from "react";
import { Delete, Lock } from "lucide-react";
import { useLocale } from "../../i18n/LocaleContext";
import { getLocaleContent } from "../../locales/contentRegistry";

type Props = {
  onUnlock: () => void;
  reducedMotion: boolean;
};

export default function LockScreen({ onUnlock, reducedMotion }: Props) {
  const { localeId, t } = useLocale();
  const { checkLock, getLock } = getLocaleContent(localeId).manifest;
  const preview = getLocaleContent(localeId).shared.NOTIFICATIONS
    .filter((item) => item.at.startsWith("09/03"))
    .slice(0, 3);
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState<string>();

  const lock = getLock("LOCK_001");

  /**
   * Verification happens inside the functional updater so fast typing or a
   * physical keyboard cannot lose digits by reading stale state.
   */
  function press(digit: string) {
    setMessage(undefined);
    setCode((current) => {
      if (current.length >= 4) return current;
      const next = current + digit;
      if (next.length < 4 || !lock) return next;

      if (checkLock(lock, next)) {
        queueMicrotask(onUnlock);
        return next;
      }

      setShake(true);
      setMessage(t("lock.incorrect"));
      setTimeout(
        () => {
          setShake(false);
          setCode("");
        },
        reducedMotion ? 0 : 420,
      );
      return next;
    });
  }

  // The physical keyboard behaves like the on-screen keypad.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (/^[0-9]$/.test(event.key)) {
        press(event.key);
      } else if (event.key === "Backspace") {
        setCode((current) => current.slice(0, -1));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className="lockscreen">
      <div className="lockscreen__clock">
        <span className="lockscreen__hour">06:32</span>
        <span className="lockscreen__date">{t("lock.date")}</span>
      </div>

      <ul className="lockscreen__notifications">
        {preview.map((item) => (
          <li key={item.id}>
            <span className="lockscreen__from">{item.from}</span>
            <span className="lockscreen__preview">{item.preview}</span>
            <span className="lockscreen__at">{item.at}</span>
          </li>
        ))}
      </ul>

      <div className={`lockscreen__pad${shake && !reducedMotion ? " lockscreen__pad--shake" : ""}`}>
        <p className="lockscreen__hint">
          <Lock size={14} aria-hidden />
          {t("lock.enterFourDigits")}
        </p>
        <div className="lockscreen__dots" aria-label={t("lock.digitsEntered", { count: code.length })}>
          {[0, 1, 2, 3].map((index) => (
            <span key={index} className={index < code.length ? "is-filled" : ""} />
          ))}
        </div>
        <div className="keypad">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button key={digit} type="button" onClick={() => press(digit)}>
              {digit}
            </button>
          ))}
          <span />
          <button type="button" onClick={() => press("0")}>
            0
          </button>
          <button
            type="button"
            onClick={() => setCode((current) => current.slice(0, -1))}
            aria-label={t("lock.deleteDigit")}
          >
            <Delete size={18} aria-hidden />
          </button>
        </div>
        {message && (
          <p className="lockscreen__error" role="alert">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
