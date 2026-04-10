import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_OPTA_RANK,
  OPTA_RANK_DIVISOR,
  computeEffortScore,
  computeExcitementFactor,
  computeControlScore,
  effortScoreInputFromRow,
  effortTotalsFromInput,
  excitementScoreInputFromRow,
  leagueFactorFromStoredOptaValue,
  resolveOptaRank,
} from "./control-score";
import { MoneyballStat } from "@/features/moneyball/moneyball-stat";

test("computeControlScore matches hand-checked middle values", () => {
  const r = computeControlScore({ xA: 0.2, opKP: 0.5, goals: 0.3, xG: 0.4, shots: 2, presC: 2, presA: 5, possWon: 7.66, possLost: 10, passesAttempted: 40, optaRank: 25 });
  assert.ok(Math.abs(r.creationIndex - 0.2 * (0.2 / 0.5) * 67.5) < 1e-9);
  assert.ok(Math.abs(r.scoringIndex - 0.3 * (0.4 / 2) * 54) < 1e-9);
  assert.ok(Math.abs(r.pressureIndex - 2 * (2 / 5) * 2.23) < 1e-9);
  assert.ok(Math.abs(r.possessionIndex - 1) < 1e-9);
  assert.ok(Math.abs(r.possessionLossRate - 0.75) < 1e-9);
  const leagueFactor = 25 / 2.55;
  const indexSum = r.creationIndex + r.scoringIndex + r.pressureIndex + r.possessionIndex;
  assert.ok(Math.abs(r.controlScore - indexSum * 0.75 * leagueFactor) < 1e-6);
});

test("resolveOptaRank uses default when missing or invalid", () => {
  assert.equal(resolveOptaRank({}, "any").rank, DEFAULT_OPTA_RANK);
  assert.equal(resolveOptaRank({ k: 5 }, "k").rank, 5);
  assert.equal(resolveOptaRank({ k: 0 }, "k").isDefault, true);
});

test("OPTA_RANK_DIVISOR matches formula constant", () => {
  assert.equal(OPTA_RANK_DIVISOR, 2.55);
});

test("leagueFactorFromStoredOptaValue uses ranking / 2.55", () => {
  assert.ok(Math.abs(leagueFactorFromStoredOptaValue(25) - 25 / 2.55) < 1e-9);
});

test("computeExcitementFactor scales with ranking league factor", () => {
  const input = { keyTackles: 0.8, shotsBlocked: 1.0, progressivePasses: 8.0, shots: 2.3, openPlayKeyPasses: 0.9, dribbles: 1.7, offsidesPer90: 0.3 };
  const averages = { keyTackles: 0.7, shotsBlocked: 0.9, progressivePasses: 7.2, shots: 2.1, openPlayKeyPasses: 0.8, dribbles: 1.5, offsidesPer90: 0.2 };
  const low = computeExcitementFactor({ ...input, optaRank: 10 }, averages);
  const high = computeExcitementFactor({ ...input, optaRank: 50 }, averages);
  assert.ok(high.excitementFactor > low.excitementFactor);
});

test("excitementScoreInputFromRow maps required mustermann stat fields", () => {
  const mapped = excitementScoreInputFromRow(
    {
      stats: {
        [MoneyballStat.KeyTacklesPer90]: 0.2,
        [MoneyballStat.ShotsBlockedPer90]: 0.4,
        [MoneyballStat.ProgressivePassesPer90]: 6.2,
        [MoneyballStat.ShotsPer90]: 1.8,
        [MoneyballStat.OpenPlayKeyPassesPer90]: 0.5,
        [MoneyballStat.DribblesPer90]: 1.1,
        [MoneyballStat.OffsidesPer90]: 0.3,
      },
    },
    25,
  );
  assert.equal(mapped.optaRank, 25);
  assert.equal(mapped.shots, 1.8);
});

test("effortTotalsFromInput converts per90 metrics to totals via minutes", () => {
  const totals = effortTotalsFromInput({
    distanceCoveredPer90: 10,
    sprintsPer90: 20,
    tacklesAttempted: 45,
    pressuresAttemptedPer90: 30,
    headersAttempted: 12,
    minutes: 900,
    optaRank: 25,
  });
  assert.equal(totals.distanceCoveredTotal, 100);
  assert.equal(totals.sprintsTotal, 200);
  assert.equal(totals.tacklesAttempted, 45);
  assert.equal(totals.pressuresAttemptedTotal, 300);
  assert.equal(totals.headersAttempted, 12);
});

test("effortTotalsFromInput returns zero converted totals when minutes is zero", () => {
  const totals = effortTotalsFromInput({
    distanceCoveredPer90: 10,
    sprintsPer90: 20,
    tacklesAttempted: 2,
    pressuresAttemptedPer90: 30,
    headersAttempted: 1,
    minutes: 0,
    optaRank: 25,
  });
  assert.equal(totals.distanceCoveredTotal, 0);
  assert.equal(totals.sprintsTotal, 0);
  assert.equal(totals.pressuresAttemptedTotal, 0);
  assert.equal(totals.tacklesAttempted, 2);
  assert.equal(totals.headersAttempted, 1);
});

test("computeEffortScore averages percentiles and applies league factor", () => {
  const result = computeEffortScore(
    {
      distanceCoveredTotal: 100,
      sprintsTotal: 200,
      tacklesAttempted: 40,
      pressuresAttemptedTotal: 300,
      headersAttempted: 10,
    },
    {
      distanceCoveredTotal: 70,
      sprintsTotal: 60,
      tacklesAttempted: 50,
      pressuresAttemptedTotal: 80,
      headersAttempted: 40,
    },
    25,
  );
  assert.equal(result.baseEffort, 60);
  assert.ok(Math.abs(result.effortScore - 60 * (25 / 2.55)) < 1e-9);
});

test("effortScoreInputFromRow maps totals/per90 sources including tck A and hdrs A", () => {
  const mapped = effortScoreInputFromRow(
    {
      minutes: 1800,
      stats: {
        [MoneyballStat.DistanceCoveredPer90]: 10.5,
        [MoneyballStat.SprintsPer90]: 25.2,
        [MoneyballStat.TacklesAttempted]: 77,
        [MoneyballStat.PressuresAttemptedPer90]: 31.4,
        [MoneyballStat.HeadersAttempted]: 55,
      },
    },
    30,
  );
  assert.equal(mapped.minutes, 1800);
  assert.equal(mapped.distanceCoveredPer90, 10.5);
  assert.equal(mapped.sprintsPer90, 25.2);
  assert.equal(mapped.tacklesAttempted, 77);
  assert.equal(mapped.pressuresAttemptedPer90, 31.4);
  assert.equal(mapped.headersAttempted, 55);
  assert.equal(mapped.optaRank, 30);
});
