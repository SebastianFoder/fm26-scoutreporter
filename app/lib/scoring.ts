import type { PlayerWithGroups } from "../data/players-store";
import type { AttributeWeights, AttributeKey } from "../types/weights";

const DEFAULT_WEIGHT = 1;
const BASELINE_AVG_ATTRIBUTE = 13;

function getAttributeValue(p: PlayerWithGroups, key: AttributeKey): number {
  const g = p.grouped;
  if (key in g.goalkeeping) return (g.goalkeeping as any)[key];
  if (key in g.technical) return (g.technical as any)[key];
  if (key in g.mental) return (g.mental as any)[key];
  if (key in g.physical) return (g.physical as any)[key];
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
    const v = getAttributeValue(player, key);
    sum += v * w;
    totalWeight += w;
  }

  if (totalWeight === 0) return 0;
  const weightedAvg = sum / totalWeight; // 1–20 scale

  // Scale so a weighted average of 13 becomes 100.
  // Example: 13 => 100, 10 => 76.92, 16 => 123.08
  return (weightedAvg / BASELINE_AVG_ATTRIBUTE) * 100;
}
