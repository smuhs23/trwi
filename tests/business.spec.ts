import { test, expect } from "@playwright/test";
import { contracts } from "../src/game/content";
test("city jobs give clear acceptance feedback and open the garage", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Stadt", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Heute wartet ein neuer Kunde." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Auftrag annehmen", exact: true })
    .first()
    .click();
  for (const q of contracts[0].questions) {
    const wrong = q.options.find((o) => !q.correct.includes(o.id))!;
    await page.getByRole("button", { name: wrong.text, exact: true }).click();
    await page
      .getByRole("button", { name: "Antwort prüfen", exact: true })
      .click();
    await page
      .getByRole("button", {
        name:
          q === contracts[0].questions.at(-1) ? "Quest abschließen" : "Weiter",
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Nachbesserung offen" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Zur Karte", exact: true }).click();
  await page.getByRole("button", { name: "Stadt", exact: true }).click();
  await page.getByRole("button", { name: "Gewerbepark", exact: true }).click();
  await expect(
    page.getByText("Benötigt: Großer Werkstattwagen + Materiallager").first(),
  ).toBeVisible();
  await page
    .locator(".business")
    .screenshot({ path: "docs/screenshots/business-mobile.png" });
  await page.getByRole("button", { name: "Fuhrpark & Werkstatt" }).click();
  await expect(
    page.getByRole("heading", { name: "Bereit für den nächsten Einsatz" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
