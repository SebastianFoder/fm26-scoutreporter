import type { MoneyballStat } from "./moneyball-stat";
import type { MoneyballRow, StatGroup } from "./types";

/** Map a global percentile row (aligned with `globalStatKeys`) into `orderedKeys` order for group helpers. */
export function percentileVectorForStatKeyOrder(
  globalPercentileRow: number[] | undefined,
  globalStatKeys: MoneyballStat[],
  orderedKeys: MoneyballStat[],
): number[] {
  if (!globalPercentileRow) return orderedKeys.map(() => 0);
  return orderedKeys.map((k) => {
    const i = globalStatKeys.indexOf(k);
    return i >= 0 ? (globalPercentileRow[i] ?? 0) : 0;
  });
}

export function averagePercentileForGroup(
  percentileVector: number[],
  roleGroupKeys: MoneyballStat[],
  group: StatGroup,
): number {
  const idxs = roleGroupKeys
    .map((k, i) => (group.statKeys.includes(k) ? i : -1))
    .filter((i) => i >= 0);
  if (idxs.length === 0) return 0;
  return idxs.reduce((s, i) => s + (percentileVector[i] ?? 0), 0) / idxs.length;
}

export function averageRawForGroup(
  stats: MoneyballRow["stats"],
  roleGroupKeys: MoneyballStat[],
  group: StatGroup,
): number {
  const keys = group.statKeys.filter((k) => roleGroupKeys.includes(k));
  if (keys.length === 0) return 0;
  return keys.reduce((s, k) => s + (stats[k] ?? 0), 0) / keys.length;
}

/** Stat keys belonging to `group`, in `roleGroupKeys` order (same indexing as percentile vector). */
export function statKeysForGroupInRoleOrder(
  roleGroupKeys: MoneyballStat[],
  group: StatGroup,
): MoneyballStat[] {
  return roleGroupKeys.filter((k) => group.statKeys.includes(k));
}

export function percentileValuesForGroup(
  percentileVector: number[],
  roleGroupKeys: MoneyballStat[],
  group: StatGroup,
): number[] {
  return statKeysForGroupInRoleOrder(roleGroupKeys, group).map((k) => {
    const i = roleGroupKeys.indexOf(k);
    return percentileVector[i] ?? 0;
  });
}
