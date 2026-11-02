import { test, expect } from "@playwright/test";
import { quests, upgrades } from "../src/game/content";
import { mkdirSync } from "node:fs";
test("mission survives reload with hint and selected answer", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Lernen", exact: true }).click();
  await page
    .getByRole("button", { name: "Quest starten", exact: true })
    .click();
  await page.getByRole("button", { name: "Hinweis", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Anlagendokumentation und konkreten Auftrag prüfen",
      exact: true,
    })
    .click();
  await page.reload();
  await page.getByRole("button", { name: "Lernen", exact: true }).click();
  await page
    .getByRole("button", { name: "Weiterspielen", exact: true })
    .click();
  await expect(
    page.getByText("Welche Information fehlt dir vor einer Entscheidung?", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Anlagendokumentation und konkreten Auftrag prüfen",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Antwort prüfen" }).click();
  await expect(
    page.getByRole("button", { name: "Weiter", exact: true }),
  ).toBeVisible();
});
test("visual layouts and keyboard ordering", async ({ page }) => {
  mkdirSync("docs/screenshots", { recursive: true });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");
  await page.getByRole("button", { name: "Lernen", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Quest starten", exact: true }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "docs/screenshots/desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "docs/screenshots/mobile.png",
    animations: "disabled",
    fullPage: false,
  });
  await page
    .getByRole("button", { name: "Quest starten", exact: true })
    .click();
  await page.screenshot({
    path: "docs/screenshots/mission.png",
    fullPage: true,
  });
  for (const answer of [
    "Anlagendokumentation und konkreten Auftrag prüfen",
    "Gasinstallationen",
  ]) {
    const choice = page.getByRole("button", { name: answer, exact: true });
    await expect(choice).toBeEnabled();
    await choice.focus();
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: "Antwort prüfen" }).click();
    await page.getByRole("button", { name: "Weiter", exact: true }).click();
  }
  for (const answer of [
    "Befund dokumentieren",
    "Auftrag und vorhandene Unterlagen lesen",
    "Beobachtungen mit Unterlagen abgleichen",
  ]) {
    const option = page.getByRole("button", { name: answer, exact: true });
    await expect(option).toBeEnabled();
    await option.focus();
    await page.keyboard.press("Enter");
    await expect(option).toHaveAttribute("aria-pressed", "true");
  }
  await expect(
    page.getByRole("button", { name: "Schritt 2 nach oben" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Schritt 2 nach oben" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Schritt 3 nach oben" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Schritt 3 nach oben" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Antwort prüfen" }).click();
  await expect(
    page.getByRole("heading", { name: "Gut gelöst!" }),
  ).toBeVisible();
});
test("complete campaign and buy every upgrade", async ({ page }) => {
  test.setTimeout(180000);
  await page.goto("/");
  await page.getByRole("button", { name: "Lernen", exact: true }).click();
  for (const quest of quests) {
    await page
      .getByRole("button", { name: "Quest starten", exact: true })
      .click();
    for (const q of quest.questions) {
      if (q.kind === "order") {
        for (const id of q.correct)
          await page
            .getByRole("button", {
              name: q.options.find((o) => o.id === id)!.text,
              exact: true,
            })
            .click();
      } else {
        for (const id of q.correct)
          await page
            .getByRole("button", {
              name: q.options.find((o) => o.id === id)!.text,
              exact: true,
            })
            .click();
      }
      await page.getByRole("button", { name: "Antwort prüfen" }).click();
      await page
        .getByRole("button", {
          name: q === quest.questions.at(-1) ? "Quest abschließen" : "Weiter",
          exact: true,
        })
        .click();
    }
    await expect(
      page.getByRole("heading", { name: "Auftrag geschafft!" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Zur Karte", exact: true }).click();
  }
  await page.getByRole("button", { name: "Shop", exact: true }).click();
  for (const name of ["Werkzeugwand", "Profi-Werkbank", "Diagnoseplatz"])
    await page
      .getByRole("button", { name: `${name} freischalten`, exact: true })
      .click();
  await expect(
    page.getByText(`3 / ${upgrades.length} Ausbauten`, { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Lernen", exact: true }).click();
  await expect(page.getByTestId("xp-total")).toHaveText(
    `${quests.reduce((total, q) => total + (q.boss ? 200 : 100), 0)} XP`,
  );
});
test("mobile layout, settings import and offline reload", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Lernen", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Quest starten", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Einstellungen", exact: true })
    .click();
  await page.getByLabel("Sicherung importieren").setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"schema":9}'),
  });
  await expect(page.getByRole("alert")).toContainText("Keine gültige");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.getByRole("button", { name: "Lernen", exact: true }).click();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "Lernen", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Quest starten", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/mobile-offline.png",
    fullPage: true,
  });
});
