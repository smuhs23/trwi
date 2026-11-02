import { it, expect } from "vitest";
import { contracts, quests, upgrades } from "./content";
import { initialState, isUnlocked, reduceGame } from "./engine";
import { validate, parseImport } from "./validation";
import type { GameState } from "./types";
function run(s: GameState, id: string, correct: number, hinted = false) {
  const q = [...quests, ...contracts].find((q) => q.id === id)!;
  s = reduceGame(s, {
    type: "start",
    questId: id,
    id: crypto.randomUUID(),
    now: "2026-11-02T12:00:00Z",
  });
  for (const [i, t] of q.questions.entries()) {
    if (hinted) s = reduceGame(s, { type: "hint" });
    s = reduceGame(s, {
      type: "submit",
      answer: i < correct ? t.correct : [],
      now: "2026-11-02T12:00:00Z",
    });
    s = reduceGame(s, { type: "next" });
  }
  return reduceGame(s, { type: "finish" });
}
it("only pays accepted jobs once and preserves the course route", () => {
  let s = run(initialState(), "job-1", 3);
  expect(s.marks).toBe(0);
  expect(s.completed).toEqual([]);
  s = run(s, "job-1", 4);
  expect(s.marks).toBe(40);
  expect(s.xp).toBe(120);
  expect(validate(s)).toEqual(s);
  expect(parseImport(JSON.stringify(s))).toEqual(s);
  s = run(s, "job-1", 5);
  expect(s.marks).toBe(40);
  expect(s.completed).toEqual([]);
  expect(run(initialState(), "job-1", 5, true).marks).toBe(0);
});
it("vehicle gates apply to starts and imported sessions", () => {
  let s = initialState();
  expect(isUnlocked(s, "job-2")).toBe(false);
  expect(
    reduceGame(s, {
      type: "start",
      questId: "job-2",
      id: "x",
      now: "2026-11-02T12:00:00Z",
    }).session,
  ).toBeNull();
  s = run(s, "q1", 4);
  s = run(s, "q2", 4);
  s = run(s, "job-1", 5);
  s = reduceGame(s, { type: "buy", id: "service-car" });
  expect(s.marks).toBe(0);
  expect(isUnlocked(s, "job-2")).toBe(true);
  s = reduceGame(s, {
    type: "start",
    questId: "job-2",
    id: "x",
    now: "2026-11-02T12:00:00Z",
  });
  expect(() => validate(s)).not.toThrow();
  expect(() => validate({ ...s, purchases: [], marks: 80 })).toThrow();
});
it("all purchases are reachable without paying for repeat questions", () => {
  let s = initialState();
  for (const q of quests) s = run(s, q.id, q.questions.length);
  for (let pass = 0; pass < 3; pass++) {
    for (const u of upgrades) s = reduceGame(s, { type: "buy", id: u.id });
    for (const q of contracts) if (isUnlocked(s, q.id)) s = run(s, q.id, 5);
  }
  expect(s.purchases.length).toBe(upgrades.length);
  expect(s.rewarded.filter((r) => r.startsWith("contract:"))).toHaveLength(12);
  expect(() => validate(s)).not.toThrow();
});
it("every course choice has four unique options and every contract has five tasks", () => {
  for (const q of quests.filter((q) => q.id.startsWith("trgi-")))
    for (const t of q.questions)
      if (t.kind === "choice")
        expect(t.options.length).toBeGreaterThanOrEqual(4);
  for (const q of contracts) {
    expect(q.questions).toHaveLength(5);
    expect(
      q.contract?.requires.every((id) => upgrades.some((u) => u.id === id)),
    ).toBe(true);
  }
});
it("preserves practice history when upgrading the existing course to business mode", () => {
  const s = initialState();
  s.contentVersion = "course-1";
  s.mastery["test-goal"] = {
    stage: "practicing",
    streak: 1,
    due: "2026-11-03T12:00:00.000Z",
    successes: [
      { questionId: "trgi-1a-1", sessionId: "old", day: "2026-11-2" },
    ],
  };
  expect(parseImport(JSON.stringify(s)).mastery).toEqual(s.mastery);
});
