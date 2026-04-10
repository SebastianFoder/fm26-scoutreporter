"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  computeExcitementFactor,
  computeControlScore,
  controlScoreInputFromRow,
  effortScoreInputFromRow,
  excitementScoreInputFromRow,
  resolveOptaRank,
  type ControlScoreResult,
} from "./control-score";
import { divisionKeyFromRow } from "./division-key";
import {
  mustermannPositionGroupFromRow,
  type MustermannPositionGroup,
} from "./mustermann-position-group";
import { withMustermannCategoryPercentiles } from "./mustermann-category-percentiles";
import { withMustermannEffortScores } from "./mustermann-effort-percentiles";
import { useMoneyball } from "@/features/moneyball/MoneyballDataProvider";
import { MoneyballStat } from "@/features/moneyball/moneyball-stat";
import type { MoneyballRow } from "@/features/moneyball/types";

const BAR_SEGMENTS = 12;
const ESTIMATED_ROW_HEIGHT_PX = 460;
const LG_MEDIA = "(min-width: 1024px)";

function useLgTwoColumns(): boolean {
  const [lg, setLg] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(LG_MEDIA);
    const sync = () => setLg(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return lg;
}

function parseOptionalNumber(raw: string): number | null {
  const t = raw.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function inBounds(value: number, min: number | null, max: number | null): boolean {
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
}

function statMaxesFromResults(results: ControlScoreResult[]) {
  let maxCi = 0.001;
  let maxSi = 0.001;
  let maxPrI = 0.001;
  let maxPoI = 0.001;
  let maxPlrPct = 0.001;
  let maxCs = 0.001;
  for (const r of results) {
    maxCi = Math.max(maxCi, r.creationIndex);
    maxSi = Math.max(maxSi, r.scoringIndex);
    maxPrI = Math.max(maxPrI, r.pressureIndex);
    maxPoI = Math.max(maxPoI, r.possessionIndex);
    maxPlrPct = Math.max(maxPlrPct, r.possessionLossPercent);
    maxCs = Math.max(maxCs, r.controlScore);
  }
  return { maxCi, maxSi, maxPrI, maxPoI, maxPlrPct, maxCs };
}

type ExcitementLeagueAverages = {
  keyTackles: number;
  shotsBlocked: number;
  progressivePasses: number;
  shots: number;
  openPlayKeyPasses: number;
  dribbles: number;
  offsidesPer90: number;
};

function weightedAveragePer90(rows: MoneyballRow[], key: MoneyballStat): number {
  let weightedSum = 0;
  let totalMinutes = 0;
  let arithmeticSum = 0;
  let count = 0;
  for (const row of rows) {
    const v = row.stats[key] ?? 0;
    const minutes = Math.max(0, row.minutes);
    weightedSum += v * minutes;
    totalMinutes += minutes;
    arithmeticSum += v;
    count += 1;
  }
  if (totalMinutes > 0) return weightedSum / totalMinutes;
  return count > 0 ? arithmeticSum / count : 0;
}

function excitementAveragesByDivision(rows: MoneyballRow[]): Map<string, ExcitementLeagueAverages> {
  const byDivision = new Map<string, MoneyballRow[]>();
  for (const row of rows) {
    if (row.role !== "outfield") continue;
    const dk = divisionKeyFromRow(row);
    const list = byDivision.get(dk) ?? [];
    list.push(row);
    byDivision.set(dk, list);
  }
  const out = new Map<string, ExcitementLeagueAverages>();
  for (const [dk, groupRows] of byDivision.entries()) {
    out.set(dk, {
      keyTackles: weightedAveragePer90(groupRows, MoneyballStat.KeyTacklesPer90),
      shotsBlocked: weightedAveragePer90(groupRows, MoneyballStat.ShotsBlockedPer90),
      progressivePasses: weightedAveragePer90(groupRows, MoneyballStat.ProgressivePassesPer90),
      shots: weightedAveragePer90(groupRows, MoneyballStat.ShotsPer90),
      openPlayKeyPasses: weightedAveragePer90(groupRows, MoneyballStat.OpenPlayKeyPassesPer90),
      dribbles: weightedAveragePer90(groupRows, MoneyballStat.DribblesPer90),
      offsidesPer90: weightedAveragePer90(groupRows, MoneyballStat.OffsidesPer90),
    });
  }
  return out;
}

function SegmentedBar({
  fraction,
  accent = false,
}: {
  fraction: number;
  accent?: boolean;
}) {
  const f = Math.max(0, Math.min(1, fraction));
  const filled = Math.round(f * BAR_SEGMENTS);
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${Math.round(f * 100)} percent`}>
      {Array.from({ length: BAR_SEGMENTS }, (_, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-sm border border-[oklch(var(--border))] ${
            i < filled
              ? accent
                ? "bg-[oklch(var(--primary))]"
                : "bg-[oklch(var(--alt))]"
              : "bg-[oklch(var(--background))]"
          }`}
        />
      ))}
    </div>
  );
}

