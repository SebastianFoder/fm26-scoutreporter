import test from "node:test";
import assert from "node:assert/strict";
import { buildDefaultRoleGroups } from "./group-presets";
import { MoneyballStat } from "./moneyball-stat";

test("buildDefaultRoleGroups creates outfield and gk presets from available keys", () => {
  const groups = buildDefaultRoleGroups([
    MoneyballStat.ProgressivePassesPer90,
    MoneyballStat.ExpectedAssistsPer90,
    MoneyballStat.ShotsOnTargetPer90,
    MoneyballStat.TacklesPer90,
    MoneyballStat.SprintsPer90,
    MoneyballStat.SavesPer90,
    MoneyballStat.ExpectedSavePercent,
  ]);
  assert.ok(groups.outfield.some((g) => g.name === "Passing"));
  assert.ok(groups.outfield.some((g) => g.name === "Chance creation & dribbling"));
  assert.ok(groups.outfield.some((g) => g.name === "Attacking"));
  assert.equal(
    groups.outfield.some((g) => g.name === "Goal prevention"),
    false,
  );
  assert.ok(groups.gk.some((g) => g.name === "Shot Stopping"));
  assert.equal(groups.gk.some((g) => g.name === "Distribution"), true);
});
