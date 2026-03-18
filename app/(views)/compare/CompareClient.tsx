"use client";

import { useEffect, useMemo, useState } from "react";
import type { PlayerWithGroups } from "../../data/players-store";
import type { AttributeKey } from "../../types/weights";
import { computeScore } from "../../lib/scoring";
import { useActiveWeights } from "../../components/WeightConfig";
import { useHighlightedAttributes } from "../../components/HighlightedAttributesConfig";
import Link from "next/link";
import { useAnalytics } from "../../components/AnalyticsConsent";
import { Button } from "../../components/Button";

interface Props {
  players: PlayerWithGroups[];
  initialSelectedIds?: string[];
}

const FALLBACK_HIGHLIGHTED_KEYS: AttributeKey[] = [
  "finishing",
  "offTheBall",
  "pace",
];

export default function CompareClient({
  players,
  initialSelectedIds = [],
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const weights = useActiveWeights();
  const highlighted = useHighlightedAttributes();
  const { capture } = useAnalytics();

  const highlightedKeys =
    highlighted.length > 0 ? highlighted : FALLBACK_HIGHLIGHTED_KEYS;

  // Debounce search to avoid heavy filtering on each keypress
  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => window.clearTimeout(t);
  }, [query]);

  const filteredPlayers = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => {
      const name = p.raw.player.toLowerCase();
      const pos = p.raw.position.toLowerCase();
      return name.includes(q) || pos.includes(q) || p.raw.uniqueId.includes(q);
    });
  }, [players, debouncedQuery]);

  // reset pagination when query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const PAGE_SIZE = 50;
  const pageCount = Math.max(1, Math.ceil(filteredPlayers.length / PAGE_SIZE));
  const pagedPlayers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredPlayers.slice(start, start + PAGE_SIZE);
  }, [filteredPlayers, page]);

  const selected = useMemo(
    () => players.filter((p) => selectedIds.includes(p.raw.uniqueId)),
    [players, selectedIds],
  );

  const scored = useMemo(
    () =>
      selected.map((p) => ({
        p,
        score: computeScore(p, weights),
      })),
    [selected, weights],
  );

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // Debounced capture: how many players people compare
  useEffect(() => {
    const count = selectedIds.length;
    if (count < 2) return;
    const t = window.setTimeout(() => {
      capture("compare_selection_changed", { compare_count: count });
    }, 600);
    return () => window.clearTimeout(t);
  }, [selectedIds, capture]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 text-[oklch(var(--text))]">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Compare</h1>
          <p className="text-sm text-[oklch(var(--text))]/80">
            Pick players to compare. Gold/silver/bronze are awarded per row
            relative to the selected players.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            color="alt"
            variant="outline"
            size="sm"
            onClick={() => setSelectedIds([])}
            disabled={selectedIds.length === 0}
          >
            Clear selection
          </Button>
          <Button
            color="alt"
            variant="solid"
            size="sm"
            onClick={() => {
              const top = filteredPlayers.slice(0, 10).map((p) => p.raw.uniqueId);
              setSelectedIds(top);
            }}
            disabled={filteredPlayers.length === 0}
          >
            Select first 10
          </Button>
        </div>
      </header>

      {/* Selection */}
      <section className="rounded-2xl border border-[oklch(var(--text))]/40 bg-[oklch(var(--text))]/10 p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold">Selected</h2>
            <p className="text-xs text-[oklch(var(--text))]/70">
              {selectedIds.length} selected
            </p>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, position, or ID…"
            className="w-full rounded-xl border border-[oklch(var(--text))]/40 bg-[oklch(var(--text))]/10 px-3 py-2 text-sm outline-none placeholder:text-[oklch(var(--text))]/55 focus:border-[oklch(var(--primary))]/60 sm:max-w-sm"
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selected.map((p) => (
              <button
                key={p.raw.uniqueId}
                type="button"
                onClick={() => toggleSelected(p.raw.uniqueId)}
                className="inline-flex items-center gap-2 rounded-full border border-[oklch(var(--text))]/30 bg-[oklch(var(--text))]/5 px-3 py-1 text-xs hover:bg-[oklch(var(--text))]/10"
              >
                <span className="font-medium">{p.raw.player}</span>
                <span className="text-[oklch(var(--text))]/65">
                  {p.raw.position}
                </span>
                <span className="text-[oklch(var(--text))]/55">×</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-[oklch(var(--text))]/30">
          <div className="divide-y divide-[oklch(var(--text))]/20">
            {pagedPlayers.map((p) => {
              const checked = selectedIds.includes(p.raw.uniqueId);
              return (
                <label
                  key={p.raw.uniqueId}
                  className="flex cursor-pointer items-center justify-between gap-3 bg-[oklch(var(--text))]/5 px-3 py-2 hover:bg-[oklch(var(--text))]/10"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {p.raw.player}
                    </div>
                    <div className="truncate text-xs text-[oklch(var(--text))]/65">
                      {p.raw.position} · {p.raw.uniqueId}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={checked}
                    onChange={() => toggleSelected(p.raw.uniqueId)}
                  />
                </label>
              );
            })}

            {filteredPlayers.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-[oklch(var(--text))]/70">
                No players match that search.
              </div>
            )}
          </div>
        </div>

        {filteredPlayers.length > 0 && (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-[oklch(var(--text))]/70">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredPlayers.length)} of {filteredPlayers.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                color="alt"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <div className="text-xs text-[oklch(var(--text))]/70">
                Page {page} / {pageCount}
              </div>
              <Button
                color="alt"
                variant="outline"
                size="sm"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>

      {selected.length > 0 && (
        <section className="rounded-2xl border border-[oklch(var(--text))]/40 bg-[oklch(var(--text))]/10 p-4 shadow-sm">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold">
              Comparison ({selected.length})
            </h2>
            <p className="text-xs text-[oklch(var(--text))]/70">
              Rows: score + {highlightedKeys.length} highlighted attributes
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[oklch(var(--text))]/30">
            <table className="min-w-full text-xs">
              <thead className="bg-[oklch(var(--text))]/10">
              <tr>
                <th className="sticky left-0 z-10 px-3 py-2 text-left bg-[oklch(var(--text))]/10">
                  Metric
                </th>
                {scored.map(({ p }) => (
                  <th key={p.raw.uniqueId} className="px-3 py-2 text-left">
                    <div className="font-medium">
                      <Link
                        href={`/players/${p.raw.uniqueId}`}
                        className="hover:underline"
                      >
                        {p.raw.player}
                      </Link>
                    </div>
                    <div className="text-[10px] text-[oklch(var(--text))/0.65]">
                      {p.raw.position}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[oklch(var(--text))]/30 bg-[oklch(var(--text))]/5">
                <td className="sticky left-0 z-10 px-3 py-2 font-semibold bg-[oklch(var(--text))]/5">
                  Weighted score
                </td>
                {(() => {
                  const medals = medalsByPlayerId(
                    scored.map(({ p, score }) => ({
                      id: p.raw.uniqueId,
                      value: score,
                    })),
                  );

                  return scored.map(({ p, score }) => {
                    const medal = medals[p.raw.uniqueId];
                    return (
                      <td key={p.raw.uniqueId} className="px-3 py-2 text-right">
                        <span
                          className={[
                            "font-mono text-sm font-semibold",
                            medal ? medalTextClass[medal] : "",
                          ].join(" ")}
                        >
                          {score.toFixed(2)}
                        </span>
                      </td>
                    );
                  });
                })()}
              </tr>

              {highlightedKeys.map((key, idx) => {
                const values = scored.map(({ p }) => {
                  const g = p.grouped;
                  const value: number =
                    (g.goalkeeping as any)[key] ??
                    (g.technical as any)[key] ??
                    (g.mental as any)[key] ??
                    (g.physical as any)[key] ??
                    0;
                  return { id: p.raw.uniqueId, value };
                });

                const medals = medalsByPlayerId(values);

                return (
                  <tr
                    key={key}
                    className={[
                      "border-b border-[oklch(var(--text))]/20 last:border-0",
                      idx % 2 === 0 ? "bg-transparent" : "bg-[oklch(var(--text))]/5",
                    ].join(" ")}
                  >
                    <td className="sticky left-0 z-10 px-3 py-1.5 font-medium bg-inherit">
                      <span className="capitalize">{key}</span>
                    </td>
                    {scored.map(({ p }) => {
                      const v =
                        values.find((x) => x.id === p.raw.uniqueId)?.value ?? 0;
                      const medal = medals[p.raw.uniqueId];
                      return (
                        <td
                          key={p.raw.uniqueId + key}
                          className={[
                            "px-3 py-1.5 text-right font-mono text-sm",
                            medal
                              ? medalTextClass[medal]
                              : "text-[oklch(var(--text))]/85",
                          ].join(" ")}
                        >
                          {v}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        </section>
      )}

      {selected.length === 0 && (
        <div className="rounded-2xl border border-[oklch(var(--text))]/40 bg-[oklch(var(--text))]/10 p-6 text-sm text-[oklch(var(--text))]/75">
          Select at least 2 players above to start comparing.
        </div>
      )}
    </div>
  );
}

type Medal = "gold" | "silver" | "bronze";

const medalTextClass: Record<Medal, string> = {
  gold: "text-[oklch(var(--gold-bg))] font-semibold",
  silver: "text-[oklch(var(--silver-bg))] font-semibold",
  bronze: "text-[oklch(var(--bronze-bg))] font-semibold",
};

function medalsByPlayerId(
  items: Array<{ id: string; value: number }>,
): Record<string, Medal | null> {
  // Sort descending by value
  const sorted = [...items].sort((a, b) => b.value - a.value);

  // Assign medals by distinct rank (ties share medals)
  const medals: Record<string, Medal | null> = Object.fromEntries(
    items.map((i) => [i.id, null]),
  );

  const distinctValues: number[] = [];
  for (const item of sorted) {
    if (!distinctValues.includes(item.value)) distinctValues.push(item.value);
    if (distinctValues.length >= 3) break;
  }

  const valueToMedal = new Map<number, Medal>();
  if (distinctValues[0] !== undefined)
    valueToMedal.set(distinctValues[0], "gold");
  if (distinctValues[1] !== undefined)
    valueToMedal.set(distinctValues[1], "silver");
  if (distinctValues[2] !== undefined)
    valueToMedal.set(distinctValues[2], "bronze");

  for (const item of items) {
    medals[item.id] = valueToMedal.get(item.value) ?? null;
  }

  return medals;
}
