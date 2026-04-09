import { ROLE_CATEGORY_DEFINITIONS, ROLE_STAT_CATEGORY_LOOKUP } from "./group-presets";
import type { MoneyballStat } from "./moneyball-stat";
import type { PlayerRole } from "./types";

export interface StatSection {
  id: string;
  title: string;
  statKeys: MoneyballStat[];
}

export function groupStatKeysForRoleDisplay(
  role: PlayerRole,
  visibleStatKeys: MoneyballStat[],
): StatSection[] {
  const categories = ROLE_CATEGORY_DEFINITIONS[role];
  const categoryByStatKey = ROLE_STAT_CATEGORY_LOOKUP[role];
  const buckets = new Map<string, MoneyballStat[]>(
    categories.map((category) => [category.id, [] as MoneyballStat[]]),
  );
  const other: MoneyballStat[] = [];

  for (const key of visibleStatKeys) {
    const categoryId = categoryByStatKey[key];
    if (!categoryId || !buckets.has(categoryId)) {
      other.push(key);
      continue;
    }
    buckets.get(categoryId)?.push(key);
  }

  const orderedSections = categories
    .map((category) => ({
      id: category.id,
      title: category.title,
      statKeys: buckets.get(category.id) ?? [],
    }))
    .filter((section) => section.statKeys.length > 0);

  if (other.length > 0) {
    orderedSections.push({ id: "other", title: "Other", statKeys: other });
  }

  return orderedSections;
}
