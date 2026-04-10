import test from "node:test";
import assert from "node:assert/strict";
import { withMustermannCategoryPercentiles } from "./mustermann-category-percentiles";

test("withMustermannCategoryPercentiles ranks players within each position group", () => {
  const rows = [
    {
      id: "d1",
      positionGroup: "Defender" as const,
      scores: {
        defendCategoryScore: 10,
        supportCategoryScore: 20,
        createCategoryScore: 30,
        scoreCategoryScore: 40,
      },
    },
    {
      id: "d2",
      positionGroup: "Defender" as const,
      scores: {
        defendCategoryScore: 20,
        supportCategoryScore: 40,
        createCategoryScore: 60,
        scoreCategoryScore: 80,
      },
    },
    {
      id: "m1",
      positionGroup: "Midfielder" as const,
      scores: {
        defendCategoryScore: 99,
        supportCategoryScore: 99,
        createCategoryScore: 99,
        scoreCategoryScore: 99,
      },
    },
  ];
  const ranked = withMustermannCategoryPercentiles(rows);
  const d1 = ranked.find((r) => r.id === "d1");
  const d2 = ranked.find((r) => r.id === "d2");
  const m1 = ranked.find((r) => r.id === "m1");
  assert.ok(d1);
  assert.ok(d2);
  assert.ok(m1);
  assert.equal(d1.categoryPercentiles.defend, 50);
  assert.equal(d2.categoryPercentiles.defend, 100);
  assert.equal(m1.categoryPercentiles.defend, 100);
});
