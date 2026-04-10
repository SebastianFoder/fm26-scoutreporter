import type { ControlScoreResult } from "./control-score";
import type { MustermannPositionGroup } from "./mustermann-position-group";

export type MustermannCategoryPercentiles = {
  defend: number;
  support: number;
  create: number;
  score: number;
};

export type MustermannCategoryPercentileInput = {
  positionGroup: MustermannPositionGroup;
  scores: Pick<
    ControlScoreResult,
    | "defendCategoryScore"
    | "supportCategoryScore"
    | "createCategoryScore"
    | "scoreCategoryScore"
  >;
};

function percentileRank(sortedValues: number[], value: number): number {
  if (sortedValues.length === 0) return 0;
  let lessOrEqual = 0;
  for (const v of sortedValues) {
    if (v <= value) lessOrEqual += 1;
  }
  return Math.round((lessOrEqual / sortedValues.length) * 100);
}

export function withMustermannCategoryPercentiles<T extends MustermannCategoryPercentileInput>(
  rows: T[],
): Array<T & { categoryPercentiles: MustermannCategoryPercentiles }> {
  const grouped = new Map<
    MustermannPositionGroup,
    { defend: number[]; support: number[]; create: number[]; score: number[] }
  >();
  for (const row of rows) {
    const current = grouped.get(row.positionGroup) ?? {
      defend: [],
      support: [],
      create: [],
      score: [],
    };
    current.defend.push(row.scores.defendCategoryScore);
    current.support.push(row.scores.supportCategoryScore);
    current.create.push(row.scores.createCategoryScore);
    current.score.push(row.scores.scoreCategoryScore);
    grouped.set(row.positionGroup, current);
  }
  for (const values of grouped.values()) {
    values.defend.sort((a, b) => a - b);
    values.support.sort((a, b) => a - b);
    values.create.sort((a, b) => a - b);
    values.score.sort((a, b) => a - b);
  }
  return rows.map((row) => {
    const values = grouped.get(row.positionGroup);
    if (!values) {
      return {
        ...row,
        categoryPercentiles: { defend: 0, support: 0, create: 0, score: 0 },
      };
    }
    return {
      ...row,
      categoryPercentiles: {
        defend: percentileRank(values.defend, row.scores.defendCategoryScore),
        support: percentileRank(values.support, row.scores.supportCategoryScore),
        create: percentileRank(values.create, row.scores.createCategoryScore),
        score: percentileRank(values.score, row.scores.scoreCategoryScore),
      },
    };
  });
}
