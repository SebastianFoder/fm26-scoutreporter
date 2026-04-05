"use client";

import { Suspense, useEffect, useMemo, type ReactNode } from "react";
import type { PlayerWithGroups } from "../../data/players-store";
import type { AttributeKey } from "../../types/weights";
import { computeScore, getPlayerAttributeValue } from "../../lib/scoring";
import {
  getBandForValue,
  useActiveAttributeProfile,
} from "../../components/AttributeColorConfig";
import { useActiveWeights } from "../../components/WeightConfig";
import { useHighlightedAttributes } from "../../components/HighlightedAttributesConfig";
import Link from "next/link";
import { ArrowDown, ArrowUp, ExternalLink } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  PaginationControls,
  parsePageParam,
  parsePageSizeParam,
  type PageSizeChoice,
} from "../../components/PaginationControls";

interface Props {
  players: PlayerWithGroups[];
  selectable?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
}

type SortDir = "asc" | "desc";

type Row = { p: PlayerWithGroups; score: number };

const DEFAULT_SORT = "score";
const DEFAULT_SORT_DIR: SortDir = "desc";

function isDefaultSort(sort: string, dir: SortDir): boolean {
  return sort === DEFAULT_SORT && dir === DEFAULT_SORT_DIR;
}

function buildListQuery(
  pathname: string,
  opts: {
    page: number;
    pageSize: PageSizeChoice;
    sort: string;
    sortDir: SortDir;
  },
): string {
  const p = new URLSearchParams();
  if (opts.page > 1) p.set("page", String(opts.page));
  if (opts.pageSize !== 10) {
    p.set("pageSize", opts.pageSize === "all" ? "all" : String(opts.pageSize));
  }
  if (!isDefaultSort(opts.sort, opts.sortDir)) {
    p.set("sort", opts.sort);
    p.set("sortDir", opts.sortDir);
  }
  const q = p.toString();
  return q ? `${pathname}?${q}` : pathname;
}

function parseListSort(
  searchParams: URLSearchParams,
  highlighted: AttributeKey[],
): { sort: string; sortDir: SortDir } {
  const rawSort = searchParams.get("sort");
  const rawDir = searchParams.get("sortDir");
  const sortDir: SortDir =
    rawDir === "asc" || rawDir === "desc" ? rawDir : DEFAULT_SORT_DIR;

  if (!rawSort) {
    return { sort: DEFAULT_SORT, sortDir: DEFAULT_SORT_DIR };
  }

  if (rawSort === "player" || rawSort === "position" || rawSort === "score") {
    return { sort: rawSort, sortDir };
  }

  if (rawSort.startsWith("attr:")) {
    const key = rawSort.slice(5) as AttributeKey;
    if (highlighted.includes(key)) {
      return { sort: rawSort, sortDir };
    }
  }

  return { sort: DEFAULT_SORT, sortDir: DEFAULT_SORT_DIR };
}

function compareRows(a: Row, b: Row, sort: string, sortDir: SortDir): number {
  const m = sortDir === "asc" ? 1 : -1;
  if (sort === "player") {
    return (
      m *
      a.p.raw.player.localeCompare(b.p.raw.player, undefined, {
        sensitivity: "base",
      })
    );
  }
  if (sort === "position") {
    return (
      m *
      a.p.raw.position.localeCompare(b.p.raw.position, undefined, {
        sensitivity: "base",
      })
    );
  }
  if (sort === "score") {
    return m * (a.score - b.score);
  }
  if (sort.startsWith("attr:")) {
    const key = sort.slice(5) as AttributeKey;
    return (
      m *
      (getPlayerAttributeValue(a.p, key) - getPlayerAttributeValue(b.p, key))
    );
  }
  return m * (a.score - b.score);
}

function nextSortFromClick(
  column: string,
  currentSort: string,
  currentDir: SortDir,
): { sort: string; sortDir: SortDir } {
  if (currentSort === column) {
    return {
      sort: column,
      sortDir: currentDir === "asc" ? "desc" : "asc",
    };
  }
  const defaultDir: SortDir =
    column === "player" || column === "position" ? "asc" : "desc";
  return { sort: column, sortDir: defaultDir };
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
  const ariaSort = active
    ? listSortDir === "asc"
      ? "ascending"
      : "descending"
    : "none";

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`px-3 py-2 ${align === "left" ? "text-left" : "text-right"}`}
    >
      <button
        type="button"
        onClick={onSort}
        className={`inline-flex w-full items-center gap-1 rounded-lg px-1 py-0.5 text-sm font-medium text-[oklch(var(--text))] hover:bg-[oklch(var(--text))]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(var(--primary))]/50 ${
          align === "right" ? "justify-end" : "justify-start"
        }`}
      >
        <span className="capitalize">{label}</span>
        {active &&
          (listSortDir === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
          ))}
      </button>
    </th>
  );
}

