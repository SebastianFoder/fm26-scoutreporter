import type { MoneyballStat } from "./moneyball-stat";

export type PlayerRole = "gk" | "outfield";

export interface MoneyballRow {
  inf: string;
  player: string;
  uniqueId: string;
  basedIn: string;
  division: string;
  nation: string;
  club: string;
  position: string;
  role: PlayerRole;
  age: number;
  potential: string;
  wage: string;
  minutes: number;
  minsPerGame: number;
  appearancesRaw: string;
  stats: Partial<Record<MoneyballStat, number>>;
  /** Set when imported via Mustermann Mode (`Best Pos` column). */
  bestPos?: string;
  /** Set when imported via Mustermann Mode (`Asking Price` column). */
  askingPrice?: string;
}

export interface MoneyballParseError {
  line: number;
  message: string;
}

export interface MoneyballImportResult {
  rows: MoneyballRow[];
  errors: MoneyballParseError[];
  statKeys: MoneyballStat[];
}

export interface DirectionMap {
  lowerIsBetter: ReadonlySet<MoneyballStat>;
}

export interface BaselineConfig {
  minimumMinutes: number;
}

export interface MoneyballPercentileSnapshot {
  id: string;
  createdAt: string;
  divisionKey: string;
  minimumMinutes: number;
  statKeys: MoneyballStat[];
  gkPercentiles: Record<string, number[]>;
  outfieldPercentiles: Record<string, number[]>;
}

export interface MoneyballDatasetSummary {
  id: string;
  fileName: string;
  importedAt: string;
  rowCount: number;
  statKeys: MoneyballStat[];
}

export interface StatGroup {
  id: string;
  name: string;
  statKeys: MoneyballStat[];
  weight: number;
}

export interface RoleScoped<T> {
  outfield: T;
  gk: T;
}

export interface MoneyballWeightsProfile {
  id: string;
  name: string;
  activeGroupIdsByRole: RoleScoped<string[]>;
  groupWeightsByRole: RoleScoped<Record<string, number>>;
  statWeights: Partial<Record<MoneyballStat, number>>;
}
