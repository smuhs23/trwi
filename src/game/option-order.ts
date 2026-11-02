import type { Question } from "./types";
// Stable within a saved session; a new round changes positions, not answer IDs.
export function optionOrder(q: Question, sessionId: string) {
  const options = [...q.options];
  if (q.status === "demo" || q.kind === "scene") return options;
  let seed = 2166136261;
  for (const ch of sessionId + q.id)
    seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619) >>> 0;
  for (let i = options.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}
