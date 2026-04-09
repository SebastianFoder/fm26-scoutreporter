"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildEffectiveMoneyballStatWeights,
  buildPercentiles,
  weightedScoreFromPercentiles,
} from "./compute";
import { moneyballDb } from "./db";
import { buildDefaultRoleGroups } from "./group-presets";
import { allDivisionKeysFromRows } from "./division-key";
import { parseMoneyballCsv } from "./parser";
import { DEFAULT_GK_GROUP_WEIGHTS, DEFAULT_GK_STAT_WEIGHTS } from "./default-weights";
import {
  normalizeStatWeights,
  resolveStatKeysFromStored,
  type MoneyballStat,
} from "./moneyball-stat";
import type {
  BaselineConfig,
  MoneyballDatasetSummary,
  MoneyballParseError,
  MoneyballPercentileSnapshot,
  MoneyballRow,
  MoneyballWeightsProfile,
  PlayerRole,
  RoleScoped,
  StatGroup,
} from "./types";

const DEFAULT_BASELINE: BaselineConfig = {
  minimumMinutes: 300,
};

const DEFAULT_WEIGHTS: MoneyballWeightsProfile = {
  id: "default",
  name: "Default",
  activeGroupIdsByRole: { outfield: [], gk: [] },
  groupWeightsByRole: {
    outfield: {},
    gk: { ...DEFAULT_GK_GROUP_WEIGHTS },
  },
  statWeights: { ...DEFAULT_GK_STAT_WEIGHTS },
};

type LegacyWeightsProfile = {
  activeGroupIds?: string[];
  groupWeights?: Record<string, number>;
  statWeights?: Record<string, number>;
};

type MoneyballContextValue = {
  loading: boolean;
  baselineImports: MoneyballDatasetSummary[];
  playerViewImport: MoneyballDatasetSummary | null;
  statKeys: MoneyballStat[];
  parseErrors: MoneyballParseError[];
  baseline: BaselineConfig;
  searchMinimumMinutes: number;
  query: string;
  selectedIds: string[];
  latestComputed: MoneyballPercentileSnapshot | null;
  filteredRows: MoneyballRow[];
  scoredRows: Array<MoneyballRow & { weightedScore: number; percentileVector: number[] }>;
  roleGroups: RoleScoped<StatGroup[]>;
  uiRole: PlayerRole;
  weightsProfile: MoneyballWeightsProfile;
  importBaselineCsvFiles: (files: FileList | null) => Promise<void>;
  clearBaselineImports: () => Promise<void>;
  importPlayerViewCsvFile: (file: File | null) => Promise<void>;
  clearPlayerViewImport: () => Promise<void>;
  setBaseline: (next: BaselineConfig) => void;
  setSearchMinimumMinutes: (next: number) => void;
  setQuery: (next: string) => void;
  calculatePercentiles: () => Promise<void>;
  toggleSelected: (id: string) => void;
  clearSelection: () => void;
  setUiRole: React.Dispatch<React.SetStateAction<PlayerRole>>;
  setWeightsProfile: React.Dispatch<React.SetStateAction<MoneyballWeightsProfile>>;
};

const MoneyballContext = createContext<MoneyballContextValue | null>(null);

function arraysShallowEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function shallowRecordEqual(a: Record<string, number>, b: Record<string, number>): boolean {
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
}

function migrateWeightsProfile(raw: unknown): MoneyballWeightsProfile {
  const base = raw as Partial<MoneyballWeightsProfile> & LegacyWeightsProfile;
  return {
    id: base.id ?? DEFAULT_WEIGHTS.id,
    name: base.name ?? DEFAULT_WEIGHTS.name,
    activeGroupIdsByRole: base.activeGroupIdsByRole ?? {
      outfield: base.activeGroupIds ?? [],
      gk: [],
    },
    groupWeightsByRole: {
      outfield: base.groupWeightsByRole?.outfield ?? base.groupWeights ?? {},
      gk: {
        ...DEFAULT_GK_GROUP_WEIGHTS,
        ...(base.groupWeightsByRole?.gk ?? {}),
      },
    },
    statWeights: {
      ...DEFAULT_GK_STAT_WEIGHTS,
      ...normalizeStatWeights(base.statWeights),
    },
  };
}

export function useMoneyball() {
  const ctx = useContext(MoneyballContext);
  if (!ctx) {
    throw new Error("useMoneyball must be used inside MoneyballDataProvider");
  }
  return ctx;
}

