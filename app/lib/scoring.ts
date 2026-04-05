import type { PlayerWithGroups } from "../data/players-store";
import type { AttributeWeights, AttributeKey } from "../types/weights";

const DEFAULT_WEIGHT = 1;
const BASELINE_AVG_ATTRIBUTE = 13;

/** >1 makes high/low weight ratios affect the score more strongly (flat profiles unchanged). */
const WEIGHT_EMPHASIS = 2;

export function getPlayerAttributeValue(
  p: PlayerWithGroups,
  key: AttributeKey,
): number {
  const g = p.grouped;
  if (key in g.goalkeeping) return (g.goalkeeping as Record<string, number>)[key];
  if (key in g.technical) return (g.technical as Record<string, number>)[key];
  if (key in g.mental) return (g.mental as Record<string, number>)[key];
  if (key in g.physical) return (g.physical as Record<string, number>)[key];
  return 0;
}

export function computeScore(
  player: PlayerWithGroups,
  weights: AttributeWeights,
): number {
  let sum = 0;
  let totalWeight = 0;

  for (const key of Object.keys(weights) as AttributeKey[]) {
    const w = weights[key] ?? DEFAULT_WEIGHT;
    const wEff = Math.pow(w, WEIGHT_EMPHASIS);
    const v = getPlayerAttributeValue(player, key);
    sum += v * wEff;
    totalWeight += wEff;
  }

  if (totalWeight === 0) return 0;
  const weightedAvg = sum / totalWeight; // 1–20 scale

  // Scale so a weighted average of 13 becomes 100.
  // Example: 13 => 100, 10 => 76.92, 16 => 123.08
  return (weightedAvg / BASELINE_AVG_ATTRIBUTE) * 100;
}
