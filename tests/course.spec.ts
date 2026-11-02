import { test, expect } from "@playwright/test";
import { initialState, reduceGame } from "../src/game/engine";
import { quests } from "../src/game/content";
test("completed introduction opens the course, lessons persist and mistakes return", async ({
  page,
}) => {
  let s = initialState();
  for (const q of quests.slice(0, 5)) {
    s = reduceGame(s, {
      type: "start",
      questId: q.id,
      id: q.id,
      now: "2026-11-02T10:00:00Z",
    });
    for (const t of q.questions) {
      s = reduceGame(s, {
        type: "submit",
        answer: t.correct,
        now: "2026-11-02T10:00:00Z",
      });
      s = reduceGame(s, { type: "next" });
    }
    s = reduceGame(s, { type: "finish" });
  }
  s.lastResult = null;
  s.contentVersion = "demo-1";
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Quest starten", exact: true }),
  ).toBeVisible();
  await page.evaluate(
    (state) =>
      new Promise<void>((resolve) => {
        const r = indexedDB.open("lernquest", 1);
        r.onsuccess = () => {
          const db = r.result,
            tx = db.transaction("state", "readwrite");
          tx.objectStore("state").put(state, "game");
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
        };
      }),
    s,
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Quest starten", exact: true })
    .click();
  const quest = quests[5],
    question = quest.questions[0];
  await expect(
    page.getByRole("heading", { name: question.title, exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Kurz verstehen", exact: true })
    .click();
  await expect(page.getByText(question.lesson!, { exact: true })).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/course-mobile.png",
    fullPage: true,
  });
  await page.reload();
  await page
    .getByRole("button", { name: "Weiterspielen", exact: true })
    .click();
  await expect(page.getByText(question.lesson!, { exact: true })).toBeVisible();
  for (const q of quest.questions) {
    const wrong =
      q.kind === "order"
        ? [...q.correct].reverse()
        : [q.options.find((o) => !q.correct.includes(o.id))!.id];
    for (const id of wrong)
      await page
        .getByRole("button", {
          name: q.options.find((o) => o.id === id)!.text,
          exact: true,
        })
        .click();
    await page
      .getByRole("button", { name: "Antwort prüfen", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Nicht richtig", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: q === quest.questions.at(-1) ? "Quest abschließen" : "Weiter",
        exact: true,
      })
      .click();
  }
  await page.getByRole("button", { name: "Zur Karte", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: `Wiederholen: ${quest.title}`,
      exact: true,
    }),
  ).toBeVisible();
});
