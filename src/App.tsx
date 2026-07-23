import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { inspect, initialSteps, prepare, type BootRuntime, type BootStep } from "./ai/bootstrap";
import { CharacterSessions } from "./ai/characterSessions";
import { AiError, toAiError } from "./ai/errors";
import { FolderClosed, Lock, Settings } from "lucide-react";
import { getApp, getLock, MEMORIES } from "./content/manifest";
import { loadAct1, loadAct3, loadAct4, preloadForAct } from "./content/registry";
import type { Act1Pack, Act2Pack, Act3Pack, Act4Pack } from "./content/registry";
import { evaluate } from "./engine/accusation";
import { createInitialState } from "./engine/initialState";
import { gameReducer } from "./engine/reducer";
import { EVENTS, canAccuse, evaluateUnknownGate } from "./engine/rules";
import { appIsLocked } from "./engine/selectors";
import type { AppId, CharacterId, GameState, LockId, TimelineNodeId } from "./engine/types";
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
import { playSound, primeSound, setSoundEnabled } from "./ui/sound";
import AppShell from "./ui/phone/AppShell";
import HomeScreen from "./ui/phone/HomeScreen";
import LockScreen from "./ui/phone/LockScreen";
import PasscodeSheet from "./ui/phone/PasscodeSheet";
import PhoneFrame from "./ui/phone/PhoneFrame";
import ProgressNotice, { type NarrativeNotice } from "./ui/progress/ProgressNotice";
import SiteSettingsModal from "./ui/settings/SiteSettingsModal";

const ACT_NOTICES: Record<number, { title: string; text: string }> = {
  2: {
    title: "A linha do tempo não fecha",
    text: "Clara já estava morta quando alguém voltou a usar o telefone. O aparelho acaba de revelar novas áreas para investigação.",
  },
  3: {
    title: "O passado voltou ao caso",
    text: "A madrugada de junho não é um detalhe. Novos registros podem ligar o que aconteceu naquele carro à morte de Clara.",
  },
  4: {
    title: "A gravação muda tudo",
    text: "A peça que faltava está ao seu alcance. É hora de reconstruir os fatos e apontar quem matou Clara.",
  },
};

/**
 * Um aplicativo protegido não renderiza o próprio conteúdo enquanto a senha
 * não for aceita pelo motor. A verificação fica aqui, na casca, e não dentro
 * de cada tela — assim nenhum aplicativo novo pode esquecer de fazê-la.
 */
function AppLocked({ appId, onUnlock }: { appId: AppId; onUnlock: (lockId: LockId) => void }) {
  const app = getApp(appId);
  const lock = app?.lock ? getLock(app.lock) : undefined;
  if (!app?.lock || !lock) return null;

  return (
    <div className="list">
      <section className="panel panel--warn">
        <h3>
          <Lock size={16} aria-hidden /> Este aplicativo está protegido
        </h3>
        <p className="muted">Dica definida pela titular: “{lock.hint}”</p>
        <button type="button" className="btn btn--primary" onClick={() => onUnlock(app.lock!)}>
          Inserir código
        </button>
      </section>
    </div>
  );
}

