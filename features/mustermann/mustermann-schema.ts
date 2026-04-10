import { MONEYBALL_REQUIRED_HEADERS, NON_STAT_HEADERS } from "@/features/moneyball/schema";

export const MUSTERMANN_EXTRA_REQUIRED_HEADERS = [
  "Best Pos",
  "Asking Price",
  "Shot/90",
  "KP/90",
  "Tck A",
  "Off",
] as const;

export const MUSTERMANN_REQUIRED_HEADERS = [
  ...MONEYBALL_REQUIRED_HEADERS,
  ...MUSTERMANN_EXTRA_REQUIRED_HEADERS,
] as const;

export const MUSTERMANN_NON_STAT_HEADERS = new Set<string>([
  ...NON_STAT_HEADERS,
  "Best Pos",
  "Asking Price",
]);

export const MUSTERMANN_HDRS_A_HEADER = "Hdrs A" as const;
export const MUSTERMANN_OFF_HEADER = "Off" as const;

export const MUSTERMANN_MODE_CONFIG_ID = "mustermannMode" as const;
export const MUSTERMANN_OPTA_RANKINGS_CONFIG_ID = "mustermannOptaLeagueRankings" as const;
