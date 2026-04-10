import {
  computeEffortScore,
  effortTotalsFromInput,
  type EffortPercentiles,
  type EffortScoreInput,
  type EffortScoreResult,
  type EffortTotals,
} from "./control-score";

export type MustermannEffortPercentileInput = {
  divisionKey: string;
  effortInput: EffortScoreInput;
  optaRank: number;
};

function percentileRank(sortedValues: number[], value: number): number {
  if (sortedValues.length === 0) return 0;
  let lessOrEqual = 0;
  for (const v of sortedValues) {
    if (v <= value) lessOrEqual += 1;
  }
  return Math.round((lessOrEqual / sortedValues.length) * 100);
}

export function withMustermannEffortScores<T extends MustermannEffortPercentileInput>(
  rows: T[],
): Array<T & { effort: EffortScoreResult }> {
  const totalsByDivision = new Map<
    string,
    {
      distanceCoveredTotal: number[];
      sprintsTotal: number[];
      tacklesAttempted: number[];
      pressuresAttemptedTotal: number[];
      headersAttempted: number[];
    }
  >();

  const rowsWithTotals: Array<T & { totals: EffortTotals }> = rows.map((row) => ({
    ...row,
    totals: effortTotalsFromInput(row.effortInput),
  }));

  for (const row of rowsWithTotals) {
    const current = totalsByDivision.get(row.divisionKey) ?? {
      distanceCoveredTotal: [],
      sprintsTotal: [],
      tacklesAttempted: [],
      pressuresAttemptedTotal: [],
      headersAttempted: [],
    };
    current.distanceCoveredTotal.push(row.totals.distanceCoveredTotal);
    current.sprintsTotal.push(row.totals.sprintsTotal);
    current.tacklesAttempted.push(row.totals.tacklesAttempted);
    current.pressuresAttemptedTotal.push(row.totals.pressuresAttemptedTotal);
    current.headersAttempted.push(row.totals.headersAttempted);
    totalsByDivision.set(row.divisionKey, current);
  }

  for (const totals of totalsByDivision.values()) {
    totals.distanceCoveredTotal.sort((a, b) => a - b);
    totals.sprintsTotal.sort((a, b) => a - b);
    totals.tacklesAttempted.sort((a, b) => a - b);
    totals.pressuresAttemptedTotal.sort((a, b) => a - b);
    totals.headersAttempted.sort((a, b) => a - b);
  }

  return rowsWithTotals.map((row) => {
    const totals = totalsByDivision.get(row.divisionKey);
    const percentiles: EffortPercentiles = totals
      ? {
          distanceCoveredTotal: percentileRank(
            totals.distanceCoveredTotal,
            row.totals.distanceCoveredTotal,
          ),
          sprintsTotal: percentileRank(totals.sprintsTotal, row.totals.sprintsTotal),
          tacklesAttempted: percentileRank(totals.tacklesAttempted, row.totals.tacklesAttempted),
          pressuresAttemptedTotal: percentileRank(
            totals.pressuresAttemptedTotal,
            row.totals.pressuresAttemptedTotal,
          ),
          headersAttempted: percentileRank(totals.headersAttempted, row.totals.headersAttempted),
        }
      : {
          distanceCoveredTotal: 0,
          sprintsTotal: 0,
          tacklesAttempted: 0,
          pressuresAttemptedTotal: 0,
          headersAttempted: 0,
        };

    return {
      ...row,
      effort: computeEffortScore(row.totals, percentiles, row.optaRank),
    };
  });
}
