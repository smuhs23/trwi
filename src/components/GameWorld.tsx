import { useEffect, useRef, useState } from "react";
import { contracts, findQuest, upgrades } from "../game/content";
import { isUnlocked } from "../game/engine";
import type { GameState, Quest } from "../game/types";
import { Icon } from "./Icon";
import "../game-world.css";

type Destination = "map" | "workshop" | "progress" | "settings";
type Sheet = "workshop" | "planning" | "warehouse" | "fleet" | "contracts";
type Props = {
  state: GameState;
  busy: boolean;
  purchaseError?: string;
  onNavigate: (destination: Destination) => void;
  onStart: (id: string) => void;
  onBuy: (id: string) => void;
};
const inventory: Record<Exclude<Sheet, "contracts">, string[]> = {
  workshop: ["wall", "bench", "diagnostics"],
  planning: ["planning"],
  warehouse: ["warehouse"],
  fleet: ["service-car", "test-kit", "van", "fleet"],
};
const titles: Record<Sheet, string> = {
  workshop: "Deine Werkstatt",
  planning: "Dein Planungsbüro",
  warehouse: "Dein Materiallager",
  fleet: "Dein Fuhrpark",
  contracts: "Post aus der Nachbarschaft",
};
const vehicleIds = ["service-car", "van", "fleet"];
const asset = (name: string) => `${import.meta.env.BASE_URL}art/${name}.webp`;

