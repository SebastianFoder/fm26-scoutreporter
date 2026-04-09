import {
  MONEYBALL_REQUIRED_HEADERS,
  NON_STAT_HEADERS,
  isGoalkeeper,
} from "./schema";
import { isMoneyballStat, type MoneyballStat } from "./moneyball-stat";
import type { MoneyballImportResult, MoneyballRow } from "./types";

function toNumber(value: string): number {
  const normalized = value.replace(/[,%€\s]/g, "");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function splitCsvLine(line: string): string[] {
  // Export format is strict and does not include quoted semicolons.
  return line.split(";").map((x) => x.trim());
}

export function parseMoneyballCsv(csv: string): MoneyballImportResult {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return {
      rows: [],
      errors: [{ line: 1, message: "CSV must include header and at least one row." }],
      statKeys: [],
    };
  }

  const headers = splitCsvLine(lines[0]);
  const headerSet = new Set(headers);
  const errors: MoneyballImportResult["errors"] = [];

  for (const h of MONEYBALL_REQUIRED_HEADERS) {
    if (!headerSet.has(h)) {
      errors.push({ line: 1, message: `Missing required column: ${h}` });
    }
  }

  if (errors.length > 0) {
    return { rows: [], errors, statKeys: [] };
  }

  const col = (name: string) => headers.indexOf(name);
  const statKeyCandidates = headers.filter((h) => !NON_STAT_HEADERS.has(h));
  const unknown = statKeyCandidates.filter((h) => !isMoneyballStat(h));
  if (unknown.length > 0) {
    return {
      rows: [],
      errors: [
        {
          line: 1,
          message: `Unknown stat column(s): ${unknown.join(", ")}`,
        },
      ],
      statKeys: [],
    };
  }

  const statKeys = statKeyCandidates as MoneyballStat[];
  const rows: MoneyballRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length !== headers.length) {
      errors.push({
        line: i + 1,
        message: `Column count mismatch: expected ${headers.length}, got ${cols.length}.`,
      });
      continue;
    }

    const stats: Partial<Record<MoneyballStat, number>> = {};
    for (const key of statKeys) {
      stats[key] = toNumber(cols[col(key)] ?? "0");
    }

    const position = cols[col("Position")] ?? "";
    rows.push({
      inf: cols[col("Inf")] ?? "",
      player: cols[col("Player")] ?? "",
      uniqueId: cols[col("Unique ID")] ?? "",
      basedIn: cols[col("Based In")] ?? "",
      division: cols[col("Division")] ?? "",
      nation: cols[col("Nation")] ?? "",
      club: cols[col("Club")] ?? "",
      position,
      role: isGoalkeeper(position),
      age: toNumber(cols[col("Age")] ?? "0"),
      potential: cols[col("Potential")] ?? "",
      wage: cols[col("Wage")] ?? "",
      minutes: toNumber(cols[col("Minutes")] ?? "0"),
      minsPerGame: toNumber(cols[col("Mins/Gm")] ?? "0"),
      appearancesRaw: cols[col("Appearances")] ?? "",
      stats,
    });
  }

  return { rows, errors, statKeys };
}
