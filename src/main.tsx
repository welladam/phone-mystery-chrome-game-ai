import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LocaleProvider } from "./i18n/LocaleContext";
import { loadPrefs, savePrefs } from "./persistence/prefs";
import LanguageScreen from "./ui/boot/LanguageScreen";
import "./styles.css";

function Root() {
  const [prefs, setPrefs] = useState(loadPrefs);

  return (
    <LocaleProvider localeId={prefs.locale}>
      {prefs.localeChosen ? (
        <App />
      ) : (
        <LanguageScreen
          current={prefs.locale}
          onChoose={(locale) => {
            const next = { ...prefs, locale, localeChosen: true };
            savePrefs(next);
            setPrefs(next);
          }}
        />
      )}
    </LocaleProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
