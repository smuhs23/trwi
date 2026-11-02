import { useEffect, useRef, useState } from "react";
import type { Action, GameState } from "../game/types";
import { findQuest } from "../game/content";
import { SceneDetails } from "./SceneDetails";
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
        {q.kind === "scene" && <SceneDetails questionId={q.id} textOnly={textOnly} />}
        <fieldset disabled={busy || !!result} className="answer-list">
          <legend className="sr-only">Antworten</legend>
          {q.options.map((o, i) => {
            const index = selected.indexOf(o.id);
            const checked = result ? result.answer.indexOf(o.id) : index;
            const right = q.kind === "order" ? checked === q.correct.indexOf(o.id) : q.correct.includes(o.id);
            const wrong = !!result && checked >= 0 && !right;
            const label = !result ? "" : q.kind === "order"
              ? right ? "Richtige Position" : `Falsche Position · richtig: ${q.correct.indexOf(o.id) + 1}`
              : checked >= 0 ? right ? "Deine Antwort: richtig" : "Deine Antwort: falsch"
              : right ? "Richtig, nicht ausgewählt" : "";
            return (
              <button
                type="button"
                key={o.id}
                className={`answer ${!result && index >= 0 ? "selected" : ""} ${result && right ? "correct-answer" : ""} ${wrong ? "wrong-answer" : ""}`}
                aria-label={o.text}
                aria-pressed={index >= 0}
                onClick={() => select(o.id)}
              >
                <span className="answer-letter">
                  {q.kind === "order" && index >= 0
                    ? index + 1
                    : String.fromCharCode(65 + i)}
                </span>
                <span>{o.text}{label && <strong className="answer-verdict">{label}</strong>}</span>
                {result ? (wrong ? <Icon name="close" /> : right ? <Icon name="check" /> : null) : index >= 0 && <span className="selection-dot" aria-label="Ausgewählt">●</span>}
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
            className={`feedback ${result.correct ? "positive" : "negative"}`}
            ref={feedback}
            tabIndex={-1}
            role="status"
          >
            <div>
              <Icon name={result.correct ? "done" : "close"} size={25} />
              <h2>{result.correct ? "Gut gelöst!" : "Nicht richtig"}</h2>
            </div>
            {!result.correct && <p>Das war noch nicht die richtige Lösung. Vergleiche deine Auswahl mit der Korrektur.</p>}
            <p>{q.explanation}</p>
            {!result.correct && (
              <p className="solution">
                <b>
                  {q.kind === "order"
                    ? "Richtige Reihenfolge:"
                    : "Richtige Antwort:"}
                </b>{" "}
                {q.correct
                  .map((id) => q.options.find((o) => o.id === id)!.text)
                  .join(q.kind === "order" ? " → " : " · ")}
              </p>
            )}
            {result.hinted && (
              <small>Hinweis genutzt. Das zählt als Übung.</small>
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
