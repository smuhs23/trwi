import { test, expect } from "@playwright/test";
import { initialState } from "../src/game/engine";

test("startup recovery keeps the backup confirmation visible", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Lernen", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Quest starten", exact: true }),
  ).toBeVisible();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const req = indexedDB.open("lernquest", 1);
        req.onsuccess = () => {
          const db = req.result,
            tx = db.transaction("state", "readwrite");
          tx.objectStore("state").put({ schema: 999 }, "game");
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
        };
      }),
  );
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("nicht geladen");
  await page.getByLabel("Sicherung wiederherstellen").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(initialState())),
  });
  await expect(
    page.getByRole("heading", { name: "Sicherung übernehmen?" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Spielstand ersetzen", exact: true })
    .click();
  await page.getByRole("button", { name: "Lernen", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Quest starten", exact: true }),
  ).toBeVisible();
});

test("content migration explains why an old mission is restarted", async ({
  page,
}) => {
  const state = initialState();
  state.contentVersion = "demo-old";
  state.session = {
    id: "old-session",
    questId: "q1",
    version: "demo-old",
    index: 0,
    answers: [],
    selection: [],
    hinted: false,
    reviewToken: null,
  };
  await page.goto("/");
  await page.getByRole("button", { name: "Lernen", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Quest starten", exact: true }),
  ).toBeVisible();
  await page.evaluate(
    (s) =>
      new Promise<void>((resolve) => {
        const req = indexedDB.open("lernquest", 1);
        req.onsuccess = () => {
          const db = req.result,
            tx = db.transaction("state", "readwrite");
          tx.objectStore("state").put(s, "game");
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
        };
      }),
    state,
  );
  await page.reload();
  await expect(page.getByRole("status")).toContainText(
    "Inhalte wurden aktualisiert",
  );
  await page.getByRole("button", { name: "Lernen", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Quest starten", exact: true }),
  ).toBeVisible();
});

test("a paused quest makes other mission routes explicitly unavailable", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Lernen", exact: true }).click();
  await page
    .getByRole("button", { name: "Quest starten", exact: true })
    .click();
  await page.getByRole("button", { name: "Pause & Karte" }).click();
  await expect(
    page.getByText(
      "Schließe deine laufende Mission ab, bevor du einen anderen Auftrag startest.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Mission öffnen: Spuren im Technikraum" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Weiterspielen", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Erst verstehen, dann handeln" }),
  ).toBeVisible();
});
