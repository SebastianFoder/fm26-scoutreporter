"use client";

import { useMemo, useState } from "react";
import type { PlayerWithGroups } from "../../data/players-store";
import type { AttributeKey, AttributeWeights } from "../../types/weights";
import { computeScore } from "../../lib/scoring";
import {
  getBandForValue,
  useActiveAttributeProfile,
} from "../../components/AttributeColorConfig";
import { useActiveWeights } from "../../components/WeightConfig";
import { Button } from "../../components/Button";
import { useHighlightedAttributes } from "../../components/HighlightedAttributesConfig";
import Link from "next/link";

interface Props {
  players: PlayerWithGroups[];
  selectable?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
}

const DEFAULT_HIGHLIGHTED: AttributeKey[] = ["finishing", "offTheBall", "pace"];

const PAGE_SIZE = 10;

export default function PlayersListClient({
  players,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
}: Props) {
  const [page, setPage] = useState(1);
  const highlighted = useHighlightedAttributes();
  const weights = useActiveWeights();

  const profile = useActiveAttributeProfile();

  const scored = useMemo(
    () =>
      players
        .map((p) => {
          const score = computeScore(p, weights);
          return { p, score };
        })
        .sort((a, b) => b.score - a.score),
    [players, weights],
  );

  const pageCount = Math.ceil(scored.length / PAGE_SIZE);
  const pageItems = scored.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6 text-[oklch(var(--text))]">
      <h1 className="text-xl font-semibold">Players</h1>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-[oklch(var(--text))]/40 bg-[oklch(var(--text))]/10 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-[oklch(var(--text))]/10">
            <tr>
              {selectable && <th className="px-3 py-2 text-left"></th>}
              <th className="px-3 py-2 text-left">Player</th>
              <th className="px-3 py-2 text-left">Pos</th>
              <th className="px-3 py-2 text-right">Score</th>
              {highlighted.map((key) => (
                <th key={key} className="px-3 py-2 text-right capitalize">
                  {key}
                </th>
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
                  <Link
                    href={`/players/${p.raw.uniqueId}`}
                    className="hover:underline"
                  >
                    {p.raw.player}
                  </Link>
                </td>
                <td className="px-3 py-1.5">{p.raw.position}</td>
                <td className="px-3 py-1.5 text-right font-semibold">
                  {score.toFixed(2)}
                </td>
                {highlighted.map((key) => {
                  const g = p.grouped;
                  const value: number =
                    (g.goalkeeping as any)[key] ??
                    (g.technical as any)[key] ??
                    (g.mental as any)[key] ??
                    (g.physical as any)[key] ??
                    0;
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

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span>
          Page {page} / {pageCount}
        </span>
        <div className="flex gap-2">
          <Button
            color="alt"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
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
    </div>
  );
}
