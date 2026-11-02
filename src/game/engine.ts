import { CONTENT_VERSION, findQuest, quests, upgrades } from "./content";
import type { Action, GameState, Learning, Question } from "./types";
export const initialState = (): GameState => ({
  schema: 1,
  contentVersion: CONTENT_VERSION,
  xp: 0,
  marks: 0,
  completed: [],
  purchases: [],
  rewarded: [],
  session: null,
  mastery: {},
  settings: { reducedMotion: false, sound: false },
  lastResult: null,
});
export const dayKey = (value: string) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
const plusDays = (now: string, days: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};
export function evaluate(
  q: Pick<Question, "kind" | "correct" | "options">,
  answer: string[],
): boolean {
  if (
    answer.length !== q.correct.length ||
    new Set(answer).size !== answer.length
  )
    return false;
  return q.kind === "order"
    ? q.correct.every((id, i) => answer[i] === id)
    : q.correct.every((id) => answer.includes(id));
}
export function recordLearning(
  previous: Learning | undefined,
  a: {
    questionId: string;
    sessionId: string;
    now: string;
    correct: boolean;
    hinted: boolean;
    status: string;
  },
): Learning | undefined {
  if (a.status !== "reviewed" && a.status !== "draft") return previous;
  const m = previous ?? {
    stage: "practicing",
    streak: 0,
    due: a.now,
    successes: [],
  };
  if (a.correct && m.failedSession === a.sessionId) return m;
  if (!a.correct || a.hinted)
    return {
      stage: "practicing",
      failedSession: a.sessionId,
      streak: 0,
      due:
        a.status === "draft" && !a.correct
          ? `${a.now.slice(0, 10)}T00:00:00.000Z`
          : plusDays(a.now, 1),
      successes: [],
    };
  if (m.failedSession === a.sessionId) return m;
  const day = dayKey(a.now);
  if (m.successes.some((s) => s.sessionId === a.sessionId || s.day === day))
    return m;
  const successes = [
    ...m.successes,
    { questionId: a.questionId, sessionId: a.sessionId, day },
  ].slice(-10);
  const streak = m.streak + 1;
  return {
    stage:
      a.status === "reviewed" &&
      new Set(successes.map((s) => s.questionId)).size >= 2
        ? "secure"
        : "practicing",
    streak,
    due: plusDays(a.now, streak === 1 ? 1 : streak === 2 ? 3 : 7),
    successes,
  };
}
export const getDue = (s: GameState, now: string) =>
  Object.entries(s.mastery)
    .filter(([, m]) => new Date(m.due).getTime() <= new Date(now).getTime())
    .map(([id]) => id);
export const isUnlocked = (s: GameState, id: string) => {
  const job = findQuest(id)?.contract;
  if (job) return job.requires.every((id) => s.purchases.includes(id));
  const i = quests.findIndex((q) => q.id === id);
  return i >= 0 && (i === 0 || s.completed.includes(quests[i - 1].id));
};
export function reduceGame(s: GameState, a: Action): GameState {
  if (a.type === "settings")
    return { ...s, settings: { ...s.settings, ...a.settings } };
  if (a.type === "dismissResult") return { ...s, lastResult: null };
  if (a.type === "buy") {
    const u = upgrades.find((u) => u.id === a.id);
    if (!u || s.purchases.includes(a.id) || s.marks < u.cost) return s;
    return { ...s, marks: s.marks - u.cost, purchases: [...s.purchases, u.id] };
  }
  if (a.type === "start") {
    if (
      s.session ||
      !isUnlocked(s, a.questId) ||
      !a.id ||
      !Number.isFinite(Date.parse(a.now))
    )
      return s;
    const q = findQuest(a.questId)!;
    const due = getDue(s, a.now).filter((goal) =>
      q.questions.some((t) => t.goal === goal && t.status !== "demo"),
    );
    const reviewToken = due.length
      ? `review:${q.id}:${due
          .map((g) => `${g}@${s.mastery[g].due}`)
          .sort()
          .join("|")}`
      : null;
    return {
      ...s,
      lastResult: null,
      session: {
        id: a.id,
        questId: q.id,
        version: CONTENT_VERSION,
        index: 0,
        answers: [],
        selection: [],
        hinted: false,
        reviewToken,
      },
    };
  }
  const session = s.session;
  if (!session) return s;
  const quest = findQuest(session.questId);
  if (!quest) return s;
  const question = quest.questions[session.index];
  const answered = session.answers.length > session.index;
  if (a.type === "select" && !answered) {
    if (
      a.answer.some((id) => !question.options.some((o) => o.id === id)) ||
      new Set(a.answer).size !== a.answer.length
    )
      return s;
    return { ...s, session: { ...session, selection: a.answer } };
  }
  if (a.type === "hint" && !answered)
    return { ...s, session: { ...session, hinted: true } };
  if (a.type === "submit" && !answered) {
    if (!Number.isFinite(Date.parse(a.now))) return s;
    if (
      a.answer.some((id) => !question.options.some((o) => o.id === id)) ||
      new Set(a.answer).size !== a.answer.length
    )
      return s;
    const correct = evaluate(question, a.answer);
    const learning = recordLearning(s.mastery[question.goal], {
      questionId: question.id,
      sessionId: session.id,
      now: a.now,
      correct,
      hinted: session.hinted,
      status: question.status,
    });
    return {
      ...s,
      mastery: learning
        ? { ...s.mastery, [question.goal]: learning }
        : s.mastery,
      session: {
        ...session,
        selection: a.answer,
        answers: [
          ...session.answers,
          {
            questionId: question.id,
            answer: a.answer,
            correct,
            hinted: session.hinted,
          },
        ],
      },
    };
  }
  if (
    a.type === "next" &&
    answered &&
    session.index < quest.questions.length - 1
  )
    return {
      ...s,
      session: {
        ...session,
        index: session.index + 1,
        selection: [],
        hinted: false,
      },
    };
  if (
    a.type === "finish" &&
    session.answers.length === quest.questions.length
  ) {
    const contract = !!quest.contract;
    const score = session.answers.filter((a) => a.correct && !a.hinted).length;
    const passed =
      !contract || score >= Math.ceil(quest.questions.length * 0.8);
    const first = contract
      ? !s.rewarded.includes(`contract:${quest.id}`)
      : !s.completed.includes(quest.id);
    const token = contract
      ? `contract:${quest.id}`
      : first
        ? `quest:${quest.id}`
        : session.reviewToken;
    const eligible = passed && !!token && !s.rewarded.includes(token);
    const xp = eligible
      ? contract
        ? 120
        : first
          ? quest.boss
            ? 200
            : 100
          : 30
      : 0;
    const marks = eligible
      ? contract
        ? 40
        : first
          ? quest.boss
            ? 40
            : 20
          : 5
      : 0;
    return {
      ...s,
      session: null,
      completed: first && !contract ? [...s.completed, quest.id] : s.completed,
      rewarded: eligible ? [...s.rewarded, token!] : s.rewarded,
      xp: s.xp + xp,
      marks: s.marks + marks,
      lastResult: {
        questId: quest.id,
        correct: session.answers.filter((a) => a.correct && !a.hinted).length,
        total: quest.questions.length,
        xp,
        marks,
      },
    };
  }
  return s;
}
