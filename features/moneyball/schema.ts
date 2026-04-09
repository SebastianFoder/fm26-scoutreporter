import type { DirectionMap, PlayerRole } from "./types";
import { MoneyballStat } from "./moneyball-stat";

export const MONEYBALL_REQUIRED_HEADERS = [
  "Inf",
  "Player",
  "Unique ID",
  "Minutes",
  "Mins/Gm",
  "Appearances",
  "Based In",
  "Division",
  "Nation",
  "Club",
  "Position",
  "Age",
  "Potential",
  "Wage",
] as const;

export const LOWER_IS_BETTER = new Set<MoneyballStat>([
  MoneyballStat.PossessionLostPer90,
  MoneyballStat.GoalsConcededPer90,
  MoneyballStat.MinutesPerGoal,
  MoneyballStat.MistakesLeadingToGoal,
  MoneyballStat.TeamGoalsConcededPer90,
]);

export const NON_STAT_HEADERS = new Set<string>([
  "Inf",
  "Player",
  "Unique ID",
  "Minutes",
  "Mins/Gm",
  "Appearances",
  "Based In",
  "Division",
  "Nation",
  "Club",
  "Position",
  "Age",
  "Potential",
  "Wage",
]);

export const DIRECTION_MAP: DirectionMap = {
  lowerIsBetter: LOWER_IS_BETTER,
};

export function isGoalkeeper(position: string): PlayerRole {
  return position.toUpperCase().includes("GK") ? "gk" : "outfield";
}