export function GameWorld({
  state,
  busy,
  purchaseError,
  onNavigate,
  onStart,
  onBuy,
}: Props) {
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [failedArt, setFailedArt] = useState<string[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const owned = (id: string) => state.purchases.includes(id);
  const paid = (id: string) => state.rewarded.includes(`contract:${id}`);
  const openJobs = contracts.filter((job) => isUnlocked(state, job.id));
  const nextJob = openJobs.find((job) => !paid(job.id));
  const running = state.session ? findQuest(state.session.questId) : undefined;
  const brief = contracts.find((job) => job.id === selectedJob);
  const shopItems =
    sheet && sheet !== "contracts"
      ? upgrades.filter((item) => inventory[sheet].includes(item.id))
      : [];
  const workshopLevel = inventory.workshop.filter(owned).length;
  const markArtFailed = (id: string) =>
    setFailedArt((current) =>
      current.includes(id) ? current : [...current, id],
    );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!sheet || !dialog) return;
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>(".gw-close")?.focus();
    return () => {
      dialog.close();
      openerRef.current?.focus();
    };
  }, [sheet]);

  const openSheet = (next: Sheet, job?: Quest) => {
    openerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setSelectedJob(job?.id ?? null);
    setSheet(next);
  };
  const closeSheet = () => setSheet(null);
  const startJob = (id: string) => {
    closeSheet();
    onStart(id);
  };

  return (
    <section
      className={`gw-world${state.settings.reducedMotion ? " gw-reduced-motion" : ""}`}
      aria-label="Dein Werkstatthof"
    >
      <h1 className="gw-visually-hidden">Dein Werkstatthof</h1>
      <div className="gw-scene">
        {!failedArt.includes("workshop-world") ? (
          <img
            className="gw-world-art"
            src={asset("workshop-world")}
            alt="Dein Werkstatthof mit Werkstatt, Planungsbüro und Materiallager vor den Häusern der Nachbarschaft."
            onError={() => markArtFailed("workshop-world")}
          />
        ) : (
          <div className="gw-art-fallback">
            <Icon name="house" size={76} />
            <p>Dein Werkstatthof</p>
            <small>Deine Gebäude sind über die Schaltflächen erreichbar.</small>
          </div>
        )}
        <div className="gw-vignette" aria-hidden="true" />
        <div className="gw-world-caption">
          <span className="gw-world-status" /> DEIN KLEINER BETRIEB
        </div>

        <button
          className="gw-customer-pin"
          onClick={() => openSheet("contracts")}
          aria-label="Kundenaufträge in der Nachbarschaft öffnen"
        >
          <span className="gw-pin-icon">
            <Icon name="briefcase" size={22} />
            {nextJob && <i aria-hidden="true" />}
          </span>
          <span>
            Nachbarschaft
            <small>
              {openJobs.filter((job) => !paid(job.id)).length} offene Anfragen
            </small>
          </span>
        </button>

        {workshopLevel > 0 && (
          <span
            className="gw-upgrade-flag gw-workshop-flag"
            aria-label={`${workshopLevel} Werkstattausbauten gekauft`}
          >
            <Icon name="star" size={13} /> {workshopLevel}
          </span>
        )}
        {owned("planning") && (
          <span
            className="gw-upgrade-flag gw-planning-flag"
            aria-label="Planungsbüro gekauft"
          >
            <Icon name="check" size={14} />
          </span>
        )}
        {owned("warehouse") && (
          <span
            className="gw-upgrade-flag gw-warehouse-flag"
            aria-label="Materiallager gekauft"
          >
            <Icon name="check" size={14} />
          </span>
        )}

        <button
          className={`gw-building gw-workshop${workshopLevel ? " gw-built" : ""}`}
          onClick={() => openSheet("workshop")}
          aria-label="Werkstatt ausbauen"
        >
          <span className="gw-building-icon">
            <Icon name="wrench" size={18} />
          </span>
          <span>
            Werkstatt<small>{workshopLevel}/3 Ausbauten</small>
          </span>
          <Icon name="chevron" size={14} />
        </button>
        <button
          className={`gw-building gw-planning${owned("planning") ? " gw-built" : ""}`}
          onClick={() => openSheet("planning")}
          aria-label="Planungsbüro ausbauen"
        >
          <span className="gw-building-icon">
            <Icon name="monitor" size={17} />
          </span>
          <span>
            Planung<small>{owned("planning") ? "Ausgebaut" : "Ausbauen"}</small>
          </span>
        </button>
        <button
          className={`gw-building gw-warehouse${owned("warehouse") ? " gw-built" : ""}`}
          onClick={() => openSheet("warehouse")}
          aria-label="Materiallager ausbauen"
        >
          <span className="gw-building-icon">
            <Icon name="house" size={17} />
          </span>
          <span>
            Lager<small>{owned("warehouse") ? "Ausgebaut" : "Ausbauen"}</small>
          </span>
        </button>

        <div className="gw-vehicles" aria-label="Gekaufte Einsatzfahrzeuge">
          {vehicleIds.filter(owned).map((id) =>
            failedArt.includes(id) ? (
              <span
                key={id}
                className={`gw-vehicle gw-vehicle-${id} gw-vehicle-fallback`}
              >
                <Icon name={id === "service-car" ? "car" : "truck"} size={40} />
                <small>{upgrades.find((item) => item.id === id)!.name}</small>
              </span>
            ) : (
              <img
                key={id}
                className={`gw-vehicle gw-vehicle-${id}`}
                src={asset(id)}
                alt={upgrades.find((item) => item.id === id)!.name}
                onError={() => markArtFailed(id)}
              />
            ),
          )}
        </div>
        {owned("test-kit") && (
          <span className="gw-kit" aria-label="Mobiler Messkoffer gekauft">
            <Icon name="briefcase" size={15} />
            <Icon name="check" size={11} />
          </span>
        )}
        <button className="gw-fleet-button" onClick={() => openSheet("fleet")}>
          <Icon name="truck" size={20} />
          <span>Fuhrpark</span>
          <span className="gw-fleet-count">
            {vehicleIds.filter(owned).length}/3
          </span>
        </button>
        <button
          className="gw-learning-button"
          onClick={() => onNavigate("map")}
        >
          <Icon name="book" size={18} />
          Zum Lernpfad
          <Icon name="arrow" size={15} />
        </button>
      </div>

      <div className="gw-mission-card">
        <div
          className={`gw-client-avatar${running ? " gw-avatar-running" : ""}`}
          aria-hidden="true"
        >
          <Icon name={running ? "play" : "briefcase"} size={25} />
        </div>
        <div className="gw-mission-copy">
          <span className="gw-eyebrow">
            {running
              ? "DEIN EINSATZ LÄUFT"
              : nextJob
                ? "EIN KUNDE WARTET"
                : "GUT GEMACHT"}
          </span>
          <h2>
            {running?.title ??
              nextJob?.title ??
              "Zeit für deinen nächsten Ausbau"}
          </h2>
          <p>
            {running
              ? `${state.session!.index + 1} / ${running.questions.length} Aufgaben`
              : nextJob
                ? `${nextJob.client} · ${nextJob.minutes} Min.`
                : "Mit neuer Ausstattung erreichst du neue Kunden."}
          </p>
        </div>
        <button
          className="gw-mission-cta"
          disabled={busy}
          onClick={() =>
            running
              ? onStart(running.id)
              : nextJob
                ? openSheet("contracts", nextJob)
                : openSheet("fleet")
          }
          aria-label={
            running
              ? "Weiterspielen"
              : nextJob
                ? "Kundenauftrag ansehen"
                : "Fuhrpark ausbauen"
          }
        >
          <span>
            {running ? "Weiterspielen" : nextJob ? "Ansehen" : "Ausbauen"}
          </span>
          <Icon name="arrow" size={19} />
        </button>
      </div>

      {sheet && (
        <dialog
          ref={dialogRef}
          className="gw-dialog"
          aria-modal="true"
          aria-labelledby="gw-sheet-title"
          onCancel={closeSheet}
          onClose={closeSheet}
        >
          <div className="gw-sheet-header">
            <div>
              <span className="gw-eyebrow">
                {sheet === "contracts"
                  ? "DEIN NÄCHSTER EINSATZ"
                  : "INVESTIERE IN DEINEN BETRIEB"}
              </span>
              <h2 id="gw-sheet-title">{titles[sheet]}</h2>
            </div>
            <button
              className="gw-close"
              onClick={closeSheet}
              aria-label="Schließen"
            >
              <Icon name="close" />
            </button>
          </div>
          {sheet !== "contracts" && purchaseError && (
            <p className="gw-purchase-error" role="alert">
              {purchaseError}
            </p>
          )}
          {sheet !== "contracts" ? (
            <>
              <div className="gw-sheet-balance">
                <Icon name="coins" size={20} />
                <strong>{state.marks} Marken</strong>
                <span>verfügbar</span>
              </div>
              <div className="gw-shop-list">
                {shopItems.map((item) => (
                  <article
                    className={`gw-shop-item${owned(item.id) ? " gw-item-owned" : ""}`}
                    key={item.id}
                  >
                    <div className="gw-item-icon">
                      <Icon name={item.icon} size={25} />
                    </div>
                    <div className="gw-item-copy">
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <button
                        className="gw-buy"
                        disabled={
                          busy || owned(item.id) || state.marks < item.cost
                        }
                        onClick={() => onBuy(item.id)}
                        aria-label={
                          owned(item.id)
                            ? `${item.name} bereits gekauft`
                            : `${item.name} für ${item.cost} Marken kaufen`
                        }
                      >
                        <Icon
                          name={owned(item.id) ? "check" : "coins"}
                          size={16}
                        />
                        {owned(item.id)
                          ? "In deinem Betrieb"
                          : `${item.cost} Marken · Kaufen`}
                      </button>
                      {!owned(item.id) && state.marks < item.cost && (
                        <small className="gw-shortfall">
                          Noch {item.cost - state.marks} Marken
                        </small>
                      )}
                    </div>
                  </article>
                ))}
              </div>
              <button
                className="gw-sheet-learning"
                onClick={() => {
                  closeSheet();
                  onNavigate("map");
                }}
              >
                <Icon name="book" size={18} />
                Im Lernpfad Marken verdienen
                <Icon name="arrow" size={16} />
              </button>
            </>
          ) : brief ? (
            <div className="gw-brief">
              <button className="gw-back" onClick={() => setSelectedJob(null)}>
                <Icon name="back" size={16} />
                Alle verfügbaren Anfragen
              </button>
              <span className="gw-job-district">{brief.location}</span>
              <h3>{brief.title}</h3>
              <p className="gw-client">{brief.client}</p>
              <p>{brief.contract!.brief}</p>
              <div className="gw-job-details">
                <span>
                  <Icon name="book" size={17} />
                  {brief.questions.length} Aufgaben · {brief.minutes} Min.
                </span>
                <span>
                  <Icon name="coins" size={17} />
                  {paid(brief.id)
                    ? "Bereits vergütet · frei üben"
                    : "+40 Marken · +120 XP"}
                </span>
              </div>
              <p className="gw-job-rule">
                4 von 5 Aufgaben selbstständig richtig lösen. Die Belohnung
                erhältst du beim ersten Erfolg. Eine Nachbesserung ist
                kostenlos.
              </p>
              {state.session && (
                <p className="gw-session-note">
                  Schließe zuerst deinen laufenden Einsatz ab.
                </p>
              )}
              <button
                className="gw-accept"
                disabled={
                  busy || !!state.session || !isUnlocked(state, brief.id)
                }
                onClick={() => startJob(brief.id)}
              >
                {paid(brief.id) ? "Auftrag üben" : "Auftrag annehmen"}
                <Icon name="arrow" size={19} />
              </button>
              <small className="gw-course-note">
                Kursübung, keine bestätigte Original-Prüfungsfrage.
              </small>
            </div>
          ) : (
            <div className="gw-job-list">
              <p className="gw-sheet-intro">
                Deine Ausstattung öffnet dir neue Türen. Diese Kunden kannst du
                schon besuchen.
              </p>
              {openJobs.map((job) => (
                <button
                  className="gw-job-row"
                  key={job.id}
                  onClick={() => setSelectedJob(job.id)}
                >
                  <span className="gw-job-icon">
                    <Icon
                      name={paid(job.id) ? "check" : "briefcase"}
                      size={20}
                    />
                  </span>
                  <span>
                    <small>
                      {paid(job.id) ? "ERLEDIGT · FREI ÜBEN" : job.location}
                    </small>
                    <strong>{job.title}</strong>
                    <small>{job.client}</small>
                  </span>
                  <Icon name="chevron" size={18} />
                </button>
              ))}
              <p className="gw-locked-hint">
                <Icon name="lock" size={16} />
                Weitere Kunden warten auf den Ausbau deines Betriebs.
              </p>
            </div>
          )}
        </dialog>
      )}
    </section>
  );
}
