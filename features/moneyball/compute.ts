import { DIRECTION_MAP } from "./schema";
import type { MoneyballStat } from "./moneyball-stat";
import type { MoneyballRow, StatGroup } from "./types";

/** Stat override 0 means "no override" (multiplier 1); positive values multiply group-derived weight. */
export function buildEffectiveMoneyballStatWeights(
  scoredStatKeys: MoneyballStat[],
  groupsForRole: StatGroup[],
  activeGroupIds: ReadonlySet<string>,
  groupWeightMap: Record<string, number>,
  statWeights: Partial<Record<MoneyballStat, number>>,
): Record<string, number> {
  const hasAnyActiveGroups = activeGroupIds.size > 0;
  const effectiveStatWeights: Record<string, number> = {};
  for (const key of scoredStatKeys) {
    let fromGroups = 0;
    for (const group of groupsForRole) {
      if (!activeGroupIds.has(group.id) || !group.statKeys.includes(key)) continue;
      const raw = groupWeightMap[group.id];
      /** Missing entry defaults to 1 so unchecked groups are not multiplied to zero. Explicit 0 still means zero. */
      const groupWeight = Math.max(0, Math.round(raw !== undefined ? raw : 1));
      fromGroups += groupWeight;
    }
    const baseWeight = Math.max(0, Math.round(statWeights[key] ?? 0));
    const statMultiplier = baseWeight === 0 ? 1 : baseWeight;
    let groupFactor = hasAnyActiveGroups ? fromGroups : 1;
    /** If every contributing group weight is explicitly 0, fall back so stat-level multipliers still apply. */
    if (hasAnyActiveGroups && fromGroups === 0) {
      groupFactor = 1;
    }
    effectiveStatWeights[key] = groupFactor * statMultiplier;
  }
  return effectiveStatWeights;
}

function percentileRank(sortedValues: number[], value: number): number {
  if (sortedValues.length === 0) return 0;
  let lessOrEqual = 0;
  for (const v of sortedValues) {
    if (v <= value) lessOrEqual += 1;
  }
  return Math.round((lessOrEqual / sortedValues.length) * 100);
}

/**
 * Build percentile vectors for each target row using distributions from `distributionRows`.
 * Minimum minutes (and any other baseline population rules) apply only when building
 * `distributionRows`; targets are typically player-import rows scored against that baseline.
 */
export function buildPercentiles(
  distributionRows: MoneyballRow[],
  targetRows: MoneyballRow[],
  statKeys: MoneyballStat[],
): Record<string, number[]> {
  const distributions: Record<string, number[]> = {};
  for (const key of statKeys) {
    const values = distributionRows.map((r) => r.stats[key] ?? 0);
    distributions[key] = [...values].sort((a, b) => a - b);
  }

  return Object.fromEntries(
    targetRows.map((row) => {
      const p = statKeys.map((key) => {
        const value = row.stats[key] ?? 0;
        const base = percentileRank(distributions[key] ?? [], value);
        return DIRECTION_MAP.lowerIsBetter.has(key) ? 100 - base : base;
      });
      return [row.uniqueId, p];
    }),
  );
}

export function weightedScoreFromPercentiles(
  percentileVector: number[],
  statKeys: MoneyballStat[],
  statWeights: Partial<Record<MoneyballStat, number>>,
): number {
  if (percentileVector.length === 0) return 0;
  let weightedSum = 0;
  let totalWeight = 0;
  for (let i = 0; i < percentileVector.length; i += 1) {
    const key = statKeys[i];
    const w = Math.max(0, Math.round(statWeights[key] ?? 1));
    weightedSum += percentileVector[i] * w;
    totalWeight += w;
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}