export default function App() {
  /* ---------------- boot ---------------- */
  const [phase, setPhase] = useState<BootPhase>("desligado");
  const [steps, setSteps] = useState<BootStep[]>(() => initialSteps());
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
  const [openChat, setOpenChat] = useState<CharacterId>();
  const [lockRequest, setLockRequest] = useState<LockId>();
  const [showReveal, setShowReveal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notebookOpen, setNotebookOpen] = useState(true);
  const [toast, setToast] = useState<string>();
  const [narrativeNotices, setNarrativeNotices] = useState<NarrativeNotice[]>([]);
  const progressReadyRef = useRef(false);
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

  const autoSaver = useMemo(() => createAutoSaver(), []);
  const conversation = useConversation({ state, dispatch, sessions });

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
      if (/back/.test(cls)) playSound("back");
      else if (/send/.test(cls)) playSound("send");
      else playSound("tap");
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  /* ---------------- persistência ---------------- */

  useEffect(() => {
    autoSaver.onError((error) => {
      const mapped = toAiError(error, "STORAGE_BLOCKED");
      setToast(mapped.info.title);
      void logDiagnostic({ category: "storage", code: mapped.code });
    });
  }, [autoSaver]);

  useEffect(() => {
    if (!state.phoneUnlocked) return;
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
    void preloadForAct(state.act).then(async () => {
      if (!alive) return;
      const next: ContentPacks = { act1: await loadAct1() };
      if (state.act >= 2) next.act2 = (await import("./content/act2")) as Act2Pack;
      if (state.act >= 3) next.act3 = (await loadAct3()) as Act3Pack;
      if (state.act >= 4) next.act4 = (await loadAct4()) as Act4Pack;
      setPacks(next as { act1: Act1Pack } & ContentPacks);
    });
    return () => {
      alive = false;
    };
  }, [state.act]);

  /* ---------------- entrada do contato anônimo ---------------- */

  useEffect(() => {
    if (state.unknownEntered || state.act < 3) return;

    const check = async () => {
      const gate = evaluateUnknownGate(state, Date.now());
      if (!gate.ready) return;

      const pack = await loadAct3();
      dispatch({ type: "FIRE_EVENT", eventId: EVENTS.UNKNOWN });

      const lines =
        gate.variant === "informado" ? pack.UNKNOWN_ENTRY_INFORMED : pack.UNKNOWN_ENTRY_FALLBACK;

      setToast("Uma conversa nova apareceu no Vínculo.");
      playSound("notify");
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
  }, [state, reducedMotion]);

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
    setSteps(initialSteps());

    try {
      const result = await inspect(report);
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
  }, [report]);

  const runPreparation = useCallback(async () => {
    setBootError(undefined);
    setRestoredNote(undefined);
    setPhase("preparando");

    const outcome = await prepare(report);
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

    const nextSessions = new CharacterSessions(outcome.runtime);
    runtimeRef.current = outcome.runtime;
    sessionsRef.current = nextSessions;
    setSessions(nextSessions);

    report.step("progresso", "correndo");
    setPhase("restaurando");

    let jaComecou = false;
    try {
      const save = await loadSave();
      if (save.kind === "ok") {
        progressSnapshotRef.current = {
          act: save.state.act,
          memories: [...save.state.memories],
          unlockedApps: [...save.state.unlockedApps],
        };
        dispatch({ type: "RESTORE", state: save.state });
        jaComecou = save.state.phoneUnlocked;
      } else if (save.kind === "migrado") {
        setRestoredNote(
          "Havia um progresso de uma versão anterior do jogo, com outro caso. Ele foi descartado e esta investigação começa do início.",
        );
      } else if (save.kind === "recusado") {
        setRestoredNote(
          "O progresso salvo não pôde ser lido e foi ignorado. Nenhum outro dado do navegador foi afetado.",
        );
        await clearSave();
      }
    } catch (error) {
      const mapped = toAiError(error, "STORAGE_BLOCKED");
      setRestoredNote(mapped.info.action);
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
    progressReadyRef.current = true;
    setBooted(true);
  }, [report]);

  const [booted, setBooted] = useState(false);

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
      examine: (clueId: string) => dispatch({ type: "EXAMINE_CLUE", clueId }),
      find: (clueId: string) => dispatch({ type: "FIND_CLUE", clueId }),
      zoom: (photoId: string) => dispatch({ type: "ZOOM_PHOTO", photoId }),
      playVoice: (voiceId: string) => dispatch({ type: "PLAY_VOICE", voiceId }),
      requestLock: (lockId: LockId) => setLockRequest(lockId),
      openApp: (appId: AppId) => setOpenAppId(appId),
      openChat: (characterId: CharacterId) => {
        setOpenChat(characterId);
        setOpenAppId("APP_002");
      },
      sendExcerptToFriend: () => {
        void (async () => {
          const pack = await loadAct3();
          const excerpt = pack.DECISIVE_EXCERPT;
          setOpenChat("CHAR_004");
          setOpenAppId("APP_002");
          dispatch({
            type: "CHAT_APPEND",
            characterId: "CHAR_004",
            message: {
              id: `exc${Date.now()}`,
              role: "player",
              text: `[áudio 0:19] ${excerpt.text}`,
              at: new Date().toISOString(),
            },
          });
          dispatch({ type: "FIRE_EVENT", eventId: EVENTS.COLLAPSE });
          await conversation.deliverCollapse("CHAR_004");
        })();
      },
      sendAudioToDiego: () => {
        dispatch({ type: "SEND_AUDIO_TO_DIEGO" });
        setToast("Áudio enviado.");
      },
      placeNode: (node: string, clueId: string) =>
        dispatch({ type: "PLACE_NODE", node: node as TimelineNodeId, clueId }),
      clearNode: (node: string) => dispatch({ type: "CLEAR_NODE", node: node as TimelineNodeId }),
      setAccusation: (patch: Record<string, unknown>) =>
        dispatch({ type: "SET_ACCUSATION", patch: patch as never }),
      toggleSequence: (cardId: string) => dispatch({ type: "TOGGLE_SEQUENCE", cardId }),
      toggleEvidence: (clueId: string) => dispatch({ type: "TOGGLE_EVIDENCE", clueId }),
      submitAccusation: () => {
        void (async () => {
          if (!canAccuse(state)) return;
          const pack = await loadAct4();
          const verdict = evaluate(pack, state.accusation, state);
          dispatch({
            type: "RECORD_ACCUSATION",
            attempt: {
              at: new Date().toISOString(),
              outcome: verdict.outcome,
              feedbackId: verdict.feedbackId,
            },
          });
          void logDiagnostic({ category: "game", code: `ACCUSATION_${verdict.outcome}` });
        })();
      },
      useHint: (obstacleId: string) => dispatch({ type: "USE_HINT", obstacleId }),
      markUnknownRead: () => dispatch({ type: "MARK_UNKNOWN_READ" }),
    }),
    [state, packs, reducedMotion, conversation],
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(undefined), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  /* ---------------- feedback narrativo de progressão ---------------- */

  useEffect(() => {
    if (!booted || !progressReadyRef.current) return;

    const previous = progressSnapshotRef.current;
    const newMemoryIds = state.memories.filter((id) => !previous.memories.includes(id));
    const newApps = state.unlockedApps
      .filter((id) => !previous.unlockedApps.includes(id))
      .map((id) => getApp(id)?.name)
      .filter((name): name is string => Boolean(name));
    const additions: NarrativeNotice[] = newMemoryIds.flatMap((id) => {
      const memory = MEMORIES.find((item) => item.id === id);
      return memory
        ? [{ id: `deduction-${id}`, kind: "deduction", title: memory.label, text: memory.text }]
        : [];
    });

    if (state.act > previous.act) {
      const copy = ACT_NOTICES[state.act] ?? {
        title: "A investigação avançou",
        text: "As novas conexões mudaram o rumo do caso.",
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
  }, [booted, reducedMotion, state.act, state.actEnteredAt, state.memories, state.unlockedApps]);

  const restartInvestigation = useCallback(async () => {
    autoSaver.cancel();
    await clearSave();
    clearNotebookStorage();

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
    setNarrativeNotices([]);
    setNotebookOpen(true);
    setShowSettings(false);
    setCaseFile("entrada");
  }, [autoSaver, sessions]);

  /* ---------------- render ---------------- */

  if (!booted) {
    return (
      <BootScreen
        phase={phase}
        steps={steps}
        error={bootError}
        pending={pending}
        restored={restoredNote}
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
    // O aviso fica no ícone do Vínculo até o jogador abrir a conversa nova.
    APP_002: state.unknownEntered && !state.unknownRead ? 1 : 0,
  };

  return (
    <div className={`stage${prefs.largeText ? " stage--large" : ""}`}>
      <PhoneFrame clock="14:07" battery={38}>
        {!state.phoneUnlocked ? (
          <LockScreen reducedMotion={reducedMotion} onUnlock={() => dispatch({ type: "UNLOCK_PHONE" })} />
        ) : openAppId ? (
          <AppShell
            title={appTitle(openAppId)}
            contained={openAppId === "APP_002"}
            onBack={() => {
              setOpenAppId(undefined);
              setOpenChat(undefined);
            }}
          >
            {appIsLocked(state, openAppId) ? (
              <AppLocked appId={openAppId} onUnlock={setLockRequest} />
            ) : (
              renderApp({ appId: openAppId, api, conversation, initialCharacter: openChat })
            )}
          </AppShell>
        ) : (
          <HomeScreen state={state} badges={badges} onOpen={(appId) => setOpenAppId(appId)} />
        )}
      </PhoneFrame>

      <CaseNotebook api={api} open={notebookOpen} onToggle={() => setNotebookOpen((value) => !value)} />

      <nav className="site-actions" aria-label="Ferramentas da investigação">
        <button
          type="button"
          className="site-action site-action--casefile"
          onClick={() => setCaseFile("consulta")}
          aria-label="Abrir material do caso"
        >
          <FolderClosed size={19} aria-hidden />
          <span>Material do caso</span>
        </button>
        <button
          type="button"
          className="site-action"
          onClick={() => setShowSettings(true)}
          aria-label="Abrir opções da investigação"
        >
          <Settings size={19} aria-hidden />
          <span>Opções</span>
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
            setToast("Conteúdo destravado.");
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

      {narrativeNotices[0] && (
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
          act={state.act}
          clues={state.cluesFound.length}
          events={state.eventsFired.length}
          onChange={(next) => {
            setPrefs(next);
            savePrefs(next);
          }}
          onExportDiagnostics={() => void exportDiagnostics()}
          onRestart={restartInvestigation}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