export function MoneyballDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [baselineImports, setBaselineImports] = useState<MoneyballDatasetSummary[]>([]);
  const [baselineRows, setBaselineRows] = useState<MoneyballRow[]>([]);
  const [playerViewImport, setPlayerViewImport] = useState<MoneyballDatasetSummary | null>(
    null,
  );
  const [playerRows, setPlayerRows] = useState<MoneyballRow[]>([]);
  const [statKeys, setStatKeys] = useState<MoneyballStat[]>([]);
  const [parseErrors, setParseErrors] = useState<MoneyballParseError[]>([]);
  const [baseline, setBaselineState] = useState<BaselineConfig>(DEFAULT_BASELINE);
  const [searchMinimumMinutes, setSearchMinimumMinutes] = useState(0);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [latestComputed, setLatestComputed] =
    useState<MoneyballPercentileSnapshot | null>(null);
  const [uiRole, setUiRole] = useState<PlayerRole>("outfield");
  const [weightsProfile, setWeightsProfile] =
    useState<MoneyballWeightsProfile>(DEFAULT_WEIGHTS);

  const roleGroups = useMemo(() => buildDefaultRoleGroups(statKeys), [statKeys]);

  useEffect(() => {
    (async () => {
      const dbBaselineImports = await moneyballDb.listBaselineImports();
      const dbPlayerViewImport = await moneyballDb.getPlayerViewImport();
      const loadedBaseline = (await moneyballDb.getBaseline()) ?? DEFAULT_BASELINE;
      const loadedComputed = await moneyballDb.getLatestComputed();
      const loadedWeightsRaw = await moneyballDb.loadConfig<unknown>("weights");

      const loadedBaselineRows = dbBaselineImports.flatMap((x) => x.rows);
      const loadedPlayerRows = dbPlayerViewImport?.rows ?? [];
      const rawStatKeys =
        dbBaselineImports[0]?.statKeys ??
        dbPlayerViewImport?.statKeys ??
        loadedComputed?.statKeys ??
        [];
      const resolvedStatKeys = resolveStatKeysFromStored(
        rawStatKeys,
        loadedBaselineRows,
        loadedPlayerRows,
      );
      const resolvedWeights = migrateWeightsProfile(loadedWeightsRaw);

      setBaselineImports(
        dbBaselineImports.map(({ id, fileName, importedAt, rowCount, statKeys: keys }) => ({
          id,
          fileName,
          importedAt,
          rowCount,
          statKeys: keys,
        })),
      );
      setBaselineRows(loadedBaselineRows);
      setPlayerViewImport(
        dbPlayerViewImport
          ? {
              id: dbPlayerViewImport.id,
              fileName: dbPlayerViewImport.fileName,
              importedAt: dbPlayerViewImport.importedAt,
              rowCount: dbPlayerViewImport.rowCount,
              statKeys: dbPlayerViewImport.statKeys,
            }
          : null,
      );
      setPlayerRows(loadedPlayerRows);
      setStatKeys(resolvedStatKeys);
      setBaselineState(loadedBaseline);
      setLatestComputed(loadedComputed);
      setWeightsProfile(resolvedWeights);
      setUiRole(loadedPlayerRows.some((r) => r.role === "outfield") ? "outfield" : "gk");
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (loading) return;
    void moneyballDb.saveBaseline(baseline);
  }, [baseline, loading]);

  useEffect(() => {
    if (loading) return;
    void moneyballDb.saveConfig("weights", weightsProfile);
  }, [weightsProfile, loading]);

  useEffect(() => {
    if (loading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prune profile when role group definitions change
    setWeightsProfile((prev) => {
      const validOut = new Set(roleGroups.outfield.map((g) => g.id));
      const validGk = new Set(roleGroups.gk.map((g) => g.id));

      let outfieldIds = prev.activeGroupIdsByRole.outfield ?? [];
      if (outfieldIds.length === 0) {
        outfieldIds = roleGroups.outfield.map((g) => g.id);
      } else {
        outfieldIds = outfieldIds.filter((id) => validOut.has(id));
        if (outfieldIds.length === 0) outfieldIds = roleGroups.outfield.map((g) => g.id);
      }

      let gkIds = prev.activeGroupIdsByRole.gk ?? [];
      if (gkIds.length === 0) {
        gkIds = roleGroups.gk.map((g) => g.id);
      } else {
        gkIds = gkIds.filter((id) => validGk.has(id));
        if (gkIds.length === 0) gkIds = roleGroups.gk.map((g) => g.id);
      }

      const pruneGw = (role: PlayerRole, valid: Set<string>) => {
        const gw = prev.groupWeightsByRole[role] ?? {};
        const next: Record<string, number> = {};
        for (const [k, v] of Object.entries(gw)) {
          if (valid.has(k)) next[k] = v;
        }
        return next;
      };

      const nextGroupWeightsByRole = {
        outfield: pruneGw("outfield", validOut),
        gk: pruneGw("gk", validGk),
      };

      const sameIds =
        arraysShallowEqual(outfieldIds, prev.activeGroupIdsByRole.outfield ?? []) &&
        arraysShallowEqual(gkIds, prev.activeGroupIdsByRole.gk ?? []);
      const sameGw =
        shallowRecordEqual(nextGroupWeightsByRole.outfield, prev.groupWeightsByRole.outfield ?? {}) &&
        shallowRecordEqual(nextGroupWeightsByRole.gk, prev.groupWeightsByRole.gk ?? {});
      if (sameIds && sameGw) return prev;

      return {
        ...prev,
        activeGroupIdsByRole: { outfield: outfieldIds, gk: gkIds },
        groupWeightsByRole: nextGroupWeightsByRole,
      };
    });
  }, [loading, roleGroups]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return playerRows.filter((r) => {
      if (r.role !== uiRole) return false;
      if (r.minutes < searchMinimumMinutes) return false;
      if (q.length === 0) return true;
      return (
        r.player.toLowerCase().includes(q) ||
        r.club.toLowerCase().includes(q) ||
        r.position.toLowerCase().includes(q) ||
        r.uniqueId.toLowerCase().includes(q)
      );
    });
  }, [playerRows, query, searchMinimumMinutes, uiRole]);

  const percentileSource = latestComputed;
  const scoredStatKeys = useMemo(() => {
    const activeIds = new Set(weightsProfile.activeGroupIdsByRole[uiRole] ?? []);
    const groups = roleGroups[uiRole];
    const usingGroups = activeIds.size > 0 ? groups.filter((g) => activeIds.has(g.id)) : groups;
    const keys = usingGroups.flatMap((group) => group.statKeys);
    const deduped = [...new Set(keys)].filter((k) => statKeys.includes(k));
    return deduped.length > 0 ? deduped : statKeys.slice(0, 6);
  }, [roleGroups, statKeys, uiRole, weightsProfile]);

  const scoredRows = useMemo(() => {
    if (!percentileSource) return [];
    const vectorIndex = scoredStatKeys.map((k) => statKeys.indexOf(k)).filter((i) => i >= 0);

    return filteredRows.map((row) => {
      const role = row.role;
      const groupsForRole = roleGroups[role];
      const activeGroupIds = new Set(weightsProfile.activeGroupIdsByRole[role] ?? []);
      const groupWeightMap = weightsProfile.groupWeightsByRole[role] ?? {};
      const effectiveStatWeights = buildEffectiveMoneyballStatWeights(
        scoredStatKeys,
        groupsForRole,
        activeGroupIds,
        groupWeightMap,
        weightsProfile.statWeights,
      );
      const fullVector =
        row.role === "gk"
          ? percentileSource.gkPercentiles[row.uniqueId] ?? []
          : percentileSource.outfieldPercentiles[row.uniqueId] ?? [];
      const percentileVector = vectorIndex.map((i) => fullVector[i] ?? 0);
      const selectedKeys = vectorIndex.map((i) => statKeys[i]);
      return {
        ...row,
        percentileVector,
        weightedScore: weightedScoreFromPercentiles(
          percentileVector,
          selectedKeys,
          effectiveStatWeights,
        ),
      };
    });
  }, [filteredRows, percentileSource, roleGroups, scoredStatKeys, statKeys, uiRole, weightsProfile]);

  const importBaselineCsvFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const nextErrors: MoneyballParseError[] = [];
    const nextSummaries: MoneyballDatasetSummary[] = [];
    const nextRows: MoneyballRow[] = [];
    /** Column order from this import batch only (do not seed from player-view statKeys). */
    let batchStatKeys: MoneyballStat[] = [];

    for (const file of Array.from(files)) {
      const text = await file.text();
      const parsed = parseMoneyballCsv(text);
      if (parsed.errors.length > 0) {
        nextErrors.push(
          ...parsed.errors.map((e) => ({
            line: e.line,
            message: `${file.name}: ${e.message}`,
          })),
        );
        continue;
      }

      const id = `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const importedAt = new Date().toISOString();
      const summary: MoneyballDatasetSummary = {
        id,
        fileName: file.name,
        importedAt,
        rowCount: parsed.rows.length,
        statKeys: parsed.statKeys,
      };
      await moneyballDb.saveBaselineImport({ ...summary, rows: parsed.rows });
      nextSummaries.push(summary);
      nextRows.push(...parsed.rows);
      if (batchStatKeys.length === 0) batchStatKeys = parsed.statKeys;
    }

    const mergedImports = [...baselineImports, ...nextSummaries];
    const mergedRows = [...baselineRows, ...nextRows];
    setBaselineImports(mergedImports);
    setBaselineRows(mergedRows);
    if (nextSummaries.length > 0) {
      setStatKeys(batchStatKeys);
    }
    setParseErrors(nextErrors);
  };

  const clearBaselineImports = async () => {
    await moneyballDb.clearBaselineImports();
    await moneyballDb.clearComputed();
    setBaselineImports([]);
    setBaselineRows([]);
    setLatestComputed(null);
    setStatKeys(resolveStatKeysFromStored(playerViewImport?.statKeys, [], playerRows));
    setParseErrors([]);
  };

  const importPlayerViewCsvFile = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    const parsed = parseMoneyballCsv(text);
    if (parsed.errors.length > 0) {
      setParseErrors(
        parsed.errors.map((e) => ({
          line: e.line,
          message: `${file.name}: ${e.message}`,
        })),
      );
      return;
    }

    const importedAt = new Date().toISOString();
    const summary: MoneyballDatasetSummary = {
      id: "active-player-view",
      fileName: file.name,
      importedAt,
      rowCount: parsed.rows.length,
      statKeys: parsed.statKeys,
    };
    await moneyballDb.savePlayerViewImport({ ...summary, rows: parsed.rows });
    setPlayerViewImport(summary);
    setPlayerRows(parsed.rows);
    setUiRole(parsed.rows.some((r) => r.role === "outfield") ? "outfield" : "gk");
    setParseErrors([]);
    const resolvedKeys = statKeys.length === 0 ? parsed.statKeys : statKeys;
    setStatKeys(resolvedKeys);
  };

  const clearPlayerViewImport = async () => {
    await moneyballDb.clearPlayerViewImport();
    setPlayerViewImport(null);
    setPlayerRows([]);
    setSelectedIds([]);
    setQuery("");
    setParseErrors([]);
    if (baselineImports.length === 0) {
      setStatKeys([]);
    }
  };

  const calculatePercentiles = async () => {
    const filteredBaselineRows = baselineRows.filter((r) => r.minutes >= baseline.minimumMinutes);
    const gkRows = filteredBaselineRows.filter((r) => r.role === "gk");
    const outfieldRows = filteredBaselineRows.filter((r) => r.role === "outfield");
    const gkPlayerRows = playerRows.filter((r) => r.role === "gk");
    const outfieldPlayerRows = playerRows.filter((r) => r.role === "outfield");
    const gkPercentiles = buildPercentiles(gkRows, gkPlayerRows, statKeys);
    const outfieldPercentiles = buildPercentiles(outfieldRows, outfieldPlayerRows, statKeys);
    const snapshot: MoneyballPercentileSnapshot = {
      id: `computed-${Date.now()}`,
      createdAt: new Date().toISOString(),
      divisionKey: allDivisionKeysFromRows(baselineRows).join("|"),
      minimumMinutes: baseline.minimumMinutes,
      statKeys,
      gkPercentiles,
      outfieldPercentiles,
    };
    await moneyballDb.saveComputed(snapshot);
    setLatestComputed(snapshot);
  };

  const value: MoneyballContextValue = {
    loading,
    baselineImports,
    playerViewImport,
    statKeys,
    parseErrors,
    baseline,
    searchMinimumMinutes,
    query,
    selectedIds,
    latestComputed,
    filteredRows,
    scoredRows,
    roleGroups,
    uiRole,
    weightsProfile,
    importBaselineCsvFiles,
    clearBaselineImports,
    importPlayerViewCsvFile,
    clearPlayerViewImport,
    setBaseline: setBaselineState,
    setSearchMinimumMinutes,
    setQuery,
    calculatePercentiles,
    toggleSelected: (id) =>
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      ),
    clearSelection: () => setSelectedIds([]),
    setUiRole,
    setWeightsProfile,
  };

  return (
    <MoneyballContext.Provider value={value}>{children}</MoneyballContext.Provider>
  );
}
