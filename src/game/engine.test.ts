import { describe, it, expect } from "vitest";
import { initialState, reduceGame, evaluate, recordLearning } from "./engine";

// These tests protect reward accounting and honest mastery, not UI wording.
const complete = (s: any, questId: string, id = questId) => {
  s = reduceGame(s, {
    type: "start",
    questId,
    id,
    now: "2026-11-02T10:00:00Z",
  });
  for (let i = 0; i < 5; i++) {
    s = reduceGame(s, {
      type: "submit",
      answer: [],
      now: "2026-11-02T10:00:00Z",
    });
    s = reduceGame(s, { type: "next" });
  }
  return reduceGame(s, { type: "finish" });
};
describe("campaign", () => {
  it("rejects locked quests and early reward claims", () => {
    const s = initialState();
    expect(
      reduceGame(s, {
        type: "start",
        questId: "q2",
        id: "x",
        now: "2026-11-02T10:00:00Z",
      }).session,
    ).toBeNull();
    expect(reduceGame(s, { type: "finish" }).xp).toBe(0);
  });
  it("credits a normal quest once and replay stays free", () => {
    const s = complete(initialState(), "q1");
    expect(s.xp).toBe(100);
    expect(s.marks).toBe(20);
    expect(complete(s, "q1", "replay").xp).toBe(100);
    expect(reduceGame(s, { type: "finish" }).marks).toBe(20);
  });
  it("earns 600 XP and buys three upgrades without overdrawing", () => {
    let s = initialState();
    expect(reduceGame(s, { type: "buy", id: "wall" }).marks).toBe(0);
    for (const id of ["q1", "q2", "q3", "q4", "boss"]) s = complete(s, id);
    expect(s.xp).toBe(600);
    expect(s.marks).toBe(120);
    for (const id of ["wall", "bench", "diagnostics"])
      s = reduceGame(s, { type: "buy", id });
    expect(s.marks).toBe(0);
    expect(s.purchases).toHaveLength(3);
    expect(reduceGame(s, { type: "buy", id: "wall" }).marks).toBe(0);
  });
  it("ignores duplicate answers and demo tasks never affect mastery", () => {
    let s = reduceGame(initialState(), {
      type: "start",
      questId: "q1",
      id: "s",
      now: "2026-11-02T10:00:00Z",
    });
    s = reduceGame(s, {
      type: "submit",
      answer: ["a"],
      now: "2026-11-02T10:00:00Z",
    });
    s = reduceGame(s, {
      type: "submit",
      answer: ["b"],
      now: "2026-11-02T10:00:00Z",
    });
    expect(s.session!.answers).toHaveLength(1);
    expect(s.mastery).toEqual({});
  });
});
describe("grading and learning", () => {
  it("requires exact selections and preserves order when sequencing", () => {
    const q = {
      kind: "choice" as const,
      correct: ["a", "b"],
      options: [
        { id: "a", text: "A" },
        { id: "b", text: "B" },
        { id: "c", text: "C" },
      ],
    };
    expect(evaluate(q, ["b", "a"])).toBe(true);
    expect(evaluate(q, ["a"])).toBe(false);
    expect(evaluate(q, ["a", "b", "c"])).toBe(false);
    expect(evaluate(q, ["a", "a", "b"])).toBe(false);
    expect(evaluate({ ...q, kind: "order" }, ["b", "a"])).toBe(false);
  });
  it("requires independent variants on different days", () => {
    const attempt = {
      questionId: "a",
      sessionId: "s1",
      now: "2026-11-02T10:00:00Z",
      correct: true,
      hinted: false,
      status: "reviewed",
    };
    let m = recordLearning(undefined, attempt);
    expect(m!.stage).toBe("practicing");
    m = recordLearning(m, { ...attempt, questionId: "b", sessionId: "s2" });
    expect(m!.stage).toBe("practicing");
    m = recordLearning(m, {
      ...attempt,
      questionId: "b",
      sessionId: "s3",
      now: "2026-11-03T10:00:00Z",
    });
    expect(m!.stage).toBe("secure");
    m = recordLearning(m, {
      ...attempt,
      hinted: true,
      now: "2026-11-04T10:00:00Z",
    });
    expect(m!.stage).toBe("practicing");
    expect(m!.streak).toBe(0);
  });
  it("does not credit demo content and schedules 1, 3, 7 days", () => {
    const attempt = {
      questionId: "a",
      sessionId: "s",
      now: "2026-11-02T12:00:00Z",
      correct: true,
      hinted: false,
      status: "demo",
    };
    expect(recordLearning(undefined, attempt)).toBeUndefined();
    let m = recordLearning(undefined, { ...attempt, status: "reviewed" });
    expect(new Date(m!.due).getDate()).toBe(3);
    m = recordLearning(m, {
      ...attempt,
      status: "reviewed",
      questionId: "b",
      sessionId: "s2",
      now: "2026-11-03T12:00:00Z",
    });
    expect(new Date(m!.due).getDate()).toBe(6);
    m = recordLearning(m, {
      ...attempt,
      status: "reviewed",
      questionId: "c",
      sessionId: "s3",
      now: "2026-11-06T12:00:00Z",
    });
    expect(new Date(m!.due).getDate()).toBe(13);
  });
});
