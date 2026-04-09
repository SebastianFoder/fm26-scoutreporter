import type { MoneyballRow } from "./types";

/** Separates basedIn and division in stored keys; unlikely in CSV text. */
export const DIVISION_KEY_SEP = "\u001f";

export function encodeDivisionKey(basedIn: string, division: string): string {
  return `${basedIn}${DIVISION_KEY_SEP}${division}`;
}

export function divisionKeyFromRow(row: Pick<MoneyballRow, "basedIn" | "division">): string {
  return encodeDivisionKey(row.basedIn, row.division);
}

export function rowMatchesDivisionKey(
  row: Pick<MoneyballRow, "basedIn" | "division">,
  key: string,
): boolean {
  return divisionKeyFromRow(row) === key;
}

/** All unique composite keys for baseline rows, sorted for stable persistence. */
export function allDivisionKeysFromRows(rows: MoneyballRow[]): string[] {
  return [...new Set(rows.map((r) => divisionKeyFromRow(r)))].sort((a, b) =>
    a.localeCompare(b),
  );
}
