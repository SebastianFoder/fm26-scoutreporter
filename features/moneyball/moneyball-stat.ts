/** FM export column names (CSV header values). Use enum members in code; values stay verbatim for CSV/JSON. */
export enum MoneyballStat {
  AerialDuelsAttemptedPer90 = "Aer A/90",
  AssistsPer90 = "Asts/90",
  BlocksPer90 = "Blk/90",
  ClearCutChances = "CCC",
  ChancesCreatedPer90 = "Ch C/90",
  CleanSheetsPer90 = "Cln/90",
  ClearancesPer90 = "Clr/90",
  GoalsConcededPer90 = "Con/90",
  ShotConversionPercent = "Conv %",
  CrossesCompletedToAttemptedRatio = "Cr C/A",
  CrossesCompletedPer90 = "Cr C/90",
  CrossesAttemptedPer90 = "Crs A/90",
  DistanceCoveredPer90 = "Dist/90",
  DribblesPer90 = "Drb/90",
  GoalsPer90 = "Goals per 90 minutes",
  HeaderWinPercent = "Hdr %",
  Headers = "Hdrs",
  HeadersAttempted = "Hdrs A",
  HeadersLostPer90 = "Hdrs L/90",
  HeadersWonPer90 = "Hdrs W/90",
  InterceptionsPer90 = "Int/90",
  KeyHeadersPer90 = "K Hdrs/90",
  KeyTacklesPer90 = "K Tck/90",
  MinutesPerGoal = "Mins/Gl",
  MistakesLeadingToGoal = "MLG",
  NonPenaltyExpectedGoalsPer90 = "NP-xG/90",
  OpenPlayCrossCompletionPercent = "OP-Cr %",
  OpenPlayCrossesAttemptedPer90 = "OP-Crs A/90",
  OpenPlayCrossesCompletedPer90 = "OP-Crs C/90",
  OpenPlayKeyPassesPer90 = "OP-KP/90",
  PassCompletionPercent = "Pas %",
  PossessionLostPer90 = "Poss Lost/90",
  PossessionWonPer90 = "Poss Won/90",
  ProgressivePassesPer90 = "Pr passes/90",
  PressuresAttemptedPer90 = "Pres A/90",
  PressuresCompletedPer90 = "Pres C/90",
  PassesAttemptedPer90 = "Ps A/90",
  PassesCompletedPer90 = "Ps C/90",
  PenaltiesFaced = "Pens Faced",
  PenaltiesSaved = "Pens Saved",
  PenaltiesSavedRatio = "Pens Saved Ratio",
  SavesPer90 = "Saves/90",
  SavePercent = "Sv %",
  ShotAccuracyPercent = "Shot %",
  ShotsOnTargetPer90 = "ShT/90",
  ShotsBlockedPer90 = "Shts Blckd/90",
  SprintsPer90 = "Sprints/90",
  TackleSuccessPercent = "Tck R",
  TacklesPer90 = "Tck/90",
  TeamGoalsConcededPer90 = "Tcon/90",
  TeamGoalsPer90 = "Tgls/90",
  ExpectedAssistsPer90 = "xA/90",
  ExpectedGoalsPer90 = "xG/90",
  ExpectedGoalsPreventedPer90 = "xGP/90",
  ExpectedSavePercent = "xSv %",
}

