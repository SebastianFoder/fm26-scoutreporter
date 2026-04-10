import { MoneyballStat } from "./moneyball-stat";
import type { PlayerRole, RoleScoped, StatGroup } from "./types";

export type RoleCategoryDefinition = {
  id: string;
  title: string;
  statKeys: MoneyballStat[];
};
type PresetDefinition = Record<PlayerRole, RoleCategoryDefinition[]>;

const PRESET_DEFINITIONS: PresetDefinition = {
  outfield: [
    {
      id: "passing",
      title: "Passing",
      statKeys: [
        MoneyballStat.ProgressivePassesPer90,
        MoneyballStat.OpenPlayKeyPassesPer90,
        MoneyballStat.PassesCompletedPer90,
        MoneyballStat.PassesAttemptedPer90,
        MoneyballStat.PassCompletionPercent,
      ],
    },
    {
      id: "chance-creation",
      title: "Chance creation & dribbling",
      statKeys: [
        MoneyballStat.ChancesCreatedPer90,
        MoneyballStat.ExpectedAssistsPer90,
        MoneyballStat.AssistsPer90,
        MoneyballStat.ClearCutChances,
        MoneyballStat.DribblesPer90,
      ],
    },
    {
      id: "crossing",
      title: "Crossing",
      statKeys: [
        MoneyballStat.CrossesAttemptedPer90,
        MoneyballStat.CrossesCompletedPer90,
        MoneyballStat.CrossesCompletedToAttemptedRatio,
        MoneyballStat.OpenPlayCrossesAttemptedPer90,
        MoneyballStat.OpenPlayCrossesCompletedPer90,
        MoneyballStat.OpenPlayCrossCompletionPercent,
      ],
    },
    {
      id: "attacking",
      title: "Attacking",
      statKeys: [
        MoneyballStat.ShotsOnTargetPer90,
        MoneyballStat.ExpectedGoalsPer90,
        MoneyballStat.NonPenaltyExpectedGoalsPer90,
        MoneyballStat.GoalsPer90,
        MoneyballStat.ShotConversionPercent,
        MoneyballStat.ShotAccuracyPercent,
        MoneyballStat.MinutesPerGoal,
        MoneyballStat.TeamGoalsPer90,
      ],
    },
    {
      id: "defensive-actions",
      title: "Defensive actions",
      statKeys: [
        MoneyballStat.TacklesPer90,
        MoneyballStat.KeyTacklesPer90,
        MoneyballStat.InterceptionsPer90,
        MoneyballStat.TackleSuccessPercent,
        MoneyballStat.PossessionWonPer90,
        MoneyballStat.BlocksPer90,
        MoneyballStat.ShotsBlockedPer90,
      ],
    },
    {
      id: "aerial",
      title: "Aerial",
      statKeys: [
        MoneyballStat.ClearancesPer90,
        MoneyballStat.HeaderWinPercent,
        MoneyballStat.AerialDuelsAttemptedPer90,
        MoneyballStat.Headers,
        MoneyballStat.HeadersAttempted,
        MoneyballStat.HeadersWonPer90,
        MoneyballStat.HeadersLostPer90,
        MoneyballStat.KeyHeadersPer90,
      ],
    },
    {
      id: "conceding",
      title: "Conceding",
      statKeys: [
        MoneyballStat.GoalsConcededPer90,
        MoneyballStat.TeamGoalsConcededPer90,
        MoneyballStat.MistakesLeadingToGoal,
      ],
    },
    {
      id: "effort",
      title: "Effort",
      statKeys: [
        MoneyballStat.SprintsPer90,
        MoneyballStat.DistanceCoveredPer90,
        MoneyballStat.PressuresCompletedPer90,
        MoneyballStat.PressuresAttemptedPer90,
        MoneyballStat.PossessionLostPer90,
      ],
    },
  ],
  gk: [
    {
      id: "distribution",
      title: "Distribution",
      statKeys: [
        MoneyballStat.PassesCompletedPer90,
        MoneyballStat.PassesAttemptedPer90,
        MoneyballStat.PassCompletionPercent,
        MoneyballStat.ProgressivePassesPer90,
      ],
    },
    {
      id: "shot-stopping",
      title: "Shot Stopping",
      statKeys: [
        MoneyballStat.SavesPer90,
        MoneyballStat.SavePercent,
        MoneyballStat.ExpectedSavePercent,
        MoneyballStat.ExpectedGoalsPreventedPer90,
        MoneyballStat.GoalsConcededPer90,
        MoneyballStat.CleanSheetsPer90,
        MoneyballStat.MistakesLeadingToGoal,
        MoneyballStat.TeamGoalsConcededPer90,
        MoneyballStat.PenaltiesFaced,
        MoneyballStat.PenaltiesSaved,
        MoneyballStat.PenaltiesSavedRatio,
      ],
    },
  ],
};


export const ROLE_CATEGORY_DEFINITIONS: Record<PlayerRole, Array<{ id: string; title: string }>> = {
  outfield: PRESET_DEFINITIONS.outfield.map((category) => ({
    id: category.id,
    title: category.title,
  })),
  gk: PRESET_DEFINITIONS.gk.map((category) => ({
    id: category.id,
    title: category.title,
  })),
};

export const ROLE_STAT_CATEGORY_LOOKUP: RoleScoped<Partial<Record<MoneyballStat, string>>> = {
  outfield: Object.fromEntries(
    PRESET_DEFINITIONS.outfield.flatMap((category) =>
      category.statKeys.map((key) => [key, category.id] as const),
    ),
  ) as Partial<Record<MoneyballStat, string>>,
  gk: Object.fromEntries(
    PRESET_DEFINITIONS.gk.flatMap((category) =>
      category.statKeys.map((key) => [key, category.id] as const),
    ),
  ) as Partial<Record<MoneyballStat, string>>,
};


function buildRoleGroups(role: PlayerRole, statKeys: MoneyballStat[]): StatGroup[] {
  const available = new Set(statKeys);
  return PRESET_DEFINITIONS[role]
    .map((preset) => ({
      id: `${role}-${preset.id}`,
      name: preset.title,
      statKeys: preset.statKeys.filter((key) => available.has(key)),
      weight: 0,
    }))
    .filter((group) => group.statKeys.length > 0);
}

export function buildDefaultRoleGroups(statKeys: MoneyballStat[]): RoleScoped<StatGroup[]> {
  return {
    outfield: buildRoleGroups("outfield", statKeys),
    gk: buildRoleGroups("gk", statKeys),
  };
}
