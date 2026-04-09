import test from "node:test";
import assert from "node:assert/strict";
import {
  percentileVectorForStatKeyOrder,
  percentileValuesForGroup,
  statKeysForGroupInRoleOrder,
} from "./group-percentiles";
import { MoneyballStat } from "./moneyball-stat";
import type { StatGroup } from "./types";

const kA = MoneyballStat.ProgressivePassesPer90;
const kB = MoneyballStat.ShotsOnTargetPer90;
const kC = MoneyballStat.ExpectedGoalsPer90;
const kD = MoneyballStat.DribblesPer90;

const g: StatGroup = {
  id: "g1",
  name: "Group one",
  statKeys: [kB, kD],
  weight: 1,
};

test("statKeysForGroupInRoleOrder follows roleGroupKeys order", () => {
  const roleGroupKeys = [kA, kB, kC, kD];
  assert.deepEqual(statKeysForGroupInRoleOrder(roleGroupKeys, g), [kB, kD]);
});

test("percentileValuesForGroup maps percentiles by role key index", () => {
  const roleGroupKeys = [kA, kB, kC, kD];
  const percentileVector = [10, 20, 30, 40];
  assert.deepEqual(percentileValuesForGroup(percentileVector, roleGroupKeys, g), [20, 40]);
});

test("percentileVectorForStatKeyOrder reorders global percentiles to match ordered keys", () => {
  const kX = MoneyballStat.ExpectedAssistsPer90;
  const kY = MoneyballStat.ChancesCreatedPer90;
  const kZ = MoneyballStat.AssistsPer90;
  const globalStatKeys = [kX, kY, kZ];
  const globalRow = [5, 15, 25];
  assert.deepEqual(
    percentileVectorForStatKeyOrder(globalRow, globalStatKeys, [kZ, kX]),
    [25, 5],
  );
});
