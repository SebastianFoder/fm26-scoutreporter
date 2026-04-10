import test from "node:test";
import assert from "node:assert/strict";
import { buildMustermannRoleGroups } from "./group-presets";
import { MoneyballStat } from "@/features/moneyball/moneyball-stat";

test("buildMustermannRoleGroups includes Mustermann stat keys when present", () => {
  const keys = [
    MoneyballStat.ShotsPer90,
    MoneyballStat.KeyPassesPer90,
    MoneyballStat.HeadersAttemptedPer90,
    MoneyballStat.ProgressivePassesPer90,
    MoneyballStat.TacklesPer90,
    MoneyballStat.SavesPer90,
  ];
  const groups = buildMustermannRoleGroups(keys);
  const passing = groups.outfield.find((g) => g.name === "Passing");
  assert.ok(passing?.statKeys.includes(MoneyballStat.KeyPassesPer90));
});
