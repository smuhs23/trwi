import "fake-indexeddb/auto";
import { CONTENT_VERSION } from "./content";
import { beforeEach, it, expect } from "vitest";
import { initialState } from "./engine";
import { loadGame, saveGame, mutateGame } from "./storage";
import { parseImport, reconcile } from "./validation";
beforeEach(async () => {
  await saveGame(initialState());
});
it("persists an unfinished session and hint through reload", async () => {
  await mutateGame({
    type: "start",
    questId: "q1",
    id: "persist",
    now: "2026-11-02T10:00:00Z",
  });
  await mutateGame({ type: "hint" });
  expect((await loadGame()).session?.hinted).toBe(true);
  expect((await loadGame()).session?.id).toBe("persist");
});
it("imports only consistent known version data", () => {
  expect(parseImport(JSON.stringify(initialState())).xp).toBe(0);
  for (const edit of [
    { schema: 9 },
    { marks: -1 },
    { marks: 100 },
    { xp: Infinity },
    { completed: ["q2"] },
    { rewarded: ["quest:q1", "quest:q1"] },
    { purchases: ["unknown"] },
    { session: { id: "x" } },
  ]) {
    expect(() =>
      parseImport(JSON.stringify({ ...initialState(), ...edit })),
    ).toThrow();
  }
  expect(() => parseImport("{oops")).toThrow();
  expect(() => parseImport(" ".repeat(2_000_001))).toThrow();
});
it("does not overwrite existing progress on invalid import", async () => {
  await mutateGame({
    type: "start",
    questId: "q1",
    id: "safe",
    now: "2026-11-02T10:00:00Z",
  });
  try {
    await saveGame(parseImport('{"schema":9}'));
  } catch {}
  expect((await loadGame()).session?.id).toBe("safe");
});
it("recovers an old content session without resetting currency", () => {
  const s = initialState();
  s.contentVersion = "old";
  s.session = {
    id: "s",
    questId: "q1",
    version: "old",
    index: 0,
    answers: [],
    selection: [],
    hinted: false,
    reviewToken: null,
  };
  const next = reconcile(s);
  expect(next.session).toBeNull();
  expect(next.contentVersion).toBe(CONTENT_VERSION);
  expect(next.xp).toBe(0);
});
it("serializes concurrent actions instead of losing a hint", async () => {
  await mutateGame({
    type: "start",
    questId: "q1",
    id: "concurrent",
    now: "2026-11-02T10:00:00Z",
  });
  await Promise.all([
    mutateGame({ type: "hint" }),
    mutateGame({ type: "select", answer: ["a"] }),
  ]);
  const s = await loadGame();
  expect(s.session?.hinted).toBe(true);
  expect(s.session?.selection).toEqual(["a"]);
});
it("propagates unavailable storage instead of claiming success", async () => {
  const original = globalThis.indexedDB;
  Object.defineProperty(globalThis, "indexedDB", {
    value: undefined,
    configurable: true,
  });
  try {
    await expect(saveGame(initialState())).rejects.toThrow();
  } finally {
    Object.defineProperty(globalThis, "indexedDB", {
      value: original,
      configurable: true,
    });
  }
});
it("can restore a validated backup even when existing storage is corrupt", async () => {
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.open("lernquest", 1);
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction("state", "readwrite");
      tx.objectStore("state").put({ schema: 999 }, "game");
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    };
  });
  await expect(loadGame()).rejects.toThrow();
  await saveGame(initialState());
  expect((await loadGame()).xp).toBe(0);
});

it("rejects malformed review tokens before a replay can become stranded", () => {
  const s = initialState();
  s.xp = 100;
  s.marks = 20;
  s.completed = ["q1"];
  s.rewarded = ["quest:q1"];
  s.session = {
    id: "replay",
    questId: "q1",
    version: CONTENT_VERSION,
    index: 0,
    answers: [],
    selection: [],
    hinted: false,
    reviewToken: null,
  };
  expect(parseImport(JSON.stringify(s)).session?.reviewToken).toBeNull();
  for (const token of [
    "bad-token",
    "review:q2:madeup",
    "review:q1:grundlagen@2026-01-01T10:00:00Z",
  ]) {
    s.session.reviewToken = token;
    expect(() => parseImport(JSON.stringify(s))).toThrow();
  }
});
