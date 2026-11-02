import { test, expect } from "@playwright/test";
import { quests } from "../src/game/content";
import { initialState, reduceGame } from "../src/game/engine";

test("world purchases persist, dialogs restore focus and art works offline", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Werkstatt ausbauen", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/world-mobile.png",
    fullPage: true,
  });
  let state = initialState();
  for (const quest of quests) {
    state = reduceGame(state, {
      type: "start",
      questId: quest.id,
      id: quest.id,
      now: "2026-11-02T10:00:00Z",
    });
    for (const question of quest.questions) {
      state = reduceGame(state, {
        type: "submit",
        answer: question.correct,
        now: "2026-11-02T10:00:00Z",
      });
      state = reduceGame(state, { type: "next" });
    }
    state = reduceGame(state, { type: "finish" });
    state = reduceGame(state, { type: "dismissResult" });
  }
  const initialMarks = state.marks;
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
  const fleet = page.getByRole("button", { name: "Fuhrpark 0/3", exact: true });
  await fleet.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Schließen", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(fleet).toBeFocused();
  await fleet.click();
  for (const name of [
    "Service-Kombi",
    "Montage-Transporter",
    "Großer Werkstattwagen",
  ]) {
    await page
      .getByRole("button", { name: new RegExp(`^${name} für`) })
      .click();
    await expect(
      page.getByRole("button", { name: `${name} bereits gekauft` }),
    ).toBeDisabled();
  }
  await page.getByRole("button", { name: "Schließen", exact: true }).click();
  await expect(page.locator(".gw-vehicles img")).toHaveCount(3);
  await expect(page.locator(".coin-stat")).toContainText(
    String(initialMarks - 500),
  );
  await page
    .getByRole("button", { name: "Werkstatt ausbauen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Werkzeugwand für 20 Marken kaufen" })
    .click();
  await page.getByRole("button", { name: "Schließen", exact: true }).click();
  await expect(page.getByLabel("1 Werkstattausbauten gekauft")).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/world-upgraded-mobile.png",
    fullPage: true,
  });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".coin-stat")).toContainText(
    String(initialMarks - 520),
  );
  await expect(page.locator(".gw-vehicles img")).toHaveCount(3);
  expect(
    await page
      .locator(".gw-scene img")
      .evaluateAll((images) =>
        images.every(
          (image) =>
            (image as HTMLImageElement).complete &&
            (image as HTMLImageElement).naturalWidth > 0,
        ),
      ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Kundenauftrag ansehen", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("4 von 5");
  await page
    .getByRole("button", { name: "Auftrag annehmen", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Antwort prüfen", exact: true }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Weiterspielen", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Antwort prüfen", exact: true }),
  ).toBeVisible();
});
