"use client";

import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import type { MoneyballStat } from "./moneyball-stat";
import type { MoneyballRow } from "./types";
import { PolarPercentileChart } from "./PolarPercentileChart";

export type PlayerDetailChartSection = {
  id: string;
  title: string;
  /** Same order as labels and values */
  statKeys: MoneyballStat[];
  labels: string[];
  values: number[];
};

const DETAIL_CHART_SIZE = 460;
const OVERVIEW_CHART_SIZE = 280;

function rawValuesForSection(player: MoneyballRow, section: PlayerDetailChartSection) {
  return section.statKeys.map((k) => player.stats[k] ?? 0);
}

export function PlayerDetailModal({
  open,
  onClose,
  player,
  chartSections,
}: {
  open: boolean;
  onClose: () => void;
  player: MoneyballRow | null;
  chartSections: PlayerDetailChartSection[];
}) {
  const [focusedSectionId, setFocusedSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setFocusedSectionId(null);
      return;
    }
    setFocusedSectionId((prev) => {
      if (prev == null) return null;
      if (!chartSections.some((s) => s.id === prev)) return null;
      return prev;
    });
  }, [open, player?.uniqueId, chartSections]);

  const focusedSection =
    focusedSectionId != null ? chartSections.find((s) => s.id === focusedSectionId) ?? null : null;

  const modalTitle = player?.player ?? "Player details";
  const modalDescription =
    player && focusedSection ? focusedSection.title : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      description={modalDescription}
      size="2xl"
    >
      {!player ? (
        <p className="text-sm text-[oklch(var(--text))]/70">No player selected.</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] p-4">
            <p className="font-mono text-xs text-[oklch(var(--text))]/70">ID: {player.uniqueId}</p>
            <p className="text-sm">{player.club}</p>
            <p className="text-sm">{player.position}</p>
            <p className="text-xs font-bold uppercase tracking-wide">
              Status: {player.inf || "None"}
            </p>
          </div>
          {chartSections.length === 0 ? (
            <p className="text-sm text-[oklch(var(--text))]/70">No percentile data for this view.</p>
          ) : focusedSection ? (
            <div className="space-y-4">
              {chartSections.length > 1 ? (
                <Button
                  type="button"
                  color="alt"
                  variant="outline"
                  size="sm"
                  onClick={() => setFocusedSectionId(null)}
                >
                  Back to overview
                </Button>
              ) : null}
              <div className="mx-auto max-w-xl">
                <PolarPercentileChart
                  title={focusedSection.title}
                  labels={focusedSection.labels}
                  series={[{ name: player.player, values: focusedSection.values }]}
                  size={DETAIL_CHART_SIZE}
                  hideLegend
                  rawValues={rawValuesForSection(player, focusedSection)}
                />
              </div>
              <div className="overflow-x-auto rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))]">
                <table className="min-w-full text-xs">
                  <thead className="bg-[oklch(var(--border))]/10">
                    <tr>
                      <th className="border-b-2 border-[oklch(var(--border))] px-3 py-2 text-left font-black uppercase tracking-wider">
                        Stat
                      </th>
                      <th className="border-b-2 border-[oklch(var(--border))] px-3 py-2 text-right font-black uppercase tracking-wider">
                        Raw
                      </th>
                      <th className="border-b-2 border-[oklch(var(--border))] px-3 py-2 text-right font-black uppercase tracking-wider">
                        Percentile
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {focusedSection.statKeys.map((key, i) => (
                      <tr
                        key={key}
                        className="border-b-2 border-[oklch(var(--border))]/30"
                      >
                        <td className="px-3 py-2 font-bold">{focusedSection.labels[i]}</td>
                        <td className="px-3 py-2 text-right font-mono">
                          {player.stats[key] ?? 0}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {Math.round(focusedSection.values[i] ?? 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {chartSections.map((section) => (
                <PolarPercentileChart
                  key={section.id}
                  title={section.title}
                  labels={section.labels}
                  series={[{ name: player.player, values: section.values }]}
                  size={OVERVIEW_CHART_SIZE}
                  hideLegend
                  rawValues={rawValuesForSection(player, section)}
                  footer={
                    <Button
                      type="button"
                      color="primary"
                      variant="outline"
                      size="sm"
                      onClick={() => setFocusedSectionId(section.id)}
                      aria-label={`View details for ${section.title}`}
                    >
                      Details
                    </Button>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
