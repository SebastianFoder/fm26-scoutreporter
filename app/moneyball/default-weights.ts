import { MoneyballStat } from "./moneyball-stat";
import type { PlayerRole, StatGroup } from "./types";

/**
 * Default goalkeeper weights aligned with the FM26 “Scout Smarter” GK framework:
 * Tier 1 (shot-stopping impact) dominates; Tier 2 (distribution) is secondary;
 * workload (Saves/90) and optional penalty stats are light tie-breakers.
 *
 * Group IDs match `buildDefaultRoleGroups`: `gk-${preset.id}`.
 * Stat overrides use only stats that do not appear in outfield preset groups, so
 * outfield scoring is unchanged when the same profile is shared.
 */
export const DEFAULT_GK_GROUP_WEIGHTS: Record<string, number> = {
  "gk-shot-stopping": 70,
  "gk-distribution": 30,
};

/** Restores group sliders after "Reset groups" (per-role defaults). */
export function defaultGroupWeightsForRole(
  role: PlayerRole,
  groups: StatGroup[],
): Record<string, number> {
  if (role === "gk") {
    return Object.fromEntries(groups.map((g) => [g.id, DEFAULT_GK_GROUP_WEIGHTS[g.id] ?? 1]));
  }
  return Object.fromEntries(groups.map((g) => [g.id, 1]));
}

/**
 * Stat multipliers (0 = default multiplier 1 in compute). Higher = more influence
 * within the weighted percentile score for goalkeepers.
 */
export const DEFAULT_GK_STAT_WEIGHTS: Partial<Record<MoneyballStat, number>> = {
  [MoneyballStat.ExpectedGoalsPreventedPer90]: 5,
  [MoneyballStat.SavePercent]: 4,
  [MoneyballStat.ExpectedSavePercent]: 4,
  [MoneyballStat.SavesPer90]: 2,
  [MoneyballStat.CleanSheetsPer90]: 1,
  [MoneyballStat.PenaltiesFaced]: 1,
  [MoneyballStat.PenaltiesSaved]: 1,
  [MoneyballStat.PenaltiesSavedRatio]: 1,
};
