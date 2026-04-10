import type { MoneyballRow } from "@/features/moneyball/types";

export type MustermannPositionGroup =
  | "Goalkeeper"
  | "Defender"
  | "Midfielder"
  | "Attacker";

function normalizePositionParts(raw: string): string[] {
  return raw
    .toUpperCase()
    .split(/[\/,]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function classifyPositionPart(part: string): MustermannPositionGroup | null {
  if (/\bGK\b/.test(part)) return "Goalkeeper";
  if (/\bST\b/.test(part) || /\bAM\b/.test(part)) return "Attacker";
  if (/\bDM\b/.test(part) || /\bM\b/.test(part)) return "Midfielder";
  if (/\bWB\b/.test(part) || /\bD\b/.test(part)) return "Defender";
  return null;
}

export function mustermannPositionGroupFromBestPos(bestPos: string): MustermannPositionGroup {
  const parts = normalizePositionParts(bestPos);
  for (const p of parts) {
    const g = classifyPositionPart(p);
    if (g) return g;
  }
  return "Midfielder";
}

export function mustermannPositionGroupFromRow(
  row: Pick<MoneyballRow, "bestPos" | "position">,
): MustermannPositionGroup {
  const raw = row.bestPos?.trim() || row.position;
  return mustermannPositionGroupFromBestPos(raw);
}
