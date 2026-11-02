import { useEffect, useRef, useState } from "react";
import type { Action, GameState } from "../game/types";
import { findQuest } from "../game/content";
import { Icon } from "./Icon";
export function QuestPlayer({
  state,
  act,
  busy,
  pause,
}: {
  state: GameState;
  act: (a: Action) => Promise<void>;
  busy: boolean;
  pause: () => void;
}) {
  const session = state.session!,
    quest = findQuest(session.questId)!,
    q = quest.questions[session.index];
  const result = session.answers[session.index],
    selected = session.selection;
  const [textOnly, setTextOnly] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  useEffect(() => {
    title.current?.focus();
  }, [q.id]);
  useEffect(() => {
    if (result) feedback.current?.focus();
  }, [result]);
  const select = (id: string) => {
    const answer =
      q.kind === "choice" && q.correct.length === 1
        ? [id]
        : selected.includes(id)
          ? selected.filter((x) => x !== id)
          : [...selected, id];
    void act({ type: "select", answer });
  };
  const move = (index: number, step: number) => {
    const answer = [...selected];
    [answer[index], answer[index + step]] = [
      answer[index + step],
      answer[index],
    ];
    void act({ type: "select", answer });
  };
  return (
    <section className="player">
      <div className="quest-top">
        <button className="quiet" onClick={pause} disabled={busy}>
          <Icon name="pause" />
          Pause & Karte
        </button>
        <span>
          {quest.boss ? "BOSS-MISSION" : "QUEST"}{" "}
          <b>
            {session.index + 1} / {quest.questions.length}
          </b>
        </span>
      </div>
      <div
        className="segment-progress"
        aria-label={`Aufgabe ${session.index + 1} von ${quest.questions.length}`}
      >
        {quest.questions.map((_, i) => (
          <span
            key={i}
            className={
              i < session.index ? "done" : i === session.index ? "current" : ""
            }
          />
        ))}
      </div>
      <div className="player-client">
        <span className="avatar small">{quest.client[0]}</span>
        <div>
          <strong>{quest.client}</strong>
          <span>{quest.title}</span>
        </div>
        <span className="tag">Demo</span>
      </div>
      <div className="task-panel">
        <span className="eyebrow">
          {q.kind === "order"
            ? "BRING ORDNUNG REIN"
            : q.kind === "scene"
              ? "AUF SPURENSUCHE"
              : "DEINE ENTSCHEIDUNG"}
        </span>
        <h1 ref={title} tabIndex={-1}>
          {q.title}
        </h1>
        <p className="task-prompt">{q.prompt}</p>
        <div className="answer-instruction">
          {q.kind === "order"
            ? "Tippe die Schritte in der richtigen Reihenfolge an."
            : q.correct.length > 1
              ? `${q.correct.length} Antworten auswählen`
              : "Eine Antwort auswählen"}
          {q.kind === "scene" && (
            <button
              className="text-button"
              onClick={() => setTextOnly(!textOnly)}
            >
              {textOnly ? "Szene anzeigen" : "Nur Text anzeigen"}
            </button>
          )}
        </div>
        {q.kind === "scene" && !textOnly && (
          <div
            className="scene"
            aria-label="Symbolischer Technikraum, die Befunde stehen in der Auswahlliste"
          >
            <svg viewBox="0 0 600 230" aria-hidden="true">
              <path
                d="M0 210H600M40 0V180H190V225M550 0V60H410V120"
                stroke="#788f86"
                strokeWidth="12"
                fill="none"
              />
              <rect
                x="220"
                y="35"
                width="155"
                height="170"
                rx="12"
                fill="#526b62"
              />
              <rect
                x="237"
                y="51"
                width="121"
                height="90"
                rx="5"
                fill="#a7bca8"
              />
              <circle cx="298" cy="95" r="25" fill="#274c41" />
              <path d="m298 95 10-13" stroke="#d5f793" strokeWidth="3" />
              <rect
                x="240"
                y="160"
                width="48"
                height="21"
                rx="3"
                fill="#d6ddca"
              />
              <path
                d="m100 176 20-20m-20 0 20 20"
                stroke="#ddaf73"
                strokeWidth="6"
              />
              <rect x="450" y="140" width="85" height="70" fill="#af8655" />
            </svg>
            {q.options.map((o, i) => (
              <span
                className="scene-label"
                key={o.id}
                style={{
                  left: `${[17, 80, 50][i]}%`,
                  top: `${[58, 40, 67][i]}%`,
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
            ))}
            <small>Symbolische Ansicht · Befunde unten auswählen</small>
          </div>
        )}
        <fieldset disabled={busy || !!result} className="answer-list">
          <legend className="sr-only">Antworten</legend>
          {q.options.map((o, i) => {
            const index = selected.indexOf(o.id);
            return (
              <button
                type="button"
                key={o.id}
                className={`answer ${index >= 0 ? "selected" : ""} ${result && q.correct.includes(o.id) ? "correct-answer" : ""}`}
                aria-label={o.text}
                aria-pressed={index >= 0}
                onClick={() => select(o.id)}
              >
                <span className="answer-letter">
                  {q.kind === "order" && index >= 0
                    ? index + 1
                    : String.fromCharCode(65 + i)}
                </span>
                <span>{o.text}</span>
                {index >= 0 && <Icon name="check" size={18} />}
              </button>
            );
          })}
        </fieldset>
        {q.kind === "order" && selected.length > 0 && !result && (
          <div className="order-preview">
            <span className="eyebrow">DEINE REIHENFOLGE</span>
            {selected.map((id, i) => (
              <div key={id}>
                <b>{i + 1}</b>
                <span>{q.options.find((o) => o.id === id)!.text}</span>
                <button
                  className="order-move"
                  disabled={busy || i === 0}
                  aria-label={`Schritt ${i + 1} nach oben`}
                  onClick={() => move(i, -1)}
                >
                  ↑
                </button>
                <button
                  className="order-move"
                  disabled={busy || i === selected.length - 1}
                  aria-label={`Schritt ${i + 1} nach unten`}
                  onClick={() => move(i, 1)}
                >
                  ↓
                </button>
              </div>
            ))}
          </div>
        )}
        {session.hinted && !result && (
          <div className="hint">
            <Icon name="hint" />
            <p>{q.hint}</p>
          </div>
        )}
        {result ? (
          <div
            className={`feedback ${result.correct ? "positive" : ""}`}
            ref={feedback}
            tabIndex={-1}
            role="status"
          >
            <div>
              <Icon name={result.correct ? "done" : "hint"} size={25} />
              <h2>{result.correct ? "Gut gelöst!" : "Jetzt wird’s klar."}</h2>
            </div>
            <p>{q.explanation}</p>
            {!result.correct && (
              <p className="solution">
                <b>
                  {q.kind === "order"
                    ? "Richtige Reihenfolge:"
                    : "Passende Antwort:"}
                </b>{" "}
                {q.correct
                  .map((id) => q.options.find((o) => o.id === id)!.text)
                  .join(q.kind === "order" ? " → " : " · ")}
              </p>
            )}
            {result.hinted && (
              <small>Mit Hinweis gelöst. Das zählt als Übung.</small>
            )}
            <button
              className="primary"
              disabled={busy}
              onClick={() =>
                void act({
                  type:
                    session.index === quest.questions.length - 1
                      ? "finish"
                      : "next",
                })
              }
            >
              {session.index === quest.questions.length - 1
                ? "Quest abschließen"
                : "Weiter"}
              <Icon name="arrow" />
            </button>
          </div>
        ) : (
          <div className="task-actions">
            <button
              className="quiet"
              disabled={busy || session.hinted}
              onClick={() => void act({ type: "hint" })}
            >
              <Icon name="hint" />
              Hinweis
            </button>
            <button
              className="primary"
              disabled={
                busy ||
                !selected.length ||
                (q.kind === "order" && selected.length !== q.options.length)
              }
              onClick={() =>
                void act({
                  type: "submit",
                  answer: selected,
                  now: new Date().toISOString(),
                })
              }
            >
              Antwort prüfen
              <Icon name="arrow" />
            </button>
          </div>
        )}
        <details className="source">
          <summary>Quelle & Inhaltsstatus</summary>
          <p>{q.source}</p>
          <p>
            Diese Demo ist keine Arbeitsanweisung oder offizielle Prüfungsfrage.
            Inhalt: {q.id}, Version {q.version}.
          </p>
        </details>
      </div>
    </section>
  );
}
