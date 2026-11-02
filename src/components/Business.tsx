import { useState } from "react";
import { contracts, upgrades } from "../game/content";
import { isUnlocked } from "../game/engine";
import type { GameState } from "../game/types";
import { Icon } from "./Icon";
const districts = ["Wohnviertel", "Altstadt", "Neubaugebiet", "Gewerbepark"];
export function Garage({ purchases }: { purchases: string[] }) {
  return (
    <section className="garage panel">
      <div className="eyebrow">DEIN FUHRPARK</div>
      <h2>Bereit für den nächsten Einsatz</h2>
      <div className="fleet-grid">
        {["service-car", "van", "fleet"].map((id, i) => {
          const owned = purchases.includes(id);
          return (
            <div key={id} className={`vehicle ${owned ? "owned" : ""}`}>
              <svg
                viewBox="0 0 260 130"
                role="img"
                aria-label={upgrades.find((u) => u.id === id)!.name}
              >
                <path
                  d={
                    i === 0
                      ? "M25 92V71L57 64 81 36H157L190 65 231 75V99H25Z"
                      : "M23 99V28H168V55H205L235 84V99Z"
                  }
                  fill={
                    owned ? ["#c6e78e", "#80c9ce", "#e4b77e"][i] : "#52656a"
                  }
                  stroke="#142428"
                  strokeWidth="4"
                />
                <path
                  d={
                    i === 0
                      ? "M88 44H151L173 64H72Z"
                      : "M177 63H200L220 83H177Z"
                  }
                  fill="#203c47"
                />
                <path d="M30 87H155" stroke="#142428" strokeWidth="3" />
                <circle cx="65" cy="101" r="19" fill="#142428" />
                <circle cx="204" cy="101" r="19" fill="#142428" />
                <circle cx="65" cy="101" r="8" fill="#afc4c5" />
                <circle cx="204" cy="101" r="8" fill="#afc4c5" />
              </svg>
              <strong>{upgrades.find((u) => u.id === id)!.name}</strong>
              <small>
                {owned ? "In deinem Betrieb" : "Noch nicht gekauft"}
              </small>
            </div>
          );
        })}
      </div>
    </section>
  );
}
export function Business({
  state,
  busy,
  enter,
  shop,
}: {
  state: GameState;
  busy: boolean;
  enter: (id: string) => void;
  shop: () => void;
}) {
  const [district, setDistrict] = useState(districts[0]);
  const completed = contracts.filter((q) =>
    state.rewarded.includes(`contract:${q.id}`),
  ).length;
  return (
    <section className="business panel">
      <div className="business-heading">
        <div>
          <span className="eyebrow">DEIN BETRIEB · DEINE STADT</span>
          <h2>Heute wartet ein neuer Kunde.</h2>
        </div>
        <span className="count-pill">
          {completed} / {contracts.length} Aufträge
        </span>
      </div>
      <p>
        Fachfragen werden zu Kundenaufträgen. 4 von 5 selbstständig richtig: +40
        Marken und +120 XP beim ersten Erfolg. Kostenlose Nachbesserung.
        Kursübungen, keine bestätigten Original-Prüfungsfragen.
      </p>
      <div className="town-map">
        <svg
          viewBox="0 0 700 320"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <rect width="700" height="320" fill="#244139" />
          <path
            d="M0 220Q180 100 350 270T700 190"
            stroke="#477b89"
            strokeWidth="40"
            fill="none"
          />
          <path
            d="M0 80H700M110 0V320M430 0V320M0 270H700"
            stroke="#829184"
            strokeWidth="18"
            fill="none"
          />
          {[
            [200, 25],
            [260, 25],
            [540, 30],
            [580, 75],
            [35, 145],
            [170, 140],
            [280, 130],
            [500, 240],
            [570, 245],
          ].map(([x, y], i) => (
            <g key={i}>
              <rect x={x} y={y} width="45" height="40" rx="5" fill="#9bab83" />
              <path d={`M${x - 5} ${y + 5}l27-22 28 22Z`} fill="#b5c4a0" />
            </g>
          ))}
        </svg>
        {districts.map((d, i) => (
          <button
            key={d}
            className={`district district-${i} ${d === district ? "selected" : ""}`}
            aria-pressed={d === district}
            onClick={() => setDistrict(d)}
          >
            <Icon name={["house", "wrench", "hammer", "briefcase"][i]} />
            {d}
          </button>
        ))}
      </div>
      <div className="business-balance">
        <span>
          <Icon name="coins" /> {state.marks} Marken
        </span>
        <button className="secondary" onClick={shop}>
          Fuhrpark & Werkstatt <Icon name="arrow" />
        </button>
      </div>
      <p className="economy-hint">
        Noch zu wenig Marken? Der Lernpfad unter der Stadtkarte bleibt
        kostenlos. Neue Kursmissionen bringen ebenfalls Marken für deinen
        nächsten Kauf.
      </p>
      <h3>Aufträge: {district}</h3>
      <div className="contract-grid">
        {contracts
          .filter((q) => q.contract!.district === district)
          .map((q) => {
            const open = isUnlocked(state, q.id),
              done = state.rewarded.includes(`contract:${q.id}`);
            const missing = q.contract!.requires.filter(
              (id) => !state.purchases.includes(id),
            );
            return (
              <article className="contract-card" key={q.id}>
                <span className="eyebrow">
                  {done
                    ? "ERLEDIGT · FREI ÜBEN"
                    : open
                      ? "ANFRAGE EINGEGANGEN"
                      : "AUSSTATTUNG FEHLT"}
                </span>
                <h3>{q.title}</h3>
                <small>{q.client} · 5 Aufgaben</small>
                <p>{q.contract!.brief}</p>
                {missing.length > 0 && (
                  <p className="requirements">
                    Benötigt:{" "}
                    {missing
                      .map((id) => upgrades.find((u) => u.id === id)!.name)
                      .join(" + ")}
                  </p>
                )}
                <button
                  className={open ? "primary" : "secondary"}
                  disabled={busy || !!state.session || !open}
                  onClick={() => enter(q.id)}
                >
                  {done ? "Auftrag üben" : "Auftrag annehmen"}
                  <Icon name={open ? "arrow" : "lock"} />
                </button>
              </article>
            );
          })}
      </div>
      {state.session && (
        <p>
          Schließe deine laufende Mission ab, bevor du einen Kundenauftrag
          startest.
        </p>
      )}
    </section>
  );
}
