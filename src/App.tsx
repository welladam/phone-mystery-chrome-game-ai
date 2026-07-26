import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { inspect, initialSteps, prepare, type BootRuntime, type BootStep } from "./ai/bootstrap";
import { CharacterSessions } from "./ai/characterSessions";
import { AiError, toAiError } from "./ai/errors";
import { FolderClosed, Lock, Settings } from "lucide-react";
import { loadAct1, loadAct2, loadAct3, loadAct4, preloadForAct } from "./content/registry";
import type { Act1Pack, Act2Pack, Act3Pack, Act4Pack } from "./content/registry";
import { evaluate } from "./engine/accusation";
import { createInitialState } from "./engine/initialState";
import { gameReducer } from "./engine/reducer";
import { EVENTS, canAccuse, evaluateUnknownGate } from "./engine/rules";
import { appIsLocked } from "./engine/selectors";
import type { AppId, CharacterId, GameState, LockId } from "./engine/types";
import { exportDiagnostics, logDiagnostic } from "./persistence/diagnostics";
import { loadPrefs, savePrefs } from "./persistence/prefs";
import { clearSave, createAutoSaver, loadSave } from "./persistence/save";
import { useReducedMotion } from "./ui/a11y/hooks";
import Revelation from "./ui/accusation/Revelation";
import { clearNotebookStorage } from "./ui/apps/NotebookApp";
import CaseNotebook from "./ui/dossier/CaseNotebook";
import CaseFile from "./ui/dossier/CaseFile";
import { renderApp, appTitle } from "./ui/apps/registry";
import type { ContentPacks } from "./ui/apps/types";
import { useConversation } from "./ui/apps/useConversation";
import BootScreen, { type BootPhase } from "./ui/boot/BootScreen";
import DifficultyScreen from "./ui/boot/DifficultyScreen";
import { playSound, primeSound, setSoundEnabled } from "./ui/sound";
import AppShell from "./ui/phone/AppShell";
import HomeScreen from "./ui/phone/HomeScreen";
import LockScreen from "./ui/phone/LockScreen";
import PasscodeSheet from "./ui/phone/PasscodeSheet";
import PhoneFrame from "./ui/phone/PhoneFrame";
import ProgressNotice, { type NarrativeNotice } from "./ui/progress/ProgressNotice";
import SiteSettingsModal from "./ui/settings/SiteSettingsModal";
import { useLocale } from "./i18n/LocaleContext";
import { getLocaleChat } from "./locales/chatRegistry";
import { getLocaleContent } from "./locales/contentRegistry";

/**
 * Um aplicativo protegido não renderiza o próprio conteúdo enquanto a senha
 * não for aceita pelo motor. A verificação fica aqui, na casca, e não dentro
 * de cada tela — assim nenhum aplicativo novo pode esquecer de fazê-la.
 */
function AppLocked({
  appId,
  showHint,
  onUnlock,
}: {
  appId: AppId;
  showHint: boolean;
  onUnlock: (lockId: LockId) => void;
}) {
  const { localeId, t } = useLocale();
  const { getApp, getLock } = getLocaleContent(localeId).manifest;
  const app = getApp(appId);
  const lock = app?.lock ? getLock(app.lock) : undefined;
  if (!app?.lock || !lock) return null;

  return (
    <div className="list">
      <section className="panel panel--warn">
        <h3>
          <Lock size={16} aria-hidden /> {t("app.protected")}
        </h3>
        {showHint && <p className="muted">{t("app.ownerHint", { hint: lock.hint })}</p>}
        <button type="button" className="btn btn--primary" onClick={() => onUnlock(app.lock!)}>
          {t("app.enterCode")}
        </button>
      </section>
    </div>
  );
}

