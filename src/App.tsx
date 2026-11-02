import { useEffect, useRef, useState } from "react";
import { registerSW } from "virtual:pwa-register";
import { quests, upgrades, findQuest } from "./game/content";
import { initialState, isUnlocked } from "./game/engine";
import { loadGameWithRecovery, mutateGame, saveGame } from "./game/storage";
import { parseImport } from "./game/validation";
import type { Action, GameState } from "./game/types";
import { Icon } from "./components/Icon";
import { WorkshopArt } from "./components/WorkshopArt";
import { QuestPlayer } from "./components/QuestPlayer";
import "./style.css";

type View = "map" | "workshop" | "progress" | "settings";
const navigation = [
  { id: "map", name: "Aufträge", icon: "map" },
  { id: "workshop", name: "Werkstatt", icon: "wrench" },
  { id: "progress", name: "Fortschritt", icon: "trophy" },
  { id: "settings", name: "Einstellungen", icon: "settings" },
] as const;
export default function App() {
  const [state, setState] = useState<GameState>(initialState),
    [loaded, setLoaded] = useState(false),
    [loadFailed, setLoadFailed] = useState(false),
    [importRecovery, setImportRecovery] = useState(false),
    [error, setError] = useState(""),
    [view, setView] = useState<View>("map"),
    [playing, setPlaying] = useState(false),
    [busy, setBusy] = useState(false),
    [offlineReady, setOfflineReady] = useState(false),
    [updateReady, setUpdateReady] = useState(false),
    [notice, setNotice] = useState(""),
    [candidate, setCandidate] = useState<GameState | null>(null),
    [online, setOnline] = useState(navigator.onLine);
  const acting = useRef(false),
    update = useRef<((reload?: boolean) => Promise<void>) | null>(null),
    channel = useRef<BroadcastChannel | null>(null),
    audio = useRef<AudioContext | null>(null);
  const level = 1 + Math.floor(state.xp / 200),
    next = quests.find((q) => !state.completed.includes(q.id)) ?? quests[0];
  async function restore() {
    try {
      const result = await loadGameWithRecovery();
      setState(result.state);
      setLoadFailed(false);
      if (result.recovered)
        setNotice(
          "Inhalte wurden aktualisiert. Ältere unvollständige Missionen werden neu gestartet; verdiente Belohnungen bleiben erhalten.",
        );
      setLoaded(true);
      setError("");
    } catch {
      setLoadFailed(true);
      setError(
        "Dein Spielstand konnte nicht geladen werden. Bitte prüfe, ob dein Browser lokalen Speicher erlaubt, und versuche es erneut.",
      );
    }
  }
  useEffect(() => {
    void restore();
    if ("BroadcastChannel" in window) {
      const c = new BroadcastChannel("lernquest-updates");
      channel.current = c;
      c.onmessage = () => {
        if (!acting.current) void restore();
      };
      return () => c.close();
    }
  }, []);
  useEffect(() => {
    update.current = registerSW({
      immediate: true,
      onOfflineReady: () => setOfflineReady(true),
      onNeedRefresh: () => setUpdateReady(true),
      onRegisterError: () =>
        setNotice("Offline-Speicherung konnte noch nicht eingerichtet werden."),
    });
    const handle = () => setOnline(navigator.onLine);
    window.addEventListener("online", handle);
    window.addEventListener("offline", handle);
    return () => {
      window.removeEventListener("online", handle);
      window.removeEventListener("offline", handle);
    };
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle(
      "reduce-motion",
      state.settings.reducedMotion,
    );
  }, [state.settings.reducedMotion]);
  function chime() {
    try {
      const ctx = audio.current ?? new AudioContext();
      audio.current = ctx;
      void ctx.resume();
      const osc = ctx.createOscillator(),
        gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      /* Optional audio has no effect on game progression. */
    }
  }
  async function act(action: Action) {
    if (acting.current) return;
    acting.current = true;
    setBusy(true);
    setError("");
    try {
      const s = await mutateGame(action);
      setState(s);
      channel.current?.postMessage("saved");
      if (action.type === "finish") {
        setPlaying(false);
        if (s.settings.sound) chime();
      }
      if (
        action.type === "buy" &&
        s.purchases.length > state.purchases.length
      ) {
        setNotice("Ausbau freigeschaltet. Deine Werkstatt wächst!");
        if (s.settings.sound) chime();
      }
    } catch {
      setError(
        "Nicht gespeichert. Dein bisheriger Spielstand bleibt erhalten. Bitte versuche die Aktion erneut.",
      );
    } finally {
      acting.current = false;
      setBusy(false);
    }
  }
  async function enter(id: string) {
    if (state.session && state.session.questId !== id) return;
    if (!state.session)
      await act({
        type: "start",
        questId: id,
        id: crypto.randomUUID(),
        now: new Date().toISOString(),
      });
    setPlaying(true);
    window.scrollTo(0, 0);
  }
  const go = (v: View) => {
    setPlaying(false);
    setView(v);
    setNotice("");
    window.scrollTo(0, 0);
  };
  async function importFile(file?: File) {
    if (!file) return;
    setError("");
    try {
      if (file.size > 2_000_000)
        throw new Error("Die Datei ist zu groß (maximal 2 MB).");
      const text = await file.text();
      const parsed = parseImport(text);
      const original = JSON.parse(text);
      setImportRecovery(
        original.contentVersion !== parsed.contentVersion ||
          (!!original.session && !parsed.session),
      );
      setCandidate(parsed);
    } catch (e) {
      setCandidate(null);
      setError(
        e instanceof Error
          ? e.message
          : "Die Datei konnte nicht gelesen werden.",
      );
    }
  }
  async function confirmImport() {
    if (!candidate || acting.current) return;
    acting.current = true;
    setBusy(true);
    try {
      await saveGame(candidate);
      setState(candidate);
      setLoaded(true);
      setError("");
      setCandidate(null);
      setPlaying(false);
      setLoadFailed(false);
      setNotice(
        importRecovery
          ? "Sicherung wiederhergestellt. Inhalte wurden aktualisiert; ältere unvollständige Missionen werden neu gestartet. Belohnungen bleiben erhalten."
          : "Sicherung wiederhergestellt.",
      );
      channel.current?.postMessage("saved");
    } catch {
      setError(
        "Import konnte nicht gespeichert werden. Dein bisheriger Spielstand bleibt erhalten.",
      );
    } finally {
      acting.current = false;
      setBusy(false);
    }
  }
  function exportFile() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `lernquest-spielstand-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (!loaded)
    return (
      <div className="loading">
        <div className="brand">
          <span className="brand-mark">
            L<span>◆</span>
          </span>
          LernQuest
        </div>
        {loadFailed ? (
          <>
            {error && <p role="alert">{error}</p>}
            <button className="primary" onClick={() => void restore()}>
              Erneut versuchen
            </button>
            <label className="secondary upload-button">
              Sicherung wiederherstellen
              <input
                aria-label="Sicherung wiederherstellen"
                type="file"
                accept="application/json,.json"
                onChange={(e) => void importFile(e.target.files?.[0])}
              />
            </label>
            {candidate && (
              <div className="import-preview">
                <h2>Sicherung übernehmen?</h2>
                {importRecovery && (
                  <p>
                    Ältere Missionsstände werden neu gestartet. Bereits
                    verdiente Belohnungen bleiben erhalten.
                  </p>
                )}
                <p>
                  {candidate.xp} XP · {candidate.completed.length} Missionen.
                  Der vorhandene Stand wird ersetzt.
                </p>
                <button
                  className="primary"
                  disabled={busy}
                  onClick={() => void confirmImport()}
                >
                  Spielstand ersetzen
                </button>
                <button
                  className="quiet"
                  disabled={busy}
                  onClick={() => setCandidate(null)}
                >
                  Abbrechen
                </button>
              </div>
            )}
          </>
        ) : (
          <p>Deine Werkstatt wird geöffnet …</p>
        )}
      </div>
    );
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go("map");
          }}
        >
          <span className="brand-mark">
            L<span>◆</span>
          </span>
          LernQuest<span className="brand-dot">.</span>
        </a>
        <p className="sidebar-label">DEIN ABENTEUER</p>
        <nav aria-label="Hauptnavigation">
          {navigation.map((n) => (
            <button
              key={n.id}
              className={view === n.id ? "nav-item active" : "nav-item"}
              onClick={() => go(n.id)}
            >
              <Icon name={n.icon} />
              <span>{n.name}</span>
              {view === n.id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="pace-card">
            <Icon name="sprout" />
            <strong>Dein Tempo zählt.</strong>
            <p>Eine kleine Quest ist ein guter Anfang. Pausen gehören dazu.</p>
            <span>Kein Stress. Kein Countdown.</span>
          </div>
          <div className="sidebar-footer">
            <span className="status-dot" />
            {online ? "Bereit für deine Mission" : "Du spielst offline"}
            <span>V0.1</span>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumb">
            DEINE REISE <Icon name="chevron" size={14} />
            <strong>
              {playing
                ? "Mission"
                : navigation.find((n) => n.id === view)?.name}
            </strong>
          </div>
          <div className="player-stats">
            <span className="coin-stat" title="Werkstattmarken">
              <Icon name="coins" size={18} />
              <b>{state.marks}</b>
              <span>Marken</span>
            </span>
            <span className="xp-stat" data-testid="xp-total">
              <Icon name="zap" size={17} />
              {state.xp} XP
            </span>
            <span className="avatar" aria-label={`Spielerlevel ${level}`}>
              {String(level).padStart(2, "0")}
            </span>
          </div>
        </header>
        <main id="main-content">
          {error && (
            <div className="banner error" role="alert">
              <Icon name="info" />
              {error}
              <button
                aria-label="Fehlermeldung schließen"
                onClick={() => setError("")}
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          )}
          {notice && (
            <div className="banner" role="status">
              <Icon name="info" />
              {notice}
              <button
                aria-label="Hinweis schließen"
                onClick={() => setNotice("")}
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          )}
          {updateReady && (
            <div className="banner">
              <Icon name="download" />
              {state.session
                ? "Ein Update wartet. Schließe deine laufende Mission zuerst ab."
                : "Eine neue Version ist bereit."}
              <button
                disabled={!!state.session || busy}
                onClick={() => void update.current?.(true)}
              >
                Aktualisieren
              </button>
            </div>
          )}
          {playing && state.session ? (
            <QuestPlayer
              state={state}
              act={act}
              busy={busy}
              pause={() => {
                setPlaying(false);
                setView("map");
              }}
            />
          ) : state.lastResult ? (
            <section className="result-screen">
              <div className="result-medal">
                <Icon name="trophy" size={52} />
              </div>
              <span className="eyebrow">MISSION COMPLETE</span>
              <h1>Auftrag geschafft!</h1>
              <p>{findQuest(state.lastResult.questId)?.title}</p>
              <div className="reward-grid">
                <div>
                  <Icon name="zap" />
                  <b>+{state.lastResult.xp}</b>
                  <span>Erfahrungspunkte</span>
                </div>
                <div>
                  <Icon name="coins" />
                  <b>+{state.lastResult.marks}</b>
                  <span>Werkstattmarken</span>
                </div>
              </div>
              <p className="result-score">
                {state.lastResult.correct} von {state.lastResult.total} Aufgaben
                selbstständig richtig gelöst.
              </p>
              <div className="note">
                Du hast dir deinen Fortschritt verdient. Die Demo zählt zum
                Spiellevel; geprüfter Fachfortschritt folgt mit freigegebenen
                Inhalten.
              </div>
              <button
                className="primary"
                disabled={busy}
                onClick={() => {
                  void act({ type: "dismissResult" });
                  go("map");
                }}
              >
                Zur Karte
                <Icon name="arrow" />
              </button>
              <button
                className="quiet"
                disabled={busy}
                onClick={() => {
                  void act({ type: "dismissResult" });
                  go("workshop");
                }}
              >
                Belohnung in der Werkstatt nutzen
                <Icon name="wrench" />
              </button>
            </section>
          ) : view === "map" ? (
            <>
              <section className="page-heading">
                <div>
                  <div className="eyebrow">AUF GEHT’S, PROBLEMLÖSER.</div>
                  <h1>
                    Dein nächstes Level wartet<span>.</span>
                  </h1>
                  <p>
                    Kleine Missionen. Neue Fähigkeiten. Deine eigene Werkstatt.
                  </p>
                </div>
                <span className="demo-pill">
                  <span />
                  SPIELBARE DEMO
                </span>
              </section>
              <section className="hero">
                <div className="hero-copy">
                  <span className="hero-tag">
                    <Icon name="flame" size={16} />
                    KAPITEL 01 · GAS
                  </span>
                  <h2>
                    {state.session
                      ? "Dein Auftrag\nwartet auf dich."
                      : state.completed.length === 5
                        ? "Gut gemacht.\nWerkstatt ausbauen!"
                        : "Aus Neugier\nwird Können."}
                  </h2>
                  <p>
                    {state.session
                      ? "Mach genau dort weiter, wo du aufgehört hast. Dein Fortschritt ist gespeichert."
                      : "Übernimm deinen ersten Einsatz und mach aus einer kleinen Werkstatt etwas Großes."}
                  </p>
                  <button
                    className="primary dark"
                    disabled={busy}
                    onClick={() =>
                      void enter(state.session?.questId ?? next.id)
                    }
                  >
                    <Icon name="play" size={17} />
                    {state.session
                      ? "Weiterspielen"
                      : state.completed.length === 5
                        ? "Erneut spielen"
                        : "Quest starten"}
                    <Icon name="arrow" size={18} />
                  </button>
                  <span className="hero-time">
                    <Icon name="compass" size={14} />
                    {state.session
                      ? "Fortschritt gespeichert"
                      : `${next.minutes} Minuten · in deinem Tempo`}
                  </span>
                </div>
                <div className="hero-art">
                  <WorkshopArt hero />
                  <div className="art-sticker">
                    <Icon name="star" size={17} />
                    <span>
                      DEIN BETRIEB.
                      <br />
                      <b>DEIN ABENTEUER.</b>
                    </span>
                  </div>
                </div>
                <span className="hero-number">01</span>
              </section>
              <div className="dashboard-grid">
                <section className="journey panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">DIE ERSTEN SCHRITTE</span>
                      <h2>Deine Quest-Route</h2>
                    </div>
                    <span className="count-pill">
                      {state.completed.length} / 5
                    </span>
                  </div>
                  <div className="track-tabs">
                    <span className="selected">
                      <Icon name="flame" size={16} />
                      Gas · TRGI
                    </span>
                    <span>
                      <Icon name="droplets" size={16} />
                      Wasser · TRWI<small>Kommt später</small>
                    </span>
                  </div>
                  {state.session && (
                    <p className="route-notice">
                      Schließe deine laufende Mission ab, bevor du einen anderen
                      Auftrag startest.
                    </p>
                  )}
                  <div className="quest-route">
                    <div className="route-line" />
                    {quests.map((q, i) => {
                      const done = state.completed.includes(q.id),
                        open = isUnlocked(state, q.id);
                      return (
                        <button
                          key={q.id}
                          className={`quest-node ${done ? "completed" : open ? "available" : "locked"} ${q.boss ? "boss" : ""}`}
                          disabled={
                            !open ||
                            busy ||
                            (!!state.session && state.session.questId !== q.id)
                          }
                          aria-label={`Mission öffnen: ${q.title}`}
                          onClick={() => void enter(q.id)}
                        >
                          <span className="quest-circle">
                            <Icon
                              name={done ? "check" : !open ? "lock" : q.icon}
                              size={q.boss ? 26 : 23}
                            />
                            {open && !done && <span className="node-ping" />}
                          </span>
                          <span className="quest-copy">
                            <small>
                              {q.boss ? "BOSS-MISSION" : `MISSION 0${i + 1}`}
                              {done ? " · ERLEDIGT" : ""}
                            </small>
                            <strong>{q.title}</strong>
                            <span>{q.subtitle}</span>
                          </span>
                          <span className="quest-meta">
                            {done ? (
                              <Icon name="replay" size={17} />
                            ) : open ? (
                              <Icon name="arrow" size={20} />
                            ) : (
                              <span>{q.minutes} min</span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="chapter-note">
                    <Icon name="shield" size={17} />
                    <span>
                      Weitere Kapitel folgen. Du kannst jede Mission
                      wiederholen.
                    </span>
                  </div>
                </section>
                <aside className="dashboard-aside">
                  <section className="workshop-preview panel">
                    <div className="panel-heading">
                      <div>
                        <span className="eyebrow">DEIN HAUPTQUARTIER</span>
                        <h2>Die Werkstatt</h2>
                      </div>
                      <Icon name="house" />
                    </div>
                    <WorkshopArt purchases={state.purchases} />
                    <div className="workshop-level">
                      <strong>
                        {state.purchases.length === 0
                          ? "Klein anfangen. Groß werden."
                          : state.purchases.length === 3
                            ? "Bereit für große Dinge."
                            : "Deine Werkstatt wächst."}
                      </strong>
                      <span>{state.purchases.length} / 3 Ausbauten</span>
                    </div>
                    <div className="upgrade-dots">
                      {upgrades.map((u) => (
                        <span
                          key={u.id}
                          className={
                            state.purchases.includes(u.id) ? "owned" : ""
                          }
                        >
                          <Icon name={u.icon} size={18} />
                        </span>
                      ))}
                    </div>
                    <button
                      className="secondary full"
                      onClick={() => go("workshop")}
                    >
                      Werkstatt ansehen
                      <Icon name="arrow" size={17} />
                    </button>
                  </section>
                  <section className="next-reward">
                    <div className="reward-icon">
                      <Icon name="coins" size={25} />
                    </div>
                    <div>
                      <span className="eyebrow">DEINE NÄCHSTE BELOHNUNG</span>
                      <strong>
                        {upgrades.find((u) => !state.purchases.includes(u.id))
                          ?.name ?? "Alle Ausbauten freigeschaltet"}
                      </strong>
                      <p>
                        {upgrades.find((u) => !state.purchases.includes(u.id))
                          ?.cost ?? 0}{" "}
                        Marken · durch Quests verdienen
                      </p>
                    </div>
                  </section>
                  <p className="demo-note">
                    <Icon name="info" size={16} />
                    Originale Demo-Aufgaben. Fachliche Freigabe und vollständige
                    Prüfungsvorbereitung folgen.
                  </p>
                </aside>
              </div>
            </>
          ) : view === "workshop" ? (
            <>
              <section className="page-heading">
                <div>
                  <span className="eyebrow">DEIN HAUPTQUARTIER</span>
                  <h1>
                    Hier wächst etwas<span>.</span>
                  </h1>
                  <p>Jeder Auftrag bringt dich deinem nächsten Ausbau näher.</p>
                </div>
                <span className="count-pill">
                  {state.purchases.length} / 3 Ausbauten
                </span>
              </section>
              <section className="workshop-stage panel">
                <WorkshopArt purchases={state.purchases} />
                <div>
                  <span className="eyebrow">DEINE WERKSTATT</span>
                  <h2>
                    {state.purchases.length === 3
                      ? "Voll ausgestattet."
                      : "Vom Anfang zum Aufstieg."}
                  </h2>
                  <p>
                    Verdiene Marken durch Missionen und richte deinen eigenen
                    Ort ein.
                  </p>
                  <span className="balance">
                    <Icon name="coins" />
                    {state.marks} Marken verfügbar
                  </span>
                </div>
              </section>
              <div className="upgrade-grid">
                {upgrades.map((u, i) => {
                  const owned = state.purchases.includes(u.id);
                  return (
                    <article
                      className={`upgrade-card panel ${owned ? "owned" : ""}`}
                      key={u.id}
                    >
                      <div className="upgrade-card-top">
                        <span className="upgrade-icon">
                          <Icon name={u.icon} size={30} />
                        </span>
                        <small>0{i + 1}</small>
                      </div>
                      <h2>{u.name}</h2>
                      <p>{u.description}</p>
                      <button
                        className={owned ? "secondary" : "primary"}
                        disabled={owned || state.marks < u.cost || busy}
                        aria-label={`${u.name} freischalten`}
                        onClick={() => void act({ type: "buy", id: u.id })}
                      >
                        {owned ? (
                          <>
                            <Icon name="check" />
                            Freigeschaltet
                          </>
                        ) : (
                          <>
                            <Icon name="coins" />
                            {u.cost} Marken
                            <Icon name="arrow" />
                          </>
                        )}
                      </button>
                      {!owned && state.marks < u.cost && (
                        <small>
                          Noch {u.cost - state.marks} Marken bis zum Ausbau
                        </small>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          ) : view === "progress" ? (
            <>
              <section className="page-heading">
                <div>
                  <span className="eyebrow">SCHRITT FÜR SCHRITT</span>
                  <h1>
                    Sieh, wie weit du bist<span>.</span>
                  </h1>
                  <p>Dein Spiel wächst mit jeder Mission.</p>
                </div>
              </section>
              <section className="progress-hero panel">
                <span className="big-level">
                  {String(level).padStart(2, "0")}
                </span>
                <div>
                  <span className="eyebrow">DEIN SPIELERLEVEL</span>
                  <h2>
                    {
                      [
                        "",
                        "Neugieriger Starter",
                        "Auftragstalent",
                        "Werkstattbauer",
                        "Quest-Profi",
                      ][Math.min(level, 4)]
                    }
                  </h2>
                  <div className="xp-bar">
                    <span style={{ width: `${(state.xp % 200) / 2}%` }} />
                  </div>
                  <p>{state.xp % 200} / 200 XP zum nächsten Level</p>
                </div>
                <Icon name="trophy" size={64} />
              </section>
              <div className="stat-grid">
                <article className="panel">
                  <Icon name="done" />
                  <b>{state.completed.length} / 5</b>
                  <span>Missionen geschafft</span>
                </article>
                <article className="panel">
                  <Icon name="wrench" />
                  <b>{state.purchases.length} / 3</b>
                  <span>Werkstattausbauten</span>
                </article>
                <article className="panel">
                  <Icon name="zap" />
                  <b>{state.xp}</b>
                  <span>XP gesammelt</span>
                </article>
              </div>
              <section className="panel mastery-panel">
                <Icon name="book" size={27} />
                <div>
                  <h2>Spiellevel & Fachwissen</h2>
                  <p>
                    Die aktuellen Aufgaben sind eine Demo. Sie erhöhen dein
                    Spiellevel, zählen aber noch nicht als fachlich gefestigte
                    Lernziele.
                  </p>
                  <p>
                    Mit geprüften Inhalten werden unsichere Themen als
                    Wiederholungsquests vorgeschlagen. Eine Aussage zur
                    Prüfungsreife ist hier noch nicht möglich.
                  </p>
                </div>
                <span className="tag">In Vorbereitung</span>
              </section>
            </>
          ) : (
            <>
              <section className="page-heading">
                <div>
                  <span className="eyebrow">SO, WIE ES ZU DIR PASST</span>
                  <h1>
                    Dein Spiel. Dein Tempo<span>.</span>
                  </h1>
                  <p>Alles lokal auf deinem Gerät. Kein Konto erforderlich.</p>
                </div>
              </section>
              <section className="panel settings-panel">
                <h2>Spielgefühl</h2>
                <label className="setting-row">
                  <span>
                    <strong>Weniger Bewegung</strong>
                    <small>Belohnungen und Übergänge ohne Animationen.</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={state.settings.reducedMotion}
                    disabled={busy}
                    onChange={(e) =>
                      void act({
                        type: "settings",
                        settings: { reducedMotion: e.target.checked },
                      })
                    }
                  />
                </label>
                <label className="setting-row">
                  <span>
                    <strong>Belohnungston</strong>
                    <small>Ein kurzer Klang bei Erfolgen und Ausbauten.</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={state.settings.sound}
                    disabled={busy}
                    onChange={(e) =>
                      void act({
                        type: "settings",
                        settings: { sound: e.target.checked },
                      })
                    }
                  />
                </label>
              </section>
              <section className="panel settings-panel">
                <h2>Deinen Fortschritt mitnehmen</h2>
                <p>
                  Browserdaten können gelöscht werden. Sichere deinen Spielstand
                  regelmäßig als Datei. Ein Import ersetzt deinen aktuellen
                  Stand erst nach deiner Bestätigung.
                </p>
                <div className="settings-actions">
                  <button
                    className="secondary"
                    onClick={exportFile}
                    disabled={busy}
                  >
                    <Icon name="download" />
                    Sicherung exportieren
                  </button>
                  <label className="secondary upload-button">
                    <Icon name="upload" />
                    Sicherung importieren
                    <input
                      aria-label="Sicherung importieren"
                      type="file"
                      accept="application/json,.json"
                      disabled={busy}
                      onChange={(e) => {
                        void importFile(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                {candidate && (
                  <div className="import-preview">
                    <h3>Sicherung übernehmen?</h3>
                    {importRecovery && (
                      <p>
                        Ältere Missionsstände werden neu gestartet. Bereits
                        verdiente Belohnungen bleiben erhalten.
                      </p>
                    )}
                    <p>
                      {candidate.xp} XP · {candidate.completed.length} Missionen
                      · {candidate.purchases.length} Ausbauten
                    </p>
                    <p>Dein aktueller Stand wird ersetzt.</p>
                    <button
                      className="primary"
                      disabled={busy}
                      onClick={() => void confirmImport()}
                    >
                      Spielstand ersetzen
                    </button>
                    <button
                      className="quiet"
                      disabled={busy}
                      onClick={() => setCandidate(null)}
                    >
                      Abbrechen
                    </button>
                  </div>
                )}
              </section>
              <section className="panel settings-panel">
                <h2>Als App nutzen</h2>
                <p>
                  Auf dem iPhone: Öffne die veröffentlichte App in Safari, tippe
                  auf Teilen und dann auf „Zum Home-Bildschirm“. Für die
                  Installation wird eine HTTPS-Adresse benötigt.
                </p>
                <div className="offline-status">
                  <span className="status-dot" />
                  {offlineReady
                    ? "Offline bereit"
                    : !online
                      ? "Offline-Modus aktiv"
                      : "Offline-Dateien werden beim ersten Besuch gespeichert."}
                </div>
                <p className="muted">
                  Version 0.1 · Kapitel-Demo · TRWI und weitere TRGI-Kapitel
                  folgen.
                </p>
              </section>
            </>
          )}
          {!playing && !state.lastResult && (
            <footer className="page-footer">
              <span>LERNQUEST · MIT JEDEM AUFTRAG WEITER.</span>
              <span>Dein Tempo. Dein Weg.</span>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}