const MONEYBALL_STAT_LABELS: Record<MoneyballStat, string> = {
  [MoneyballStat.AerialDuelsAttemptedPer90]: "Aerial Duels Attempted / 90",
  [MoneyballStat.AssistsPer90]: "Assists / 90",
  [MoneyballStat.BlocksPer90]: "Blocks / 90",
  [MoneyballStat.ClearCutChances]: "Clear-Cut Chances",
  [MoneyballStat.ChancesCreatedPer90]: "Chances Created / 90",
  [MoneyballStat.CleanSheetsPer90]: "Clean Sheets / 90",
  [MoneyballStat.ClearancesPer90]: "Clearances / 90",
  [MoneyballStat.GoalsConcededPer90]: "Goals Conceded / 90",
  [MoneyballStat.ShotConversionPercent]: "Shot Conversion %",
  [MoneyballStat.CrossesCompletedToAttemptedRatio]: "Crosses Completed / Attempted",
  [MoneyballStat.CrossesCompletedPer90]: "Crosses Completed / 90",
  [MoneyballStat.CrossesAttemptedPer90]: "Crosses Attempted / 90",
  [MoneyballStat.DistanceCoveredPer90]: "Distance Covered / 90",
  [MoneyballStat.DribblesPer90]: "Dribbles / 90",
  [MoneyballStat.GoalsPer90]: "Goals / 90",
  [MoneyballStat.HeaderWinPercent]: "Header Win %",
  [MoneyballStat.Headers]: "Headers",
  [MoneyballStat.HeadersAttempted]: "Headers Attempted",
  [MoneyballStat.HeadersLostPer90]: "Headers Lost / 90",
  [MoneyballStat.HeadersWonPer90]: "Headers Won / 90",
  [MoneyballStat.InterceptionsPer90]: "Interceptions / 90",
  [MoneyballStat.KeyHeadersPer90]: "Key Headers / 90",
  [MoneyballStat.KeyTacklesPer90]: "Key Tackles / 90",
  [MoneyballStat.MinutesPerGoal]: "Minutes per Goal",
  [MoneyballStat.MistakesLeadingToGoal]: "Mistakes Leading to Goal",
  [MoneyballStat.NonPenaltyExpectedGoalsPer90]: "Non-Penalty xG / 90",
  [MoneyballStat.OpenPlayCrossCompletionPercent]: "Open-Play Cross Completion %",
  [MoneyballStat.OpenPlayCrossesAttemptedPer90]: "Open-Play Crosses Attempted / 90",
  [MoneyballStat.OpenPlayCrossesCompletedPer90]: "Open-Play Crosses Completed / 90",
  [MoneyballStat.OpenPlayKeyPassesPer90]: "Open-Play Key Passes / 90",
  [MoneyballStat.PassCompletionPercent]: "Pass Completion %",
  [MoneyballStat.PossessionLostPer90]: "Possession Lost / 90",
  [MoneyballStat.PossessionWonPer90]: "Possession Won / 90",
  [MoneyballStat.ProgressivePassesPer90]: "Progressive Passes / 90",
  [MoneyballStat.PressuresAttemptedPer90]: "Pressures Attempted / 90",
  [MoneyballStat.PressuresCompletedPer90]: "Pressures Completed / 90",
  [MoneyballStat.PassesAttemptedPer90]: "Passes Attempted / 90",
  [MoneyballStat.PassesCompletedPer90]: "Passes Completed / 90",
  [MoneyballStat.PenaltiesFaced]: "Penalties Faced",
  [MoneyballStat.PenaltiesSaved]: "Penalties Saved",
  [MoneyballStat.PenaltiesSavedRatio]: "Penalties Saved Ratio",
  [MoneyballStat.SavesPer90]: "Saves / 90",
  [MoneyballStat.SavePercent]: "Save %",
  [MoneyballStat.ShotAccuracyPercent]: "Shot Accuracy %",
  [MoneyballStat.ShotsOnTargetPer90]: "Shots on Target / 90",
  [MoneyballStat.ShotsBlockedPer90]: "Shots Blocked / 90",
  [MoneyballStat.SprintsPer90]: "Sprints / 90",
  [MoneyballStat.TackleSuccessPercent]: "Tackle Success %",
  [MoneyballStat.TacklesPer90]: "Tackles / 90",
  [MoneyballStat.TeamGoalsConcededPer90]: "Team Goals Conceded / 90",
  [MoneyballStat.TeamGoalsPer90]: "Team Goals / 90",
  [MoneyballStat.ExpectedAssistsPer90]: "Expected Assists / 90",
  [MoneyballStat.ExpectedGoalsPer90]: "Expected Goals / 90",
  [MoneyballStat.ExpectedGoalsPreventedPer90]: "Expected Goals Prevented / 90",
  [MoneyballStat.ExpectedSavePercent]: "Expected Save %",
};

