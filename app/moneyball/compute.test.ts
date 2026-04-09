import test from "node:test";
import assert from "node:assert/strict";
import {
  buildEffectiveMoneyballStatWeights,
  buildPercentiles,
  weightedScoreFromPercentiles,
} from "./compute";
import { MoneyballStat } from "./moneyball-stat";
import type { MoneyballRow, StatGroup } from "./types";

const statA = MoneyballStat.ExpectedAssistsPer90;
const statB = MoneyballStat.ShotsOnTargetPer90;
const statC = MoneyballStat.ExpectedGoalsPer90;

const gCreative: StatGroup = {
  id: "creative",
  name: "Creative",
  statKeys: [statA, statB],
  weight: 10,
};
const gAttack: StatGroup = {
  id: "attacking",
  name: "Attacking",
  statKeys: [statB, statC],
  weight: 5,
};

test("buildEffectiveMoneyballStatWeights uses group weights when stat overrides are zero", () => {
  const active = new Set(["creative", "attacking"]);
  const w = buildEffectiveMoneyballStatWeights(
    [statA, statB, statC],
    [gCreative, gAttack],
    active,
    { creative: 2, attacking: 3 },
    {},
  );
  assert.equal(w[statA], 2);
  assert.equal(w[statB], 2 + 3);
  assert.equal(w[statC], 3);
});

test("buildEffectiveMoneyballStatWeights multiplies stat override onto group weight", () => {
  const active = new Set(["creative"]);
  const w = buildEffectiveMoneyballStatWeights(
    [statA, statB],
    [gCreative],
    active,
    { creative: 4 },
    { [statA]: 3 },
  );
  assert.equal(w[statA], 4 * 3);
  assert.equal(w[statB], 4);
});

test("buildEffectiveMoneyballStatWeights zero group weight does not contribute", () => {
  const active = new Set(["creative", "attacking"]);
  const w = buildEffectiveMoneyballStatWeights(
    [statB],
    [gCreative, gAttack],
    active,
    { creative: 0, attacking: 5 },
    {},
  );
  // B is in both groups; creative contributes 0, attacking contributes 5
  assert.equal(w[statB], 5);
});

test("buildEffectiveMoneyballStatWeights treats missing group weight as 1", () => {
  const active = new Set(["creative"]);
  const w = buildEffectiveMoneyballStatWeights([statA], [gCreative], active, {}, {});
  assert.equal(w[statA], 1);
});

test("buildEffectiveMoneyballStatWeights uses neutral group factor when all group weights are zero", () => {
  const active = new Set(["creative"]);
  const w = buildEffectiveMoneyballStatWeights(
    [statA],
    [gCreative],
    active,
    { creative: 0 },
    { [statA]: 4 },
  );
  assert.equal(w[statA], 4);
});

const rows: MoneyballRow[] = [
  {
    inf: "",
    player: "A",
    uniqueId: "1",
    basedIn: "X",
    division: "D1",
    nation: "N",
    club: "C",
    position: "D (C)",
    role: "outfield",
    age: 20,
    potential: "Unknown",
    wage: "",
    minutes: 900,
    minsPerGame: 90,
    appearancesRaw: "10",
    stats: { [MoneyballStat.PossessionLostPer90]: 10, [MoneyballStat.ShotsOnTargetPer90]: 1 },
  },
  {
    inf: "",
    player: "B",
    uniqueId: "2",
    basedIn: "X",
    division: "D1",
    nation: "N",
    club: "C",
    position: "D (C)",
    role: "outfield",
    age: 20,
    potential: "Unknown",
    wage: "",
    minutes: 900,
    minsPerGame: 90,
    appearancesRaw: "10",
    stats: { [MoneyballStat.PossessionLostPer90]: 20, [MoneyballStat.ShotsOnTargetPer90]: 2 },
  },
];

test("buildPercentiles applies lower-is-better inversions", () => {
  const result = buildPercentiles(rows, rows, [
    MoneyballStat.PossessionLostPer90,
    MoneyballStat.ShotsOnTargetPer90,
  ]);
  assert.ok((result["1"]?.[0] ?? 0) > (result["2"]?.[0] ?? 0));
  assert.ok((result["2"]?.[1] ?? 0) > (result["1"]?.[1] ?? 0));
});

test("buildPercentiles scores target rows not present in distribution set", () => {
  const baseline: MoneyballRow[] = [rows[0]!, rows[1]!];
  const target: MoneyballRow = {
    ...rows[0]!,
    uniqueId: "player-only",
    player: "Imported",
    stats: { [MoneyballStat.PossessionLostPer90]: 15, [MoneyballStat.ShotsOnTargetPer90]: 1.5 },
  };
  const result = buildPercentiles(baseline, [target], [
    MoneyballStat.PossessionLostPer90,
    MoneyballStat.ShotsOnTargetPer90,
  ]);
  assert.ok(Array.isArray(result["player-only"]));
  assert.equal(result["player-only"]!.length, 2);
  assert.equal(Object.keys(result).length, 1);
});

test("weightedScoreFromPercentiles ignores zero-weight stats", () => {
  const score = weightedScoreFromPercentiles(
    [100, 0],
    [statA, statB],
    { [statA]: 0, [statB]: 2 },
  );
  assert.equal(score, 0);
});

test("weightedScoreFromPercentiles returns zero when all weights disabled", () => {
  const score = weightedScoreFromPercentiles([85, 90], [statA, statB], { [statA]: 0, [statB]: 0 });
  assert.equal(score, 0);
});
