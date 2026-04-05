"use client";

import { useEffect, useState } from "react";
import { Button } from "./Button";

export type PageSizeChoice = 10 | 25 | 50 | 100 | "all";

export type PaginationControlsProps = {
  page: number;
  pageCount: number;
  pageSize: PageSizeChoice;
  totalItems: number;
  /** Inclusive range of visible row indices (1-based for display). */
  showingFrom: number;
  showingTo: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSizeChoice) => void;
};

const SIZE_OPTIONS: PageSizeChoice[] = [10, 25, 50, 100, "all"];

export function PaginationControls({
  page,
  pageCount,
  pageSize,
  totalItems,
  showingFrom,
  showingTo,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const [jumpValue, setJumpValue] = useState(String(page));

  useEffect(() => {
    setJumpValue(String(page));
  }, [page]);

  if (totalItems === 0) {
    return null;
  }

  const applyJump = () => {
    const n = parseInt(jumpValue, 10);
    if (!Number.isFinite(n)) return;
    const next = Math.min(pageCount, Math.max(1, n));
    onPageChange(next);
    setJumpValue(String(next));
  };

  return (
    <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-xs text-[oklch(var(--text))]/70">
        <span>
          Showing {showingFrom}–{showingTo} of {totalItems}
        </span>
        <label className="inline-flex items-center gap-2">
          <span className="text-[oklch(var(--text))]/55">Rows</span>
          <select
            value={pageSize === "all" ? "all" : String(pageSize)}
            onChange={(e) => {
              const v = e.target.value;
              onPageSizeChange(v === "all" ? "all" : (Number(v) as PageSizeChoice));
            }}
            className="rounded-lg border border-[oklch(var(--alt))/0.6] bg-[oklch(var(--alt))/0.8] px-2 py-1 text-xs text-[oklch(var(--text))]"
          >
            {SIZE_OPTIONS.map((s) => (
              <option key={String(s)} value={s === "all" ? "all" : String(s)}>
                {s === "all" ? "All" : s}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-2">
          <span className="text-[oklch(var(--text))]/55">Go to</span>
          <input
            type="number"
            min={1}
            max={pageCount}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyJump()}
            className="w-14 rounded-lg border border-[oklch(var(--alt))/0.6] bg-[oklch(var(--alt))/0.8] px-2 py-1 text-right font-mono text-xs"
          />
          <Button color="alt" variant="outline" size="sm" type="button" onClick={applyJump}>
            Go
          </Button>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          color="alt"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
        >
          First
        </Button>
        <Button
          color="alt"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </Button>
        <span className="px-1 text-xs text-[oklch(var(--text))]/70">
          Page {page} / {pageCount}
        </span>
        <Button
          color="alt"
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
        <Button
          color="alt"
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(pageCount)}
        >
          Last
        </Button>
      </div>
    </div>
  );
}

export function parsePageSizeParam(raw: string | null): PageSizeChoice {
  if (raw === "all") return "all";
  const n = parseInt(raw ?? "", 10);
  if (n === 10 || n === 25 || n === 50 || n === 100) return n;
  return 10;
}

export function parsePageParam(raw: string | null): number {
  const n = parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}