const MONEYBALL_STAT_VALUE_SET = new Set<string>(
  Object.values(MoneyballStat) as string[],
);

export const ALL_MONEYBALL_STATS = Object.values(MoneyballStat) as MoneyballStat[];

export function isMoneyballStat(h: string): h is MoneyballStat {
  return MONEYBALL_STAT_VALUE_SET.has(h);
}

function titleCaseToken(token: string): string {
  if (!token) return token;
  return token[0].toUpperCase() + token.slice(1).toLowerCase();
}

function normalizeFallbackLabel(rawKey: string): string {
  const key = rawKey.trim().replace(/\s+/g, " ");
  const unitsMatch = key.match(/(\/\d+)$/);
  const units = unitsMatch?.[1] ?? "";
  const withoutUnits = units ? key.slice(0, -units.length).trim() : key;

  const expanded = withoutUnits
    .replace(/_/g, " ")
    .replace(/%/g, " %")
    .replace(/\s*\/\s*/g, " / ")
    .split(" ")
    .filter(Boolean)
    .map((token) => {
      if (/^\d+$/.test(token)) return token;
      if (token === "%" || token === "/") return token;
      if (/^[A-Z]{2,}$/.test(token)) return token;
      return titleCaseToken(token);
    })
    .join(" ")
    .replace(/\s+%/g, " %")
    .replace(/\s+\/\s+/g, " / ");

  return units ? `${expanded} ${units}` : expanded;
}

export function getStatLabel(key: MoneyballStat): string;
export function getStatLabel(key: string): string;
export function getStatLabel(key: MoneyballStat | string): string {
  if (isMoneyballStat(key)) {
    return MONEYBALL_STAT_LABELS[key];
  }
  return normalizeFallbackLabel(key);
}

export function normalizeStatWeights(
  raw: Record<string, number> | undefined,
): Partial<Record<MoneyballStat, number>> {
  if (!raw) return {};
  const out: Partial<Record<MoneyballStat, number>> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (isMoneyballStat(k)) out[k] = v;
  }
  return out;
}

/** Keys present on a row's stats object, in insertion order, limited to known enum members. */
export function moneyballStatKeysFromStatsRecord(
  stats: Partial<Record<string, number>> | undefined,
): MoneyballStat[] {
  if (!stats) return [];
  const out: MoneyballStat[] = [];
  const seen = new Set<string>();
  for (const key of Object.keys(stats)) {
    if (isMoneyballStat(key) && !seen.has(key)) {
      seen.add(key);
      out.push(key);
    }
  }
  return out;
}

type RowWithStats = { stats: Partial<Record<string, number>> };

/**
 * Prefer stored stat key order when valid; otherwise derive from baseline row stats, then player rows.
 * Used when hydrating from IndexedDB so stat columns still resolve if stored metadata was missing or stale.
 */
export function resolveStatKeysFromStored(
  raw: string[] | undefined,
  baselineRows: RowWithStats[],
  playerRows: RowWithStats[],
): MoneyballStat[] {
  const filtered = (raw ?? []).filter(isMoneyballStat);
  if (filtered.length > 0) return filtered;
  if (baselineRows.length > 0) {
    const fromBaseline = moneyballStatKeysFromStatsRecord(baselineRows[0]?.stats);
    if (fromBaseline.length > 0) return fromBaseline;
  }
  if (playerRows.length > 0) {
    return moneyballStatKeysFromStatsRecord(playerRows[0]?.stats);
  }
  return [];
}
