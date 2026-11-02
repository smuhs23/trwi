import { z } from "zod";
import type { GameState } from "./types";
import { CONTENT_VERSION, findQuest, quests, upgrades } from "./content";
import { evaluate } from "./engine";
const id = z.string().min(1).max(500);
const ids = z
  .array(id)
  .max(10000)
  .refine((a) => new Set(a).size === a.length, "Doppelte Einträge");
const integer = z.number().int().min(0).max(100000000);
const schema = z
  .object({
    schema: z.literal(1),
    contentVersion: id,
    xp: integer,
    marks: integer,
    completed: ids,
    purchases: ids,
    rewarded: ids,
    session: z
      .object({
        id,
        questId: id,
        version: id,
        index: z.number().int().min(0).max(1000),
        answers: z
          .array(
            z
              .object({
                questionId: id,
                answer: ids,
                correct: z.boolean(),
                hinted: z.boolean(),
              })
              .strict(),
          )
          .max(1000),
        selection: ids,
        hinted: z.boolean(),
        reviewToken: id.nullable(),
      })
      .strict()
      .nullable(),
    mastery: z.record(
      id,
      z
        .object({
          stage: z.enum(["practicing", "secure"]),
          streak: integer,
          due: z.iso.datetime(),
          successes: z
            .array(
              z.object({ questionId: id, sessionId: id, day: id }).strict(),
            )
            .max(10),
        })
        .strict(),
    ),
    settings: z
      .object({ reducedMotion: z.boolean(), sound: z.boolean() })
      .strict(),
    lastResult: z
      .object({
        questId: id,
        correct: integer,
        total: integer,
        xp: integer,
        marks: integer,
      })
      .strict()
      .nullable(),
  })
  .strict();
export function validate(value: unknown): GameState {
  const s = schema.parse(value) as GameState;
  const fail = () => {
    throw new Error("Der Spielstand ist unvollständig oder widersprüchlich.");
  };
  if (
    s.completed.some((q, i) => q !== quests[i]?.id) ||
    s.purchases.some((id) => !upgrades.some((u) => u.id === id))
  )
    fail();
  let xp = 0,
    marks = 0;
  for (const r of s.rewarded) {
    if (r.startsWith("quest:")) {
      const q = findQuest(r.slice(6));
      if (!q || !s.completed.includes(q.id)) fail();
      xp += q!.boss ? 200 : 100;
      marks += q!.boss ? 40 : 20;
    } else if (r.startsWith("review:")) {
      if (!findQuest(r.split(":")[1])) fail();
      xp += 30;
      marks += 5;
    } else fail();
  }
  if (s.completed.some((id) => !s.rewarded.includes(`quest:${id}`))) fail();
  marks -= s.purchases.reduce(
    (n, id) => n + upgrades.find((u) => u.id === id)!.cost,
    0,
  );
  if (s.xp !== xp || s.marks !== marks) fail();
  if (
    s.lastResult &&
    (!findQuest(s.lastResult.questId) ||
      s.lastResult.correct > s.lastResult.total)
  )
    fail();
  if (s.session && s.session.version === CONTENT_VERSION) {
    const t = s.session,
      q = findQuest(t.questId);
    if (!q) fail();
    if (t.reviewToken !== null) {
      const prefix = `review:${t.questId}:`;
      if (!t.reviewToken.startsWith(prefix)) fail();
      const entries = t.reviewToken.slice(prefix.length).split("|");
      const goals = entries.map((entry) => entry.split("@")[0]);
      if (new Set(goals).size !== goals.length || !entries.length) fail();
      for (const entry of entries) {
        const [goal, due, ...extra] = entry.split("@");
        if (
          extra.length ||
          !due ||
          !Number.isFinite(Date.parse(due)) ||
          !q!.questions.some(
            (question) =>
              question.status === "reviewed" && question.goal === goal,
          ) ||
          !s.mastery[goal]
        )
          fail();
      }
    }
    const index = quests.findIndex((q) => q.id === t.questId);
    if (index > 0 && !s.completed.includes(quests[index - 1].id)) fail();
    if (
      t.index >= q!.questions.length ||
      t.answers.length < t.index ||
      t.answers.length > t.index + 1
    )
      fail();
    t.answers.forEach((a, i) => {
      const question = q!.questions[i];
      if (
        !question ||
        a.questionId !== question.id ||
        a.answer.some((id) => !question.options.some((o) => o.id === id)) ||
        a.correct !== evaluate(question, a.answer)
      )
        fail();
    });
    if (
      t.selection.some(
        (id) => !q!.questions[t.index].options.some((o) => o.id === id),
      )
    )
      fail();
  }
  return s;
}
export function reconcile(s: GameState): GameState {
  const stale =
    s.contentVersion !== CONTENT_VERSION ||
    (!!s.session && s.session.version !== CONTENT_VERSION);
  return {
    ...s,
    contentVersion: CONTENT_VERSION,
    session: stale ? null : s.session,
    mastery: stale ? {} : s.mastery,
  };
}
export function parseImport(text: string): GameState {
  if (text.length > 2_000_000)
    throw new Error("Die Datei ist zu groß (maximal 2 MB).");
  try {
    return reconcile(validate(JSON.parse(text)));
  } catch {
    throw new Error(
      "Keine gültige LernQuest-Sicherung. Dein Spielstand wurde nicht verändert.",
    );
  }
}
