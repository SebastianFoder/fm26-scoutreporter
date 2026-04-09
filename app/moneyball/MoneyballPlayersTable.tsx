"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "../components/Button";
import {
  PaginationControls,
  parsePageParam,
  parsePageSizeParam,
  type PageSizeChoice,
} from "../components/PaginationControls";
import {
  averagePercentileForGroup,
  percentileVectorForStatKeyOrder,
  percentileValuesForGroup,
  statKeysForGroupInRoleOrder,
} from "./group-percentiles";
import { useMoneyball } from "./MoneyballDataProvider";
import { PlayerDetailModal } from "./PlayerDetailModal";
import { PolarPercentileChart } from "./PolarPercentileChart";
import { isMoneyballStat } from "./moneyball-stat";
import { getStatLabel } from "./stat-labels";

type SortDir = "asc" | "desc";
const DEFAULT_SORT = "score";
const DEFAULT_SORT_DIR: SortDir = "desc";

function buildListQuery(
  pathname: string,
  opts: {
    page: number;
    pageSize: PageSizeChoice;
    sort: string;
    sortDir: SortDir;
    q?: string;
    groupId?: string;
  },
) {
  const p = new URLSearchParams();
  if (opts.q) p.set("q", opts.q);
  if (opts.groupId) p.set("group", opts.groupId);
  if (opts.page > 1) p.set("page", String(opts.page));
  if (opts.pageSize !== 10) p.set("pageSize", opts.pageSize === "all" ? "all" : String(opts.pageSize));
  if (!(opts.sort === DEFAULT_SORT && opts.sortDir === DEFAULT_SORT_DIR)) {
    p.set("sort", opts.sort);
    p.set("sortDir", opts.sortDir);
  }
  const qs = p.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function SortableTh({
  label,
  align,
  columnSort,
  listSort,
  listSortDir,
  onSort,
}: {
  label: ReactNode;
  align: "left" | "right";
  columnSort: string;
  listSort: string;
  listSortDir: SortDir;
  onSort: () => void;
}) {
  const active = listSort === columnSort;
  return (
    <th
      className={`border-b-2 border-[oklch(var(--border))] px-3 py-2.5 ${align === "right" ? "text-right" : "text-left"}`}
    >
      <button
        type="button"
        onClick={onSort}
        className={`inline-flex w-full items-center gap-1 rounded-lg px-1 py-0.5 text-xs font-black uppercase tracking-wider ${
          align === "right" ? "justify-end" : "justify-start"
        }`}
      >
        <span>{label}</span>
        {active &&
          (listSortDir === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
          ))}
      </button>
    </th>
  );
}