function seasonEstimate(per90: number | undefined, minutes: number): number {
  if (!minutes || per90 === undefined) return 0;
  return (per90 * minutes) / 90;
}

type CardDerived = {
  row: MoneyballRow;
  scores: ControlScoreResult;
  excitementFactor: number;
  effortScore: number;
  isDefaultRank: boolean;
  goalsEst: number;
  astEst: number;
  positionGroup: MustermannPositionGroup;
  categoryPercentiles: {
    defend: number;
    support: number;
    create: number;
    score: number;
  };
};

function MustermannPlayerCard({
  derived,
  maxes,
  sortMetric,
}: {
  derived: CardDerived;
  maxes: ReturnType<typeof statMaxesFromResults>;
  sortMetric: SortMetric;
}) {
  const { row, scores: r, excitementFactor, effortScore, isDefaultRank, goalsEst, astEst } = derived;

  return (
    <article className="overflow-hidden rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] shadow-[4px_4px_0_oklch(var(--border))]">
      <header className="border-b-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">{row.player}</h3>
            <p className="mt-0.5 text-xs text-[oklch(var(--text))]/75">
              {row.bestPos ?? row.position}
              {row.club ? ` · ${row.club}` : ""}
            </p>
            <p className="mt-1 font-mono text-xs text-[oklch(var(--text))]/65">
              {row.nation} · {row.age} yo · {row.division}
              {row.basedIn ? ` · ${row.basedIn}` : ""}
            </p>
          </div>
          {row.askingPrice ? (
            <span className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--alt))]/15 px-2 py-1 font-mono text-xs font-bold">
              {row.askingPrice}
            </span>
          ) : null}
        </div>
      </header>
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-3 py-2 text-center font-mono text-sm font-bold">
            {row.minutes} Minutes
          </div>
          <div className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-3 py-2 text-center font-mono text-sm font-bold">
            {goalsEst} Goals
          </div>
          <div className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-3 py-2 text-center font-mono text-sm font-bold">
            {astEst} Assists
          </div>
          <div>
            <div className="flex items-center justify-between rounded-md border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-2 py-1 text-xs font-black uppercase tracking-wider">
              <span>Defend</span>
              <span className="font-mono text-[11px]">
                {derived.categoryPercentiles.defend}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between rounded-md border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-2 py-1 text-xs font-black uppercase tracking-wider">
              <span>Support</span>
              <span className="font-mono text-[11px]">
                {derived.categoryPercentiles.support}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between rounded-md border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-2 py-1 text-xs font-black uppercase tracking-wider">
              <span>Create</span>
              <span className="font-mono text-[11px]">
                {derived.categoryPercentiles.create}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between rounded-md border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-2 py-1 text-xs font-black uppercase tracking-wider">
              <span>Score</span>
              <span className="font-mono text-[11px]">
                {derived.categoryPercentiles.score}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-wide text-[oklch(var(--text))]/65">
            Group: {derived.positionGroup}
          </p>
          {isDefaultRank ? (
            <p className="text-[10px] font-bold uppercase tracking-wide text-[oklch(var(--text))]/55">
              League ranking default (25) — set in Opta leagues
            </p>
          ) : null}
          <div className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-3 py-2">
            <div className="flex justify-between text-xs font-black uppercase tracking-wider text-[oklch(var(--primary))]">
              <span>Control score</span>
              <span className="font-mono text-base">{r.controlScore.toFixed(1)}</span>
            </div>
            <SegmentedBar fraction={r.controlScore / maxes.maxCs} accent />
            {sortMetric === "control" ? (
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[oklch(var(--text))]/55">
                Active sort metric
              </p>
            ) : null}
          </div>
          <div className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-3 py-2">
            <div className="flex justify-between text-xs font-black uppercase tracking-wider text-[oklch(var(--primary))]">
              <span>Excitement factor</span>
              <span className="font-mono text-base">{excitementFactor.toFixed(1)}</span>
            </div>
            {sortMetric === "excitement" ? (
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[oklch(var(--text))]/55">
                Active sort metric
              </p>
            ) : null}
          </div>
          <div className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-3 py-2">
            <div className="flex justify-between text-xs font-black uppercase tracking-wider text-[oklch(var(--primary))]">
              <span>Effort score</span>
              <span className="font-mono text-base">{effortScore.toFixed(1)}</span>
            </div>
            {sortMetric === "effort" ? (
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[oklch(var(--text))]/55">
                Active sort metric
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

type SortMetric = "control" | "excitement" | "effort";
type BoundFields = {
  defendMin: string; defendMax: string; supportMin: string; supportMax: string;
  createMin: string; createMax: string; scoreMin: string; scoreMax: string;
  controlMin: string; controlMax: string; excitementMin: string; excitementMax: string;
  effortMin: string; effortMax: string;
};

const EMPTY_BOUNDS: BoundFields = {
  defendMin: "", defendMax: "", supportMin: "", supportMax: "", createMin: "", createMax: "",
  scoreMin: "", scoreMax: "", controlMin: "", controlMax: "", excitementMin: "", excitementMax: "",
  effortMin: "", effortMax: "",
};
const POSITION_GROUP_OPTIONS: MustermannPositionGroup[] = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];

export function MustermannPlayerCards() {
  const { filteredRows, optaRankings } = useMoneyball();
  const lgTwoCols = useLgTwoColumns();
  const parentRef = useRef<HTMLDivElement>(null);
  const [sortMetric, setSortMetric] = useState<SortMetric>("control");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [bounds, setBounds] = useState<BoundFields>(EMPTY_BOUNDS);
  const [positionGroupFilter, setPositionGroupFilter] = useState<MustermannPositionGroup[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const setBound = useCallback((key: keyof BoundFields, value: string) => {
    setBounds((prev) => ({ ...prev, [key]: value }));
  }, []);

  const derivedAll = useMemo((): CardDerived[] => {
    const byDivisionAverages = excitementAveragesByDivision(filteredRows);
    const out: CardDerived[] = [];
    for (const row of filteredRows) {
      if (row.role !== "outfield") continue;
      const dk = divisionKeyFromRow(row);
      const { rank, isDefault } = resolveOptaRank(optaRankings, dk);
      const scores = computeControlScore(controlScoreInputFromRow(row, rank));
      const excitement = computeExcitementFactor(
        excitementScoreInputFromRow(row, rank),
        byDivisionAverages.get(dk) ?? {
          keyTackles: 0, shotsBlocked: 0, progressivePasses: 0, shots: 0,
          openPlayKeyPasses: 0, dribbles: 0, offsidesPer90: 0,
        },
      );
      out.push({
        row,
        scores,
        excitementFactor: excitement.excitementFactor,
        effortScore: 0,
        isDefaultRank: isDefault,
        goalsEst: Math.round(seasonEstimate(row.stats[MoneyballStat.GoalsPer90], row.minutes)),
        astEst: Math.round(seasonEstimate(row.stats[MoneyballStat.AssistsPer90], row.minutes)),
        positionGroup: mustermannPositionGroupFromRow(row),
        categoryPercentiles: { defend: 0, support: 0, create: 0, score: 0 },
      });
    }
    const withEffort = withMustermannEffortScores(
      out.map((entry) => {
        const dk = divisionKeyFromRow(entry.row);
        const { rank } = resolveOptaRank(optaRankings, dk);
        return {
          ...entry,
          divisionKey: dk,
          optaRank: rank,
          effortInput: effortScoreInputFromRow(entry.row, rank),
        };
      }),
    );
    return withMustermannCategoryPercentiles(
      withEffort.map((entry) => ({
        ...entry,
        effortScore: entry.effort.effortScore,
      })),
    );
  }, [filteredRows, optaRankings]);

  const togglePositionGroup = useCallback((g: MustermannPositionGroup) => {
    setPositionGroupFilter((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }, []);

  const filtered = useMemo(() => {
    const defMin = parseOptionalNumber(bounds.defendMin);
    const defMax = parseOptionalNumber(bounds.defendMax);
    const supMin = parseOptionalNumber(bounds.supportMin);
    const supMax = parseOptionalNumber(bounds.supportMax);
    const crMin = parseOptionalNumber(bounds.createMin);
    const crMax = parseOptionalNumber(bounds.createMax);
    const scMin = parseOptionalNumber(bounds.scoreMin);
    const scMax = parseOptionalNumber(bounds.scoreMax);
    const csMin = parseOptionalNumber(bounds.controlMin);
    const csMax = parseOptionalNumber(bounds.controlMax);
    const exMin = parseOptionalNumber(bounds.excitementMin);
    const exMax = parseOptionalNumber(bounds.excitementMax);
    const efMin = parseOptionalNumber(bounds.effortMin);
    const efMax = parseOptionalNumber(bounds.effortMax);

    return derivedAll.filter((d) => {
      if (positionGroupFilter.length > 0 && !positionGroupFilter.includes(d.positionGroup)) return false;
      const { categoryPercentiles: pct, scores: r } = d;
      if (!inBounds(pct.defend, defMin, defMax)) return false;
      if (!inBounds(pct.support, supMin, supMax)) return false;
      if (!inBounds(pct.create, crMin, crMax)) return false;
      if (!inBounds(pct.score, scMin, scMax)) return false;
      if (!inBounds(r.controlScore, csMin, csMax)) return false;
      if (!inBounds(d.excitementFactor, exMin, exMax)) return false;
      if (!inBounds(d.effortScore, efMin, efMax)) return false;
      return true;
    });
  }, [derivedAll, bounds, positionGroupFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) =>
      sortDir === "desc"
        ? sortMetric === "control"
          ? b.scores.controlScore - a.scores.controlScore
          : sortMetric === "excitement"
            ? b.excitementFactor - a.excitementFactor
            : b.effortScore - a.effortScore
        : sortMetric === "control"
          ? a.scores.controlScore - b.scores.controlScore
          : sortMetric === "excitement"
            ? a.excitementFactor - b.excitementFactor
            : a.effortScore - b.effortScore,
    );
    return copy;
  }, [filtered, sortDir, sortMetric]);

  const maxes = useMemo(
    () =>
      sorted.length === 0
        ? { maxCi: 0.001, maxSi: 0.001, maxPrI: 0.001, maxPoI: 0.001, maxPlrPct: 0.001, maxCs: 0.001 }
        : statMaxesFromResults(sorted.map((d) => d.scores)),
    [sorted],
  );

  const columnCount = lgTwoCols ? 2 : 1;
  const rowCount = Math.ceil(sorted.length / columnCount) || 0;
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT_PX,
    overscan: 2,
  });

  if (derivedAll.length === 0) {
    return <p className="text-sm font-bold text-[oklch(var(--text))]/65">No outfield players in the current filter.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] px-4 py-3 shadow-[2px_2px_0_oklch(var(--border))]">
        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
          <span>Sort metric</span>
          <select value={sortMetric} onChange={(e) => setSortMetric(e.target.value as SortMetric)} className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-2 py-1 font-mono text-xs font-bold shadow-[2px_2px_0_oklch(var(--border))]">
            <option value="control">Control score</option>
            <option value="excitement">Excitement factor</option>
            <option value="effort">Effort score</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
          <span>Direction</span>
          <select value={sortDir} onChange={(e) => setSortDir(e.target.value as "desc" | "asc")} className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-2 py-1 font-mono text-xs font-bold shadow-[2px_2px_0_oklch(var(--border))]">
            <option value="desc">High → low</option>
            <option value="asc">Low → high</option>
          </select>
        </label>
        <button type="button" onClick={() => setFiltersOpen((o) => !o)} className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-3 py-1.5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0_oklch(var(--border))] hover:bg-[oklch(var(--surface))]">
          {filtersOpen ? "Hide filters" : "Score filters"}
        </button>
        <span className="ml-auto font-mono text-xs text-[oklch(var(--text))]/70">
          Showing {sorted.length} / {derivedAll.length}
        </span>
      </div>
      {filtersOpen ? (
        <div className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] p-4 shadow-[2px_2px_0_oklch(var(--border))]">
          <div className="mb-4">
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-[oklch(var(--text))]/75">Position group</p>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[oklch(var(--text))]/55">Leave none selected to include every group.</p>
            <div className="flex flex-wrap gap-2">
              {POSITION_GROUP_OPTIONS.map((g) => {
                const on = positionGroupFilter.includes(g);
                return (
                  <button key={g} type="button" onClick={() => togglePositionGroup(g)} className={`rounded-lg border-2 border-[oklch(var(--border))] px-3 py-1.5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0_oklch(var(--border))] ${on ? "bg-[oklch(var(--primary))] text-[oklch(var(--background))]" : "bg-[oklch(var(--background))] hover:bg-[oklch(var(--surface))]"}`}>
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="mb-3 text-xs font-black uppercase tracking-wider text-[oklch(var(--text))]/75">
            Category percentiles (0–100, vs same position group) — min / max (leave blank for no bound)
          </p>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["Defend percentile", "defendMin", "defendMax"],
                ["Support percentile", "supportMin", "supportMax"],
                ["Create percentile", "createMin", "createMax"],
                ["Score percentile", "scoreMin", "scoreMax"],
              ] as const
            ).map(([label, kMin, kMax]) => (
              <div key={label} className="space-y-1">
                <div className="text-xs font-black uppercase tracking-wider">{label}</div>
                <div className="flex gap-2">
                  <input type="text" inputMode="decimal" placeholder="Min" value={bounds[kMin]} onChange={(e) => setBound(kMin, e.target.value)} className="w-full rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-2 py-1 font-mono text-xs font-bold shadow-[2px_2px_0_oklch(var(--border))]" />
                  <input type="text" inputMode="decimal" placeholder="Max" value={bounds[kMax]} onChange={(e) => setBound(kMax, e.target.value)} className="w-full rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-2 py-1 font-mono text-xs font-bold shadow-[2px_2px_0_oklch(var(--border))]" />
                </div>
              </div>
            ))}
          </div>
          <p className="mb-3 text-xs font-black uppercase tracking-wider text-[oklch(var(--text))]/75">
            Control, excitement &amp; effort — min / max (raw scores; leave blank for no bound)
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["Control score", "controlMin", "controlMax"],
                ["Excitement factor", "excitementMin", "excitementMax"],
                ["Effort score", "effortMin", "effortMax"],
              ] as const
            ).map(([label, kMin, kMax]) => (
              <div key={label} className="space-y-1">
                <div className="text-xs font-black uppercase tracking-wider">{label}</div>
                <div className="flex gap-2">
                  <input type="text" inputMode="decimal" placeholder="Min" value={bounds[kMin]} onChange={(e) => setBound(kMin, e.target.value)} className="w-full rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-2 py-1 font-mono text-xs font-bold shadow-[2px_2px_0_oklch(var(--border))]" />
                  <input type="text" inputMode="decimal" placeholder="Max" value={bounds[kMax]} onChange={(e) => setBound(kMax, e.target.value)} className="w-full rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-2 py-1 font-mono text-xs font-bold shadow-[2px_2px_0_oklch(var(--border))]" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <button type="button" onClick={() => { setBounds(EMPTY_BOUNDS); setPositionGroupFilter([]); }} className="text-xs font-black uppercase tracking-wider text-[oklch(var(--primary))] underline decoration-2 underline-offset-2">
              Clear filters
            </button>
          </div>
        </div>
      ) : null}
      {sorted.length === 0 ? (
        <p className="text-sm font-bold text-[oklch(var(--text))]/65">No players match the current score filters.</p>
      ) : (
        <div ref={parentRef} className="h-[min(72vh,880px)] overflow-auto rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))]/40 shadow-[2px_2px_0_oklch(var(--border))]">
          <div className="relative w-full" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const start = virtualRow.index * columnCount;
              const slice = sorted.slice(start, start + columnCount);
              return (
                <div key={virtualRow.key} className="absolute left-0 top-0 w-full px-3 pb-4 pt-3" style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}>
                  <div className={`grid h-full gap-4 ${lgTwoCols ? "grid-cols-2" : "grid-cols-1"}`}>
                    {slice.map((derived) => (
                      <MustermannPlayerCard key={derived.row.uniqueId} derived={derived} maxes={maxes} sortMetric={sortMetric} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
