import test from "node:test";
import assert from "node:assert/strict";
import { withMustermannEffortScores } from "./mustermann-effort-percentiles";

test("withMustermannEffortScores computes division-scoped percentiles and score", () => {
  const rows = withMustermannEffortScores([
    {
      id: "a",
      divisionKey: "L1",
      optaRank: 25,
      effortInput: {
        distanceCoveredPer90: 9,
        sprintsPer90: 18,
        tacklesAttempted: 20,
        pressuresAttemptedPer90: 27,
        headersAttempted: 10,
        minutes: 900,
        optaRank: 25,
      },
    },
    {
      id: "b",
      divisionKey: "L1",
      optaRank: 25,
      effortInput: {
        distanceCoveredPer90: 11,
        sprintsPer90: 22,
        tacklesAttempted: 30,
        pressuresAttemptedPer90: 33,
        headersAttempted: 15,
        minutes: 900,
        optaRank: 25,
      },
    },
  ]);
  const a = rows.find((r) => r.id === "a");
  const b = rows.find((r) => r.id === "b");
  assert.ok(a);
  assert.ok(b);
  assert.equal(a.effort.percentiles.distanceCoveredTotal, 50);
  assert.equal(b.effort.percentiles.distanceCoveredTotal, 100);
  assert.ok(b.effort.effortScore > a.effort.effortScore);
});

test("withMustermannEffortScores keeps ties deterministic with less-or-equal percentile", () => {
  const rows = withMustermannEffortScores([
    {
      id: "a",
      divisionKey: "L1",
      optaRank: 25,
      effortInput: {
        distanceCoveredPer90: 10,
        sprintsPer90: 20,
        tacklesAttempted: 30,
        pressuresAttemptedPer90: 40,
        headersAttempted: 50,
        minutes: 900,
        optaRank: 25,
      },
    },
    {
      id: "b",
      divisionKey: "L1",
      optaRank: 25,
      effortInput: {
        distanceCoveredPer90: 10,
        sprintsPer90: 20,
        tacklesAttempted: 30,
        pressuresAttemptedPer90: 40,
        headersAttempted: 50,
        minutes: 900,
        optaRank: 25,
      },
    },
  ]);
  assert.equal(rows[0].effort.percentiles.distanceCoveredTotal, 100);
  assert.equal(rows[1].effort.percentiles.distanceCoveredTotal, 100);
});
