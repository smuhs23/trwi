export type Option = { id: string; text: string; x?: number; y?: number };
export type Question = {
  id: string;
  goal: string;
  kind: "choice" | "order" | "scene";
  title: string;
  prompt: string;
  options: Option[];
  correct: string[];
  explanation: string;
  lesson?: string;
  hint: string;
  status: "demo" | "draft" | "reviewed";
  source: string;
  version: string;
};
export type Quest = {
  id: string;
  title: string;
  subtitle: string;
  client: string;
  location: string;
  icon: string;
  minutes: number;
  questions: Question[];
  boss?: boolean;
  contract?: { requires: string[]; district: string; brief: string };
};
export type Learning = {
  failedSession?: string;
  stage: "practicing" | "secure";
  streak: number;
  due: string;
  successes: { questionId: string; sessionId: string; day: string }[];
};
export type AnswerRecord = {
  questionId: string;
  answer: string[];
  correct: boolean;
  hinted: boolean;
};
export type Session = {
  id: string;
  questId: string;
  version: string;
  index: number;
  answers: AnswerRecord[];
  selection: string[];
  hinted: boolean;
  reviewToken: string | null;
};
export type GameState = {
  schema: 1;
  contentVersion: string;
  xp: number;
  marks: number;
  completed: string[];
  purchases: string[];
  rewarded: string[];
  session: Session | null;
  mastery: Record<string, Learning>;
  settings: { reducedMotion: boolean; sound: boolean };
  lastResult: {
    questId: string;
    correct: number;
    total: number;
    xp: number;
    marks: number;
  } | null;
};
export type Action =
  | { type: "start"; questId: string; id: string; now: string }
  | { type: "select"; answer: string[] }
  | { type: "hint" }
  | { type: "submit"; answer: string[]; now: string }
  | { type: "next" }
  | { type: "finish" }
  | { type: "buy"; id: string }
  | { type: "settings"; settings: Partial<GameState["settings"]> }
  | { type: "dismissResult" };
