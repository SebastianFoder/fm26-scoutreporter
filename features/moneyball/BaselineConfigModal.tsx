"use client";

import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { useMoneyball } from "./MoneyballDataProvider";

export function BaselineConfigModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    baselineImports,
    parseErrors,
    baseline,
    importBaselineCsvFiles,
    clearBaselineImports,
    setBaseline,
    calculatePercentiles,
    latestComputed,
  } = useMoneyball();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Baseline Stats"
      description="Import one or more baseline CSV files for percentile calculation only, then set minimum minutes."
      size="xl"
    >
      <div className="space-y-4">
        <section className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] p-4 shadow-[2px_2px_0_oklch(var(--border))]">
          <h3 className="text-sm font-black uppercase tracking-wide">CSV Imports</h3>
          <div className="mt-2 flex items-center gap-3">
            <label className="inline-flex cursor-pointer items-center rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--primary))] px-4 py-2 text-sm font-bold text-[oklch(var(--background))] shadow-[2px_2px_0_oklch(var(--border))]">
              <input
                type="file"
                multiple
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  void importBaselineCsvFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              Import CSV files
            </label>
            <Button
              color="alt"
              variant="outline"
              size="sm"
              onClick={() => void clearBaselineImports()}
              disabled={baselineImports.length === 0}
            >
              Clear baseline imports
            </Button>
            <span className="text-xs font-mono text-[oklch(var(--text))]/70">
              {baselineImports.length} baseline dataset(s)
            </span>
          </div>
          {parseErrors.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[oklch(var(--red-bg))]">
              {parseErrors.slice(0, 8).map((e, i) => (
                <li key={`${e.line}-${i}`}>{e.message}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] p-4 shadow-[2px_2px_0_oklch(var(--border))]">
          <h3 className="text-sm font-black uppercase tracking-wide">Compute</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="text-xs font-black uppercase tracking-wider">
              Baseline min minutes
            </label>
            <input
              type="number"
              min={0}
              value={baseline.minimumMinutes}
              onChange={(e) =>
                setBaseline({
                  ...baseline,
                  minimumMinutes: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="w-28 rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-2 py-1 text-right font-mono text-sm shadow-[2px_2px_0_oklch(var(--border))]"
            />
            <Button
              color="primary"
              variant="solid"
              size="sm"
              onClick={() => void calculatePercentiles()}
              disabled={baselineImports.length === 0}
            >
              Calculate stats and percentiles
            </Button>
          </div>
          {latestComputed && (
            <p className="mt-2 text-xs text-[oklch(var(--text))]/75">
              Last computed:{" "}
              <span className="font-mono">{new Date(latestComputed.createdAt).toLocaleString()}</span>
            </p>
          )}
        </section>
      </div>
    </Modal>
  );
}
