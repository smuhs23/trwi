import { it, expect } from "vitest";
import { quests } from "./content";
import { optionOrder } from "./option-order";
it("keeps saved rounds stable and changes positions across new rounds", () => {
  const q = { ...quests[0].questions[0], status: "draft" as const };
  expect(optionOrder(q, "saved")).toEqual(optionOrder(q, "saved"));
  const layouts = new Set(
    Array.from({ length: 20 }, (_, i) =>
      optionOrder(q, String(i))
        .map((o) => o.id)
        .join(""),
    ),
  );
  expect(layouts.size).toBeGreaterThan(1);
  expect(
    optionOrder(q, "saved")
      .map((o) => o.id)
      .sort(),
  ).toEqual(q.options.map((o) => o.id).sort());
});