export default function App() {
  const { locale, localeId, t } = useLocale();
  const localeChat = getLocaleChat(localeId);
  const localeContent = getLocaleContent(localeId);
  /* ---------------- boot ---------------- */
  const [phase, setPhase] = useState<BootPhase>("desligado");
  const [steps, setSteps] = useState<BootStep[]>(() => initialSteps(locale));
  const [bootError, setBootError] = useState<AiError>();
  const [pending, setPending] = useState<string[]>([]);
  const [restoredNote, setRestoredNote] = useState<string>();
  const runtimeRef = useRef<BootRuntime | undefined>(undefined);
  const sessionsRef = useRef<CharacterSessions | undefined>(undefined);
  const [sessions, setSessions] = useState<CharacterSessions>();

  /* ---------------- estado do jogo ---------------- */
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const [packs, setPacks] = useState<ContentPacks>({});
  const [prefs, setPrefs] = useState(loadPrefs);
  const reducedMotion = useReducedMotion(prefs.reducedMotion);

  const [openAppId, setOpenAppId] = useState<AppId>();
  const [openChat, setOpenChat] = useState<{ id: CharacterId; request: number }>();
  const [lockRequest, setLockRequest] = useState<LockId>();
  const [showReveal, setShowReveal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notebookOpen, setNotebookOpen] = useState(true);
  const [booted, setBooted] = useState(false);
  const [activeChat, setActiveChat] = useState<CharacterId>();
  const [phoneNotification, setPhoneNotification] = useState<{
    characterId: CharacterId;
    title: string;
    text: string;
  }>();
  const [toast, setToast] = useState<string>();
  const [narrativeNotices, setNarrativeNotices] = useState<NarrativeNotice[]>([]);
  const progressReadyRef = useRef(false);
  const incomingReadyRef = useRef(false);
  const incomingCountsRef = useRef<Record<string, number>>({});
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const progressSnapshotRef = useRef({
    act: state.act,
    memories: [...state.memories],
    unlockedApps: [...state.unlockedApps],
  });
  /**
   * A pasta reservada. Aparece sozinha depois que tudo está instalado e antes
   * de o celular ligar — é onde o jogador recebe o briefing e o código da
   * tela. Depois disso continua acessível pela lateral, e a folha de anotações
   * dentro dela acompanha o que já foi descoberto.
   */
  const [caseFile, setCaseFile] = useState<"entrada" | "consulta" | undefined>();

  const autoSaver = useMemo(() => createAutoSaver(localeId), [localeId]);
  const conversation = useConversation({ state, dispatch, sessions, localeId });
  const handleActiveChat = useCallback((characterId?: CharacterId) => setActiveChat(characterId), []);

  const report = useMemo(
    () => ({
      step(id: BootStep["id"], stepState: BootStep["state"], patch?: { progress?: number; detail?: string }) {
        setSteps((current) =>
          current.map((step) =>
            step.id === id ? { ...step, state: stepState, ...patch } : step,
          ),
        );
      },
    }),
    [],
  );

  /* ---------------- som ---------------- */

  useEffect(() => {
    setSoundEnabled(prefs.sound);
  }, [prefs.sound]);

  // Toque discreto ao clicar em qualquer elemento interativo. O primeiro
  // gesto também "acorda" o áudio (política de autoplay do navegador).
  useEffect(() => {
    const handler = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const el = target?.closest?.(
        "button, [role='button'], summary, label.choice, label.toggle, .app-tile, .chatlist__row, .folder__head, .file__head, .mail__head, .note__head, .voice__head",
      );
      if (!el) return;
      primeSound();
      const cls = el.getAttribute("class") ?? "";
      if (/composer__send/.test(cls)) return;
      if (/back/.test(cls)) playSound("back");
      else playSound("tap");
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  /* ---------------- persistência ---------------- */

  useEffect(() => {
    autoSaver.onError((error) => {
      const mapped = toAiError(error, "STORAGE_BLOCKED");
      setToast(locale.errors?.[mapped.code]?.title ?? mapped.info.title);
      void logDiagnostic({ category: "storage", code: mapped.code });
    });
  }, [autoSaver, locale.errors]);

  useEffect(() => {
    if (!state.difficultyChosen) return;
    autoSaver.schedule(state);
  }, [state, autoSaver]);

  useEffect(() => {
    const flush = () => void autoSaver.flushNow();
    window.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, [autoSaver]);

  /* ---------------- conteúdo por ato ---------------- */

  useEffect(() => {
    let alive = true;
    void preloadForAct(localeId, state.act).then(async () => {
      if (!alive) return;
      const next: ContentPacks = {
        act1: await loadAct1(localeId),
        act2: (await loadAct2(localeId)) as Act2Pack,
        act3: (await loadAct3(localeId)) as Act3Pack,
      };
      if (state.act >= 4) next.act4 = (await loadAct4(localeId)) as Act4Pack;
      setPacks(next as { act1: Act1Pack } & ContentPacks);
    });
    return () => {
      alive = false;
    };
  }, [localeId, state.act]);

  /* ---------------- entrada do contato anônimo ---------------- */

  useEffect(() => {
    if (state.unknownEntered || state.act < 3) return;

    const check = async () => {
      const gate = evaluateUnknownGate(state, Date.now());
      if (!gate.ready) return;

      const pack = await loadAct3(localeId);
      dispatch({ type: "FIRE_EVENT", eventId: EVENTS.UNKNOWN });

      const lines =
        gate.variant === "informado" ? pack.UNKNOWN_ENTRY_INFORMED : pack.UNKNOWN_ENTRY_FALLBACK;

      if (!reducedMotion && typeof navigator.vibrate === "function") navigator.vibrate(220);

      for (const line of lines) {
        if (!reducedMotion) await new Promise((resolve) => setTimeout(resolve, 1200));
        dispatch({
          type: "CHAT_APPEND",
          characterId: "CHAR_005",
          message: {
            id: `unk${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
            role: "character",
            text: line,
            at: new Date().toISOString(),
            scripted: true,
          },
        });
      }
      void logDiagnostic({ category: "game", code: "UNKNOWN_ENTERED", details: { variant: gate.variant } });
    };

    const timer = setTimeout(() => void check(), 3000);
    return () => clearTimeout(timer);
  }, [localeId, state, reducedMotion]);

  /* ---------------- revelação ---------------- */

  // `conversation` é recriado a cada render, então o efeito reexecutaria sem
  // parar e reiniciaria o desfecho. A trava garante uma única execução.
  const revealRunning = useRef(false);

  useEffect(() => {
    if (!state.eventsFired.includes(EVENTS.ACCUSED)) return;
    if (state.revealShown || revealRunning.current) return;
    revealRunning.current = true;

    void (async () => {
      await conversation.deliverCollapse("CHAR_004");
      if (state.unknownEntered) await conversation.deliverCollapse("CHAR_005");
      dispatch({ type: "SHOW_REVEAL" });
      setShowReveal(true);
    })();
  }, [state.eventsFired, state.revealShown, state.unknownEntered, conversation]);

  /* ---------------- ações do boot ---------------- */

  const runInspection = useCallback(async () => {
    setBootError(undefined);
    setPhase("verificando");
    setSteps(initialSteps(locale));

    try {
      const result = await inspect(locale, report);
      if (result.kind === "erro") {
        setBootError(result.error);
        setPhase("erro");
        void logDiagnostic({ category: "runtime", code: result.error.code });
        return;
      }
      if (result.kind === "precisa-baixar") {
        setPending(result.pendentes);
        setPhase("aguardando-autorizacao");
        return;
      }
      await runPreparation();
    } catch (error) {
      const mapped = toAiError(error);
      setBootError(mapped);
      setPhase("erro");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, report]);

  const runPreparation = useCallback(async () => {
    setBootError(undefined);
    setRestoredNote(undefined);
    setPhase("preparando");

    const outcome = await prepare(locale, report);
    if (outcome.kind === "erro") {
      setBootError(outcome.error);
      setPhase("erro");
      void logDiagnostic({ category: "download", code: outcome.error.code });
      return;
    }
    if (outcome.kind === "precisa-autorizacao") {
      setPhase("aguardando-autorizacao");
      return;
    }

    // Uma nova preparação substitui os recursos anteriores de forma explícita.
    // Eles não podem ficar presos ao cleanup de um efeito dependente de
    // `sessions`: esse cleanup também roda quando o estado recebe a primeira
    // sessão e acabaria destruindo os tradutores recém-criados.
    sessionsRef.current?.destroy();
    runtimeRef.current?.destroy();

    const nextSessions = new CharacterSessions(outcome.runtime, locale);
    runtimeRef.current = outcome.runtime;
    sessionsRef.current = nextSessions;
    setSessions(nextSessions);

    report.step("progresso", "correndo");
    setPhase("restaurando");

    let jaComecou = false;
    let restoredState: GameState | undefined;
    try {
      // A tela "aparelho pronto" precisa de um instante para ser percebida —
      // sem isso, uma restauração rápida do save a atravessa num único quadro.
      const save = reducedMotion
        ? await loadSave(localeId)
        : (await Promise.all([loadSave(localeId), new Promise((resolve) => setTimeout(resolve, 500))]))[0];
      if (save.kind === "ok" || save.kind === "migrado") {
        restoredState = save.state;
        progressSnapshotRef.current = {
          act: save.state.act,
          memories: [...save.state.memories],
          unlockedApps: [...save.state.unlockedApps],
        };
        dispatch({ type: "RESTORE", state: save.state });
        jaComecou = save.state.phoneUnlocked;
      } else if (save.kind === "recusado") {
        setRestoredNote(
          t("save.corrupt"),
        );
        await clearSave(localeId);
      }
    } catch (error) {
      const mapped = toAiError(error, "STORAGE_BLOCKED");
      setRestoredNote(locale.errors?.[mapped.code]?.action ?? mapped.info.action);
      void logDiagnostic({ category: "storage", code: mapped.code });
    }

    report.step("progresso", "ok");
    report.step("pronto", "ok");
    void logDiagnostic({ category: "runtime", code: "READY" });
    setPhase("restaurando");
    setTimeout(() => setPhase("desligado"), 0);

    // Investigação nova: a pasta reservada vem antes do aparelho, porque é
    // dela que sai o código da tela. Quem já estava no meio do caso entra
    // direto e consulta a pasta quando quiser.
    setCaseFile(jaComecou ? undefined : "entrada");
    const baseline = restoredState ?? createInitialState();
    incomingCountsRef.current = Object.fromEntries(
      Object.entries(baseline.chats).map(([id, chat]) => [id, chat.messages.length]),
    );
    incomingReadyRef.current = true;
    progressReadyRef.current = true;
    setBooted(true);
  }, [locale, localeId, report, t, reducedMotion]);

  // Recursos nativos do Chrome sobrevivem durante toda a partida e são
  // encerrados apenas quando o aplicativo realmente sai da página.
  useEffect(() => () => {
    sessionsRef.current?.destroy();
    runtimeRef.current?.destroy();
    sessionsRef.current = undefined;
    runtimeRef.current = undefined;
  }, []);

  /* ---------------- API dos aplicativos ---------------- */

  const api = useMemo(
    () => ({
      state,
      packs,
      reducedMotion,
      localeId,
      examine: (clueId: string) => dispatch({ type: "EXAMINE_CLUE", clueId }),
      find: (clueId: string) => dispatch({ type: "FIND_CLUE", clueId }),
      zoom: (photoId: string) => dispatch({ type: "ZOOM_PHOTO", photoId }),
      playVoice: (voiceId: string) => dispatch({ type: "PLAY_VOICE", voiceId }),
      playVideo: (videoId: string) => dispatch({ type: "PLAY_VIDEO", videoId }),
      requestLock: (lockId: LockId) => setLockRequest(lockId),
      openApp: (appId: AppId) => setOpenAppId(appId),
      openChat: (characterId: CharacterId) => {
        setOpenChat({ id: characterId, request: Date.now() });
        setOpenAppId("APP_002");
      },
      setActiveChat: handleActiveChat,
      sendExcerptToFriend: () => {
        void (async () => {
          const pack = await loadAct3(localeId);
          const excerpt = pack.DECISIVE_EXCERPT;
          setOpenChat({ id: "CHAR_004", request: Date.now() });
          setOpenAppId("APP_002");
          dispatch({
            type: "CHAT_APPEND",
            characterId: "CHAR_004",
            message: {
              id: `exc${Date.now()}`,
              role: "player",
              text: t("chat.audioAttachment", { text: excerpt.text }),
              at: new Date().toISOString(),
            },
          });
          dispatch({ type: "FIRE_EVENT", eventId: EVENTS.COLLAPSE });
          await conversation.deliverCollapse("CHAR_004");
        })();
      },
      sendAudioToDiego: () => {
        dispatch({ type: "SEND_AUDIO_TO_DIEGO" });
        setToast(t("chat.audioSent"));
      },
      setAccusation: (patch: Record<string, unknown>) =>
        dispatch({ type: "SET_ACCUSATION", patch: patch as never }),
      submitAccusation: () => {
        if (!canAccuse(state)) return;
        const verdict = evaluate(state.accusation);
        dispatch({
          type: "RECORD_ACCUSATION",
          attempt: {
            at: new Date().toISOString(),
            outcome: verdict.outcome,
            feedbackId: verdict.feedbackId,
          },
        });
        void logDiagnostic({ category: "game", code: `ACCUSATION_${verdict.outcome}` });
      },
      useHint: (obstacleId: string) => dispatch({ type: "USE_HINT", obstacleId }),
      markUnknownRead: () => dispatch({ type: "MARK_UNKNOWN_READ" }),
    }),
    [state, packs, reducedMotion, localeId, conversation, handleActiveChat, t],
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(undefined), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  /* ---------------- notificações de mensagens ---------------- */

  useEffect(() => {
    if (!incomingReadyRef.current) return;

    let latest: { characterId: CharacterId; text: string } | undefined;
    let receivedCount = 0;
    (Object.entries(state.chats) as Array<[CharacterId, GameState["chats"][string]]>).forEach(
      ([characterId, chat]) => {
        const previous = incomingCountsRef.current[characterId] ?? 0;
        const additions = chat.messages.slice(previous).filter((message) => message.role === "character");
        incomingCountsRef.current[characterId] = chat.messages.length;
        receivedCount += additions.length;
        if (additions.length && activeChat !== characterId) {
          latest = { characterId, text: additions[additions.length - 1].text };
        }
      },
    );

    for (let index = 0; index < receivedCount; index += 1) {
      window.setTimeout(() => playSound("notify"), index * 140);
    }

    if (!latest) return;
    const incoming = latest as { characterId: CharacterId; text: string };
    const profile = localeChat.getCharacter(incoming.characterId);
    setPhoneNotification({
      characterId: incoming.characterId,
      title: profile.displayName,
      text: incoming.text.slice(0, 88),
    });

    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    notificationTimerRef.current = setTimeout(() => setPhoneNotification(undefined), 4600);
  }, [activeChat, localeChat, state.chats]);

  useEffect(() => () => {
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
  }, []);

  /* ---------------- feedback narrativo de progressão ---------------- */

  useEffect(() => {
    if (!booted || !progressReadyRef.current) return;

    const previous = progressSnapshotRef.current;
    if (state.difficulty === "hard") {
      progressSnapshotRef.current = {
        act: state.act,
        memories: [...state.memories],
        unlockedApps: [...state.unlockedApps],
      };
      setNarrativeNotices([]);
      return;
    }
    const newMemoryIds = state.memories.filter((id) => !previous.memories.includes(id));
    const newApps = state.unlockedApps
      .filter((id) => !previous.unlockedApps.includes(id))
      .map((id) => localeContent.manifest.getApp(id)?.name)
      .filter((name): name is string => Boolean(name));
    const additions: NarrativeNotice[] = newMemoryIds.flatMap((id) => {
      const memory = localeContent.manifest.MEMORIES.find((item) => item.id === id);
      return memory
        ? [{ id: `deduction-${id}`, kind: "deduction", title: memory.label, text: memory.text }]
        : [];
    });

    if (state.act > previous.act) {
      const actCopy = {
        1: undefined,
        2: { title: t("act.2.title"), text: t("act.2.text") },
        3: { title: t("act.3.title"), text: t("act.3.text") },
        4: { title: t("act.4.title"), text: t("act.4.text") },
      }[state.act];
      const copy = actCopy ?? {
        title: t("progress.advanced.title"),
        text: t("progress.advanced.text"),
      };
      additions.push({
        id: `act-${state.act}-${state.actEnteredAt}`,
        kind: "act",
        act: state.act,
        title: copy.title,
        text: copy.text,
        apps: newApps,
      });
    }

    progressSnapshotRef.current = {
      act: state.act,
      memories: [...state.memories],
      unlockedApps: [...state.unlockedApps],
    };

    if (additions.length > 0) {
      setNarrativeNotices((current) => [...current, ...additions]);
      playSound(additions.some((item) => item.kind === "act") ? "unlock" : "clue");
      if (!reducedMotion && typeof navigator.vibrate === "function") navigator.vibrate([90, 70, 140]);
    }
  }, [booted, locale.messages, reducedMotion, state.act, state.actEnteredAt, state.difficulty, state.memories, state.unlockedApps, t]);

  const restartInvestigation = useCallback(async () => {
    autoSaver.cancel();
    await clearSave(localeId);
    clearNotebookStorage(localeId);

    if (sessions) {
      await Promise.allSettled(
        (["CHAR_002", "CHAR_003", "CHAR_004", "CHAR_005"] as CharacterId[]).map((characterId) =>
          sessions.reset(characterId),
        ),
      );
    }

    const freshState = createInitialState();
    progressSnapshotRef.current = {
      act: freshState.act,
      memories: [...freshState.memories],
      unlockedApps: [...freshState.unlockedApps],
    };
    dispatch({ type: "RESTORE", state: freshState });
    setOpenAppId(undefined);
    setOpenChat(undefined);
    setLockRequest(undefined);
    setShowReveal(false);
    setRestoredNote(undefined);
    setToast(undefined);
    setPhoneNotification(undefined);
    incomingCountsRef.current = {};
    incomingReadyRef.current = true;
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    setNarrativeNotices([]);
    setNotebookOpen(true);
    setShowSettings(false);
    setCaseFile("entrada");
  }, [autoSaver, localeId, sessions]);

  /* ---------------- render ---------------- */

  if (!booted) {
    return (
      <BootScreen
        phase={phase}
        steps={steps}
        error={bootError}
        pending={pending}
        restored={restoredNote}
        reducedMotion={reducedMotion}
        onPowerOn={() => void runInspection()}
        onAuthorize={() => void runPreparation()}
        onRetry={() => void runInspection()}
      />
    );
  }

  // A pasta de entrada ocupa a tela inteira: é leitura, não é multitarefa.
  if (caseFile === "entrada") {
    return (
      <CaseFile
        mode="entrada"
        reducedMotion={reducedMotion}
        onClose={() => setCaseFile(undefined)}
      />
    );
  }

  if (!state.difficultyChosen) {
    return (
      <DifficultyScreen
        reducedMotion={reducedMotion}
        onChoose={(difficulty) => dispatch({ type: "SET_DIFFICULTY", difficulty })}
      />
    );
  }

  if (showReveal && packs.act4) {
    return (
      <Revelation
        pack={packs.act4}
        sentAudioToDiego={state.sentAudioToDiego}
        reducedMotion={reducedMotion}
        onFinish={() => setShowReveal(false)}
      />
    );
  }

  const badges: Partial<Record<AppId, number>> = {
    // O aviso fica no ícone do Chat até o jogador abrir a conversa nova.
    APP_002: state.unknownEntered && !state.unknownRead ? 1 : 0,
  };

  return (
    <div className={`stage${prefs.largeText ? " stage--large" : ""}${state.difficulty === "hard" ? " stage--hard" : ""}`}>
      <PhoneFrame
        clock="14:07"
        battery={38}
        notification={phoneNotification}
        onDismissNotification={() => setPhoneNotification(undefined)}
        onOpenNotification={() => {
          if (!phoneNotification) return;
          setOpenChat({ id: phoneNotification.characterId, request: Date.now() });
          setOpenAppId("APP_002");
          setPhoneNotification(undefined);
        }}
      >
        {!state.phoneUnlocked ? (
          <LockScreen reducedMotion={reducedMotion} onUnlock={() => dispatch({ type: "UNLOCK_PHONE" })} />
        ) : openAppId ? (
          <AppShell
            appId={openAppId}
            title={appTitle(openAppId, localeId)}
            contained={openAppId === "APP_002"}
            onBack={() => {
              setOpenAppId(undefined);
              setOpenChat(undefined);
            }}
          >
            {appIsLocked(state, openAppId) ? (
              <AppLocked
                appId={openAppId}
                showHint={state.difficulty === "normal"}
                onUnlock={setLockRequest}
              />
            ) : (
              renderApp({
                appId: openAppId,
                api,
                conversation,
                initialCharacter: openChat?.id,
                chatRequestKey: openChat?.request,
              })
            )}
          </AppShell>
        ) : (
          <HomeScreen state={state} badges={badges} onOpen={(appId) => setOpenAppId(appId)} />
        )}
      </PhoneFrame>

      <CaseNotebook api={api} open={notebookOpen} onToggle={() => setNotebookOpen((value) => !value)} />

      <nav className="site-actions" aria-label={t("site.tools")}>
        <button
          type="button"
          className="site-action site-action--casefile"
          onClick={() => setCaseFile("consulta")}
          aria-label={t("site.openCaseMaterial")}
        >
          <FolderClosed size={19} aria-hidden />
          <span>{t("site.caseMaterial")}</span>
        </button>
        <button
          type="button"
          className="site-action"
          onClick={() => setShowSettings(true)}
          aria-label={t("site.openOptions")}
        >
          <Settings size={19} aria-hidden />
          <span>{t("site.options")}</span>
        </button>
      </nav>

      {lockRequest && (
        <PasscodeSheet
          lockId={lockRequest}
          state={state}
          reducedMotion={reducedMotion}
          onSolved={() => {
            dispatch({ type: "SOLVE_LOCK", lockId: lockRequest });
            setLockRequest(undefined);
            setToast(t("unlock.success"));
            playSound("unlock");
          }}
          onFail={() => dispatch({ type: "FAIL_LOCK", lockId: lockRequest })}
          onClose={() => setLockRequest(undefined)}
        />
      )}

      {toast && (
        <p className="toast" role="status">
          {toast}
        </p>
      )}

      {state.difficulty === "normal" && narrativeNotices[0] && (
        <ProgressNotice
          key={narrativeNotices[0].id}
          notice={narrativeNotices[0]}
          remaining={narrativeNotices.length - 1}
          onContinue={() => setNarrativeNotices((current) => current.slice(1))}
        />
      )}

      {restoredNote && (
        <p className="restored-note" role="status">
          {restoredNote}
        </p>
      )}

      {caseFile === "consulta" && (
        <CaseFile
          mode="consulta"
          reducedMotion={reducedMotion}
          onClose={() => setCaseFile(undefined)}
        />
      )}

      {showSettings && (
        <SiteSettingsModal
          prefs={prefs}
          difficulty={state.difficulty}
          act={state.act}
          clues={state.cluesFound.length}
          events={state.eventsFired.length}
          onChange={(next) => {
            setPrefs(next);
            savePrefs(next);
          }}
          onExportDiagnostics={() => void exportDiagnostics()}
          onLocaleChange={async (nextLocale) => {
            if (nextLocale === localeId) return;
            await autoSaver.flushNow();
            sessionsRef.current?.destroy();
            runtimeRef.current?.destroy();
            savePrefs({ ...prefs, locale: nextLocale, localeChosen: true });
            window.location.reload();
          }}
          onRestart={restartInvestigation}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
