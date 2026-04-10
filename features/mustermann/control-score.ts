import { MoneyballStat } from "@/features/moneyball/moneyball-stat";
import type { MoneyballRow } from "@/features/moneyball/types";

export type ControlScoreInput = {
  xA: number;
  opKP: number;
  goals: number;
  xG: number;
  shots: number;
  presC: number;
  presA: number;
  possWon: number;
  possLost: number;
  passesAttempted: number;
  optaRank: number;
};

export type ControlScoreResult = {
  creationIndex: number;
  scoringIndex: number;
  pressureIndex: number;
  possessionIndex: number;
  defendCategoryScore: number;
  supportCategoryScore: number;
  createCategoryScore: number;
  scoreCategoryScore: number;
  possessionLossRate: number;
  possessionLossPercent: number;
  indexSum: number;
  controlScore: number;
};

export type ExcitementScoreInput = {
  keyTackles: number;
  shotsBlocked: number;
  progressivePasses: number;
  shots: number;
  openPlayKeyPasses: number;
  dribbles: number;
  offsidesPer90: number;
  optaRank: number;
};

export type ExcitementLeagueAverages = {
  keyTackles: number;
  shotsBlocked: number;
  progressivePasses: number;
  shots: number;
  openPlayKeyPasses: number;
  dribbles: number;
  offsidesPer90: number;
};

export type ExcitementScoreResult = {
  attackActionRatio: number;
  offsidePenaltyRatio: number;
  leagueFactor: number;
  excitementFactor: number;
};

export type EffortScoreInput = {
  distanceCoveredPer90: number;
  sprintsPer90: number;
  tacklesAttempted: number;
  pressuresAttemptedPer90: number;
  headersAttempted: number;
  minutes: number;
  optaRank: number;
};

export type EffortTotals = {
  distanceCoveredTotal: number;
  sprintsTotal: number;
  tacklesAttempted: number;
  pressuresAttemptedTotal: number;
  headersAttempted: number;
};

export type EffortPercentiles = {
  distanceCoveredTotal: number;
  sprintsTotal: number;
  tacklesAttempted: number;
  pressuresAttemptedTotal: number;
  headersAttempted: number;
};

export type EffortScoreResult = {
  totals: EffortTotals;
  percentiles: EffortPercentiles;
  baseEffort: number;
  leagueFactor: number;
  effortScore: number;
};

export const OPTA_RANK_DIVISOR = 2.55;
export const DEFAULT_OPTA_RANK = 25;

export function leagueFactorFromStoredOptaValue(stored: number): number {
  return stored / OPTA_RANK_DIVISOR;
}

export function resolveOptaRank(
  rankings: Readonly<Record<string, number>>,
  divisionKey: string,
): { rank: number; isDefault: boolean } {
  const v = rankings[divisionKey];
  if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) {
    return { rank: DEFAULT_OPTA_RANK, isDefault: true };
  }
  return { rank: v, isDefault: false };
}

export function computeControlScore(input: ControlScoreInput): ControlScoreResult {
  const creationIndex = input.opKP > 0 ? input.xA * (input.xA / input.opKP) * 67.5 : 0;
  const scoringIndex = input.shots > 0 ? input.goals * (input.xG / input.shots) * 54 : 0;
  const pressureIndex = input.presA > 0 ? input.presC * (input.presC / input.presA) * 2.23 : 0;
  const possessionIndex = input.possWon / 7.66;
  const rawPossessionLossRate = input.passesAttempted > 0 ? 1 - input.possLost / input.passesAttempted : 0;
  const possessionLossRate = Math.max(0, Math.min(1, rawPossessionLossRate));
  const leagueFactor = leagueFactorFromStoredOptaValue(input.optaRank);
  const plrOlr = possessionLossRate * leagueFactor;
  const defendCategoryScore = (pressureIndex * 0.2 + possessionIndex * 0.8) * plrOlr;
  const supportCategoryScore =
    (creationIndex * 0.2 + pressureIndex * 0.4 + possessionIndex * 0.4) * plrOlr;
  const createCategoryScore =
    (pressureIndex * 0.2 + scoringIndex * 0.2 + creationIndex * 0.6) * plrOlr;
  const scoreCategoryScore =
    (pressureIndex * 0.2 + creationIndex * 0.2 + scoringIndex * 0.6) * plrOlr;
  const indexSum = creationIndex + scoringIndex + pressureIndex + possessionIndex;
  const controlScore = indexSum * plrOlr;
  return {
    creationIndex,
    scoringIndex,
    pressureIndex,
    possessionIndex,
    defendCategoryScore,
    supportCategoryScore,
    createCategoryScore,
    scoreCategoryScore,
    possessionLossRate,
    possessionLossPercent: possessionLossRate * 100,
    indexSum,
    controlScore,
  };
}

function ratioOrZero(numerator: number, denominator: number): number {
  return denominator > 0 ? numerator / denominator : 0;
}