function NewTabPlayerLink({ uniqueId, name }: { uniqueId: string; name: string }) {
  return (
    <Link
      href={`/players/${uniqueId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 rounded-lg p-1 text-[oklch(var(--text))]/55 hover:bg-[oklch(var(--text))]/10 hover:text-[oklch(var(--primary))]"
      aria-label={`Open ${name} in new tab`}
      title="Open in new tab"
    >
      <ExternalLink className="h-4 w-4" aria-hidden />
    </Link>
  );
}

function PlayersListClientInner({
  players,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
}: Props) {
  const highlighted = useHighlightedAttributes();
  const weights = useActiveWeights();
  const profile = useActiveAttributeProfile();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { sort: listSort, sortDir: listSortDir } = useMemo(
    () => parseListSort(searchParams, highlighted),
    [searchParams, highlighted],
  );

  const rows = useMemo(
    () =>
      players.map((p) => ({
        p,
        score: computeScore(p, weights),
      })),
    [players, weights],
  );

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => compareRows(a, b, listSort, listSortDir));
    return copy;
  }, [rows, listSort, listSortDir]);

  const total = sortedRows.length;

  const urlPage = parsePageParam(searchParams.get("page"));
  const urlPageSize = parsePageSizeParam(searchParams.get("pageSize"));

  const pageSize: PageSizeChoice = urlPageSize;
  const pageCount =
    total === 0
      ? 1
      : pageSize === "all"
        ? 1
        : Math.max(1, Math.ceil(total / pageSize));

  const rawPage = urlPage;
  const page = Math.min(rawPage, pageCount);

  const listQueryOpts = useMemo(
    () => ({ page, pageSize, sort: listSort, sortDir: listSortDir }),
    [page, pageSize, listSort, listSortDir],
  );

  useEffect(() => {
    if (rawPage === page) return;
    router.replace(buildListQuery(pathname, { ...listQueryOpts, page }), {
      scroll: false,
    });
  }, [rawPage, page, pathname, router, listQueryOpts]);

  const effectiveSize = pageSize === "all" ? Math.max(1, total) : pageSize;
  const pageItems =
    pageSize === "all"
      ? sortedRows
      : sortedRows.slice((page - 1) * pageSize, page * pageSize);

  const showingFrom = total === 0 ? 0 : (page - 1) * effectiveSize + 1;
  const showingTo =
    total === 0 ? 0 : Math.min(page * effectiveSize, total);

  const replaceListUrl = (opts: {
    page: number;
    pageSize: PageSizeChoice;
    sort: string;
    sortDir: SortDir;
  }) => {
    router.replace(buildListQuery(pathname, opts), { scroll: false });
  };

  const setUrlPagination = (nextPage: number, nextSize: PageSizeChoice) => {
    const nextCount =
      total === 0
        ? 1
        : nextSize === "all"
          ? 1
          : Math.max(1, Math.ceil(total / nextSize));
    const clampedPage = Math.min(Math.max(1, nextPage), nextCount);
    replaceListUrl({
      page: clampedPage,
      pageSize: nextSize,
      sort: listSort,
      sortDir: listSortDir,
    });
  };

  const onPageChange = (next: number) => {
    setUrlPagination(next, pageSize);
  };

  const onPageSizeChange = (nextSize: PageSizeChoice) => {
    setUrlPagination(1, nextSize);
  };

  const onColumnSort = (column: string) => {
    const next = nextSortFromClick(column, listSort, listSortDir);
    replaceListUrl({
      page: 1,
      pageSize,
      sort: next.sort,
      sortDir: next.sortDir,
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6 text-[oklch(var(--text))]">
      <h1 className="text-xl font-semibold">Players</h1>

      <div className="overflow-x-auto rounded-2xl border border-[oklch(var(--text))]/40 bg-[oklch(var(--text))]/10 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-[oklch(var(--text))]/10">
            <tr>
              {selectable && <th className="px-3 py-2 text-left"></th>}
              <SortableTh
                label="Player"
                align="left"
                columnSort="player"
                listSort={listSort}
                listSortDir={listSortDir}
                onSort={() => onColumnSort("player")}
              />
              <SortableTh
                label="Pos"
                align="left"
                columnSort="position"
                listSort={listSort}
                listSortDir={listSortDir}
                onSort={() => onColumnSort("position")}
              />
              <SortableTh
                label="Score"
                align="right"
                columnSort="score"
                listSort={listSort}
                listSortDir={listSortDir}
                onSort={() => onColumnSort("score")}
              />
              {highlighted.map((key) => (
                <SortableTh
                  key={key}
                  label={key}
                  align="right"
                  columnSort={`attr:${key}`}
                  listSort={listSort}
                  listSortDir={listSortDir}
                  onSort={() => onColumnSort(`attr:${key}`)}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {pageItems.map(({ p, score }) => (
              <tr
                key={p.raw.uniqueId}
                className={`border-b border-[oklch(var(--text))]/40 ${
                  selectable && selectedIds.includes(p.raw.uniqueId)
                    ? "bg-[oklch(var(--primary))]/25"
                    : ""
                }`}
              >
                {selectable && (
                  <td className="px-3 py-1.5">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedIds.includes(p.raw.uniqueId)}
                      onChange={() => onToggleSelect?.(p.raw.uniqueId)}
                    />
                  </td>
                )}
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/players/${p.raw.uniqueId}`}
                      className="hover:underline"
                    >
                      {p.raw.player}
                    </Link>
                    <NewTabPlayerLink uniqueId={p.raw.uniqueId} name={p.raw.player} />
                  </div>
                </td>
                <td className="px-3 py-1.5">{p.raw.position}</td>
                <td className="px-3 py-1.5 text-right font-semibold">
                  {score.toFixed(2)}
                </td>
                {highlighted.map((key) => {
                  const value = getPlayerAttributeValue(p, key);
                  const band = getBandForValue(value, profile.thresholds);
                  const color = profile.colors[band];
                  return (
                    <td
                      key={key}
                      className="px-3 py-1.5 text-right font-mono text-xs"
                      style={{ color }}
                    >
                      {value}
                    </td>
                  );
                })}
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
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}

export default function PlayersListClient(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl p-6 text-sm text-[oklch(var(--text))]/70">
          Loading table…
        </div>
      }
    >
      <PlayersListClientInner {...props} />
    </Suspense>
  );
}
