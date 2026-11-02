import { it, expect } from "vitest";
import { quests, CONTENT_VERSION } from "./content";
import { initialState, reduceGame } from "./engine";
import { parseImport, validate } from "./validation";
it("has source-linked lessons for all eight course modules with valid answer structures", () => {
  const course = quests.filter((q) => q.id.startsWith("trgi-"));
  expect(course.length).toBeGreaterThanOrEqual(26);
  for (let n = 1; n <= 8; n++)
    expect(course.some((q) => q.id.startsWith(`trgi-${n}`))).toBe(true);
  const ids = quests.flatMap((q) => q.questions.map((t) => t.id));
  expect(new Set(ids).size).toBe(ids.length);
  for (const q of course)
    for (const t of q.questions) {
      expect(t.status).toBe("draft");
      expect(t.lesson!.length).toBeGreaterThan(20);
      expect(t.source).toMatch(/\d/);
      expect(t.explanation.length).toBeGreaterThan(30);
      expect(t.correct.length).toBeGreaterThan(0);
      expect(new Set(t.correct).size).toBe(t.correct.length);
      expect(t.correct.every((id) => t.options.some((o) => o.id === id))).toBe(
        true,
      );
      if (t.kind === "order") expect(t.correct.length).toBe(t.options.length);
    }
});
it("keeps completed demo and purchases when migrating to the course", () => {
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
  s = reduceGame(s, { type: "buy", id: "wall" });
  const migrated = parseImport(
    JSON.stringify({ ...s, contentVersion: "demo-1" }),
  );
  expect(migrated.completed).toEqual(["q1", "q2", "q3", "q4", "boss"]);
  expect(migrated.xp).toBe(600);
  expect(migrated.purchases).toContain("wall");
  expect(migrated.contentVersion).toBe(CONTENT_VERSION);
  expect(validate(migrated)).toEqual(migrated);
  const started = reduceGame(migrated, {
    type: "start",
    questId: quests[5].id,
    id: "course",
    now: "2026-11-02T10:00:00Z",
  });
  expect(started.session?.questId).toBe(quests[5].id);
});
it("course review rewards cannot be farmed by repeating the same due assignment", () => {
  let s = initialState();
  const now = "2026-11-02T10:00:00Z";
  const finish = (questId: string, answers: boolean) => {
    s = reduceGame(s, { type: "start", questId, id: crypto.randomUUID(), now });
    const q = quests.find((q) => q.id === questId)!;
    for (const t of q.questions) {
      s = reduceGame(s, {
        type: "submit",
        answer: answers ? t.correct : [],
        now,
      });
      s = reduceGame(s, { type: "next" });
    }
    s = reduceGame(s, { type: "finish" });
  };
  for (const q of quests.slice(0, 5)) finish(q.id, true);
  const course = quests[5];
  finish(course.id, false);
  const xp = s.xp;
  finish(course.id, false);
  expect(s.xp).toBe(xp + 30);
  expect(() => validate(s)).not.toThrow();
  finish(course.id, false);
  expect(s.xp).toBe(xp + 30);
  expect(() => validate(s)).not.toThrow();
});