export function computeExcitementFactor(
  input: ExcitementScoreInput,
  averages: ExcitementLeagueAverages,
): ExcitementScoreResult {
  const attackActionRatio =
    ratioOrZero(input.keyTackles, averages.keyTackles) +
    ratioOrZero(input.shotsBlocked, averages.shotsBlocked) +
    ratioOrZero(input.progressivePasses, averages.progressivePasses) +
    ratioOrZero(input.shots, averages.shots) +
    ratioOrZero(input.openPlayKeyPasses, averages.openPlayKeyPasses) +
    ratioOrZero(input.dribbles, averages.dribbles);
  const offsidePenaltyRatio = ratioOrZero(input.offsidesPer90, averages.offsidesPer90);
  const leagueFactor = leagueFactorFromStoredOptaValue(input.optaRank);
  return {
    attackActionRatio,
    offsidePenaltyRatio,
    leagueFactor,
    excitementFactor: (attackActionRatio - offsidePenaltyRatio) * leagueFactor,
  };
}

function totalFromPer90(per90: number, minutes: number): number {
  const validMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 0;
  if (validMinutes === 0) return 0;
  return (per90 * validMinutes) / 90;
}

export function effortTotalsFromInput(input: EffortScoreInput): EffortTotals {
  return {
    distanceCoveredTotal: totalFromPer90(input.distanceCoveredPer90, input.minutes),
    sprintsTotal: totalFromPer90(input.sprintsPer90, input.minutes),
    tacklesAttempted: input.tacklesAttempted,
    pressuresAttemptedTotal: totalFromPer90(input.pressuresAttemptedPer90, input.minutes),
    headersAttempted: input.headersAttempted,
  };
}

export function computeEffortScore(
  totals: EffortTotals,
  percentiles: EffortPercentiles,
  optaRank: number,
): EffortScoreResult {
  const baseEffort =
    (percentiles.distanceCoveredTotal +
      percentiles.sprintsTotal +
      percentiles.tacklesAttempted +
      percentiles.pressuresAttemptedTotal +
      percentiles.headersAttempted) /
    5;
  const leagueFactor = leagueFactorFromStoredOptaValue(optaRank);
  return {
    totals,
    percentiles,
    baseEffort,
    leagueFactor,
    effortScore: baseEffort * leagueFactor,
  };
}

export function controlScoreInputFromRow(
  row: Pick<MoneyballRow, "stats">,
  optaRank: number,
): ControlScoreInput {
  const s = row.stats;
  return {
    xA: s[MoneyballStat.ExpectedAssistsPer90] ?? 0,
    opKP: s[MoneyballStat.OpenPlayKeyPassesPer90] ?? 0,
    goals: s[MoneyballStat.GoalsPer90] ?? 0,
    xG: s[MoneyballStat.ExpectedGoalsPer90] ?? 0,
    shots: s[MoneyballStat.ShotsPer90] ?? 0,
    presC: s[MoneyballStat.PressuresCompletedPer90] ?? 0,
    presA: s[MoneyballStat.PressuresAttemptedPer90] ?? 0,
    possWon: s[MoneyballStat.PossessionWonPer90] ?? 0,
    possLost: s[MoneyballStat.PossessionLostPer90] ?? 0,
    passesAttempted: s[MoneyballStat.PassesAttemptedPer90] ?? 0,
    optaRank,
  };
}

export function excitementScoreInputFromRow(
  row: Pick<MoneyballRow, "stats">,
  optaRank: number,
): ExcitementScoreInput {
  const s = row.stats;
  return {
    keyTackles: s[MoneyballStat.KeyTacklesPer90] ?? 0,
    shotsBlocked: s[MoneyballStat.ShotsBlockedPer90] ?? 0,
    progressivePasses: s[MoneyballStat.ProgressivePassesPer90] ?? 0,
    shots: s[MoneyballStat.ShotsPer90] ?? 0,
    openPlayKeyPasses: s[MoneyballStat.OpenPlayKeyPassesPer90] ?? 0,
    dribbles: s[MoneyballStat.DribblesPer90] ?? 0,
    offsidesPer90: s[MoneyballStat.OffsidesPer90] ?? 0,
    optaRank,
  };
}

export function effortScoreInputFromRow(
  row: Pick<MoneyballRow, "stats" | "minutes">,
  optaRank: number,
): EffortScoreInput {
  const s = row.stats;
  return {
    distanceCoveredPer90: s[MoneyballStat.DistanceCoveredPer90] ?? 0,
    sprintsPer90: s[MoneyballStat.SprintsPer90] ?? 0,
    tacklesAttempted: s[MoneyballStat.TacklesAttempted] ?? 0,
    pressuresAttemptedPer90: s[MoneyballStat.PressuresAttemptedPer90] ?? 0,
    headersAttempted: s[MoneyballStat.HeadersAttempted] ?? 0,
    minutes: row.minutes ?? 0,
    optaRank,
  };
}