export function MoneyballPlayersTable() {
  const {
    uiRole,
    setUiRole,
    roleGroups,
    weightsProfile,
    scoredRows,
    latestComputed,
    statKeys,
    selectedIds,
    toggleSelected,
    searchMinimumMinutes,
    setSearchMinimumMinutes,
  } = useMoneyball();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingScrollYRef = useRef<number | null>(null);
  const [openPlayerId, setOpenPlayerId] = useState<string | null>(null);
  const [draft, setDraft] = useState((searchParams.get("q") ?? "").trim());
  const activeGroups = roleGroups[uiRole];
  const groupFilterId = searchParams.get("group");
  const isAllGroupsFilter = groupFilterId === null;
  const activeGroupIds = new Set(weightsProfile.activeGroupIdsByRole[uiRole] ?? []);
  const scoredGroups =
    activeGroupIds.size > 0 ? activeGroups.filter((g) => activeGroupIds.has(g.id)) : activeGroups;
  const roleGroupKeys = [...new Set(scoredGroups.flatMap((g) => g.statKeys))];
  const displayRoleGroupKeys = useMemo(
    () => [...new Set(activeGroups.flatMap((g) => g.statKeys))],
    [activeGroups],
  );
  const hasFullPercentiles = Boolean(latestComputed);
  const tableGroupKeys = hasFullPercentiles ? displayRoleGroupKeys : roleGroupKeys;
  const tableGroups = hasFullPercentiles ? activeGroups : scoredGroups;

  const getDisplayPercentileVector = useCallback(
    (row: (typeof scoredRows)[number]) => {
      if (!latestComputed) return row.percentileVector;
      const full =
        row.role === "gk"
          ? latestComputed.gkPercentiles[row.uniqueId]
          : latestComputed.outfieldPercentiles[row.uniqueId];
      return percentileVectorForStatKeyOrder(full, statKeys, tableGroupKeys);
    },
    [latestComputed, statKeys, tableGroupKeys],
  );

  const visibleStatKeys =
    groupFilterId && activeGroups.some((g) => g.id === groupFilterId)
      ? (activeGroups.find((g) => g.id === groupFilterId)?.statKeys.filter((k) => statKeys.includes(k)) ??
        [])
      : tableGroupKeys;

  useLayoutEffect(() => {
    const y = pendingScrollYRef.current;
    if (y === null) return;
    pendingScrollYRef.current = null;
    window.scrollTo(0, y);
  }, [searchParams]);

  const replacePreservingScroll = (href: string) => {
    pendingScrollYRef.current = window.scrollY;
    router.replace(href, { scroll: false });
  };

  const sort = searchParams.get("sort") ?? DEFAULT_SORT;
  const sortDir: SortDir =
    searchParams.get("sortDir") === "asc" || searchParams.get("sortDir") === "desc"
      ? (searchParams.get("sortDir") as SortDir)
      : DEFAULT_SORT_DIR;
  const searchQuery = (searchParams.get("q") ?? "").trim().toLowerCase();
  const pageSize = parsePageSizeParam(searchParams.get("pageSize"));
  const urlPage = parsePageParam(searchParams.get("page"));

  useEffect(() => {
    setDraft((searchParams.get("q") ?? "").trim());
  }, [searchParams]);

  useEffect(() => {
    const trimmed = draft.trim();
    if (trimmed === (searchParams.get("q") ?? "").trim()) return;
    const id = setTimeout(() => {
      replacePreservingScroll(
        buildListQuery(pathname, {
          page: 1,
          pageSize,
          sort,
          sortDir,
          q: trimmed,
          groupId: groupFilterId ?? undefined,
        }),
      );
    }, 300);
    return () => clearTimeout(id);
  }, [draft, groupFilterId, pageSize, pathname, searchParams, sort, sortDir]);

  const filtered = useMemo(
    () =>
      searchQuery.length === 0
        ? scoredRows
        : scoredRows.filter(
            (r) =>
              r.player.toLowerCase().includes(searchQuery) ||
              r.club.toLowerCase().includes(searchQuery) ||
              r.position.toLowerCase().includes(searchQuery),
          ),
    [scoredRows, searchQuery],
  );

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const m = sortDir === "asc" ? 1 : -1;
      if (sort === "player") return m * a.player.localeCompare(b.player);
      if (sort === "position") return m * a.position.localeCompare(b.position);
      if (sort === "score") return m * (a.weightedScore - b.weightedScore);
      if (sort.startsWith("group:")) {
        const id = sort.slice(6);
        const g = tableGroups.find((x) => x.id === id);
        if (!g || !isAllGroupsFilter) return m * (a.weightedScore - b.weightedScore);
        const av = averagePercentileForGroup(getDisplayPercentileVector(a), tableGroupKeys, g);
        const bv = averagePercentileForGroup(getDisplayPercentileVector(b), tableGroupKeys, g);
        return m * (av - bv);
      }
      if (sort.startsWith("stat:")) {
        const keyRaw = sort.slice(5);
        if (!isMoneyballStat(keyRaw)) return m * (a.weightedScore - b.weightedScore);
        const av = getDisplayPercentileVector(a)[tableGroupKeys.indexOf(keyRaw)] ?? 0;
        const bv = getDisplayPercentileVector(b)[tableGroupKeys.indexOf(keyRaw)] ?? 0;
        return m * (av - bv);
      }
      return m * (a.weightedScore - b.weightedScore);
    });
    return copy;
  }, [
    filtered,
    sort,
    sortDir,
    visibleStatKeys,
    tableGroups,
    tableGroupKeys,
    isAllGroupsFilter,
    getDisplayPercentileVector,
  ]);

  const total = sorted.length;
  const pageCount =
    total === 0 ? 1 : pageSize === "all" ? 1 : Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(urlPage, pageCount);
  const effectiveSize = pageSize === "all" ? Math.max(1, total) : pageSize;
  const pageItems =
    pageSize === "all" ? sorted : sorted.slice((page - 1) * pageSize, page * pageSize);
  const showingFrom = total === 0 ? 0 : (page - 1) * effectiveSize + 1;
  const showingTo = total === 0 ? 0 : Math.min(page * effectiveSize, total);

  const selectedRows = pageItems.filter((r) => selectedIds.includes(r.uniqueId));
  const chartSeries = isAllGroupsFilter
    ? selectedRows.slice(0, 4).map((r) => ({
        name: r.player,
        values: tableGroups.map((g) =>
          averagePercentileForGroup(getDisplayPercentileVector(r), tableGroupKeys, g),
        ),
      }))
    : selectedRows.slice(0, 4).map((r) => ({
        name: r.player,
        values: visibleStatKeys.map(
          (k) => getDisplayPercentileVector(r)[tableGroupKeys.indexOf(k)] ?? 0,
        ),
      }));

  const chartLabels = isAllGroupsFilter
    ? tableGroups.map((g) => g.name)
    : visibleStatKeys.map((k) => getStatLabel(k));

  const openPlayer = scoredRows.find((r) => r.uniqueId === openPlayerId) ?? null;

  const openPlayerChartSections = useMemo(() => {
    if (!openPlayer) return [];
    if (isAllGroupsFilter) {
      const useFull = Boolean(latestComputed);
      const groups = useFull ? activeGroups : scoredGroups;
      const keys = useFull ? displayRoleGroupKeys : roleGroupKeys;
      const v = useFull
        ? percentileVectorForStatKeyOrder(
            openPlayer.role === "gk"
              ? latestComputed!.gkPercentiles[openPlayer.uniqueId]
              : latestComputed!.outfieldPercentiles[openPlayer.uniqueId],
            statKeys,
            keys,
          )
        : openPlayer.percentileVector;
      return groups
        .map((g) => {
          const statKeysInOrder = statKeysForGroupInRoleOrder(keys, g);
          const values = percentileValuesForGroup(v, keys, g);
          return {
            id: g.id,
            title: g.name,
            statKeys: statKeysInOrder,
            labels: statKeysInOrder.map((k) => getStatLabel(k)),
            values,
          };
        })
        .filter((s) => s.labels.length > 0);
    }
    const filteredGroupName =
      groupFilterId && activeGroups.find((g) => g.id === groupFilterId)?.name;
    const pv = getDisplayPercentileVector(openPlayer);
    return [
      {
        id: "filtered",
        title: filteredGroupName ?? "Stats",
        statKeys: visibleStatKeys,
        labels: visibleStatKeys.map((k) => getStatLabel(k)),
        values: visibleStatKeys.map((k) => pv[tableGroupKeys.indexOf(k)] ?? 0),
      },
    ];
  }, [
    openPlayer,
    isAllGroupsFilter,
    latestComputed,
    activeGroups,
    scoredGroups,
    displayRoleGroupKeys,
    roleGroupKeys,
    visibleStatKeys,
    groupFilterId,
    statKeys,
    tableGroupKeys,
    getDisplayPercentileVector,
  ]);

  const setSort = (nextSort: string) => {
    const nextDir: SortDir = sort === nextSort ? (sortDir === "asc" ? "desc" : "asc") : "desc";
    replacePreservingScroll(
      buildListQuery(pathname, {
        page: 1,
        pageSize,
        sort: nextSort,
        sortDir: nextDir,
        q: draft.trim(),
        groupId: groupFilterId ?? undefined,
      }),
    );
  };

  const setGroup = (nextGroup: string | null) => {
    let nextSort = sort;
    if (nextGroup === null) {
      if (sort.startsWith("stat:")) nextSort = DEFAULT_SORT;
    } else {
      if (sort.startsWith("group:")) nextSort = DEFAULT_SORT;
      if (sort.startsWith("stat:")) {
        const keyRaw = sort.slice(5);
        const g = activeGroups.find((x) => x.id === nextGroup);
        if (!isMoneyballStat(keyRaw) || !g?.statKeys.includes(keyRaw)) nextSort = DEFAULT_SORT;
      }
    }
    const nextSortDir = nextSort === sort ? sortDir : DEFAULT_SORT_DIR;
    replacePreservingScroll(
      buildListQuery(pathname, {
        page: 1,
        pageSize,
        sort: nextSort,
        sortDir: nextSortDir,
        q: draft.trim(),
        groupId: nextGroup ?? undefined,
      }),
    );
  };

  const setPage = (nextPage: number) =>
    replacePreservingScroll(
      buildListQuery(pathname, {
        page: nextPage,
        pageSize,
        sort,
        sortDir,
        q: draft.trim(),
        groupId: groupFilterId ?? undefined,
      }),
    );

  const setPageSize = (nextPageSize: PageSizeChoice) =>
    replacePreservingScroll(
      buildListQuery(pathname, {
        page: 1,
        pageSize: nextPageSize,
        sort,
        sortDir,
        q: draft.trim(),
        groupId: groupFilterId ?? undefined,
      }),
    );

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          color="primary"
          variant={uiRole === "outfield" ? "solid" : "outline"}
          size="sm"
          className="font-black uppercase tracking-wider"
          onClick={() => setUiRole("outfield")}
        >
          Outfield
        </Button>
        <Button
          type="button"
          color="primary"
          variant={uiRole === "gk" ? "solid" : "outline"}
          size="sm"
          className="font-black uppercase tracking-wider"
          onClick={() => setUiRole("gk")}
        >
          Goalkeeper
        </Button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Search players, clubs, IDs..."
          className="w-full rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-3 py-2 text-sm shadow-[2px_2px_0_oklch(var(--border))] sm:w-80"
        />
        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
          <span className="whitespace-nowrap">Min mins</span>
          <input
            type="number"
            min={0}
            value={searchMinimumMinutes}
            onChange={(e) =>
              setSearchMinimumMinutes(Math.max(0, Number(e.target.value) || 0))
            }
            className="w-20 rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-2 py-2 text-right font-mono text-sm shadow-[2px_2px_0_oklch(var(--border))]"
          />
        </label>
      </section>

      <section className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Stat group filter">
        <Button
          type="button"
          color="alt"
          variant={groupFilterId === null ? "solid" : "outline"}
          size="sm"
          onClick={() => setGroup(null)}
        >
          All Groups
        </Button>
        {activeGroups.map((group) => (
          <Button
            key={group.id}
            type="button"
            color="alt"
            variant={groupFilterId === group.id ? "solid" : "outline"}
            size="sm"
            onClick={() => setGroup(group.id)}
          >
            {group.name}
          </Button>
        ))}
      </section>

      <div className="overflow-x-auto rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] shadow-[4px_4px_0_oklch(var(--border))]">
        <table className="min-w-full text-sm">
          <thead className="bg-[oklch(var(--border))]/10">
            <tr>
              <th className="border-b-2 border-[oklch(var(--border))] px-3 py-2 text-left" />
              <SortableTh
                label="Player"
                align="left"
                columnSort="player"
                listSort={sort}
                listSortDir={sortDir}
                onSort={() => setSort("player")}
              />
              <SortableTh
                label="Score"
                align="right"
                columnSort="score"
                listSort={sort}
                listSortDir={sortDir}
                onSort={() => setSort("score")}
              />
              <SortableTh
                label="Pos"
                align="left"
                columnSort="position"
                listSort={sort}
                listSortDir={sortDir}
                onSort={() => setSort("position")}
              />
              {isAllGroupsFilter
                ? tableGroups.map((g) => (
                    <SortableTh
                      key={g.id}
                      label={g.name}
                      align="right"
                      columnSort={`group:${g.id}`}
                      listSort={sort}
                      listSortDir={sortDir}
                      onSort={() => setSort(`group:${g.id}`)}
                    />
                  ))
                : visibleStatKeys.map((k) => (
                    <SortableTh
                      key={k}
                      label={getStatLabel(k)}
                      align="right"
                      columnSort={`stat:${k}`}
                      listSort={sort}
                      listSortDir={sortDir}
                      onSort={() => setSort(`stat:${k}`)}
                    />
                  ))}
            </tr>
          </thead>
          <tbody>
            {pageItems.map((row) => (
              <tr key={row.uniqueId} className="border-b-2 border-[oklch(var(--border))]/30">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.uniqueId)}
                    onChange={() => toggleSelected(row.uniqueId)}
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setOpenPlayerId(row.uniqueId)}
                    className="font-bold underline decoration-2 underline-offset-2"
                  >
                    {row.player}
                  </button>
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold">
                  {row.weightedScore.toFixed(1)}
                </td>
                <td className="px-3 py-2 font-mono text-xs uppercase">{row.position || "-"}</td>
                {isAllGroupsFilter
                  ? tableGroups.map((g) => (
                      <td key={g.id} className="px-3 py-2 text-right font-mono">
                        {Math.round(
                          averagePercentileForGroup(getDisplayPercentileVector(row), tableGroupKeys, g),
                        )}
                      </td>
                    ))
                  : visibleStatKeys.map((k) => (
                      <td
                        key={`${row.uniqueId}-${k}`}
                        className="px-3 py-2 text-right font-mono"
                      >
                        {Math.round(getDisplayPercentileVector(row)[tableGroupKeys.indexOf(k)] ?? 0)}
                      </td>
                    ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationControls
        page={page}
        pageCount={pageCount}
        pageSize={pageSize}
        totalItems={total}
        showingFrom={showingFrom}
        showingTo={showingTo}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {selectedRows.length >= 2 && (
        <PolarPercentileChart labels={chartLabels} series={chartSeries} />
      )}

      <PlayerDetailModal
        open={Boolean(openPlayer)}
        onClose={() => setOpenPlayerId(null)}
        player={openPlayer}
        chartSections={openPlayerChartSections}
      />
    </div>
  );
}
