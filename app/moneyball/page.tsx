"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/Button";
import { BaselineConfigModal } from "@/features/moneyball/BaselineConfigModal";
import { useMoneyball } from "@/features/moneyball/MoneyballDataProvider";
import { MoneyballPlayersTable } from "@/features/moneyball/MoneyballPlayersTable";
import { MoneyballWeightsConfig } from "@/features/moneyball/MoneyballWeightsConfig";

function MoneyballModeContent() {
  const [baselineOpen, setBaselineOpen] = useState(false);
  const [weightsOpen, setWeightsOpen] = useState(false);
  const playerCsvInputRef = useRef<HTMLInputElement>(null);
  const {
    loading,
    latestComputed,
    filteredRows,
    playerViewImport,
    importPlayerViewCsvFile,
    clearPlayerViewImport,
  } = useMoneyball();

  return (
    <div className="min-h-screen bg-[oklch(var(--background))] text-[oklch(var(--text))]">
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tight">
            Moneyball Mode
          </h1>
          <p className="text-sm text-[oklch(var(--text))/0.75]">
            Build and use baseline percentiles from stats exports, then compare
            players by weighted role-group metrics.
          </p>
        </header>

        <section className="flex flex-wrap items-center gap-2 rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] px-4 py-3 shadow-[4px_4px_0_oklch(var(--border))]">
          <Button
            color="primary"
            variant="solid"
            size="sm"
            onClick={() => setBaselineOpen(true)}
          >
            Baseline Stats
          </Button>
          <Button
            color="alt"
            variant="solid"
            size="sm"
            onClick={() => setWeightsOpen(true)}
          >
            Weights
          </Button>
          <div className="ml-auto font-mono text-xs text-[oklch(var(--text))]/70">
            {latestComputed
              ? `Computed on ${new Date(latestComputed.createdAt).toLocaleString()}`
              : "No percentile snapshot yet"}
          </div>
        </section>

        <section className="flex flex-col items-start gap-4 rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] px-6 py-5 shadow-[4px_4px_0_oklch(var(--border))] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide">
              Player View CSV
            </p>
            <p className="text-xs text-[oklch(var(--text))/0.65]">
              Import one CSV for player view. Importing another CSV replaces the
              current player view.
            </p>
          </div>
          <div className="flex  items-center gap-2">
            <Button
              color="alt"
              variant="outline"
              size="lg"
              onClick={() => void clearPlayerViewImport()}
              disabled={!playerViewImport}
            >
              Clear CSV Import
            </Button>
            <input
              ref={playerCsvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(e) => {
                void importPlayerViewCsvFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              color="primary"
              variant="solid"
              size="lg"
              onClick={() => playerCsvInputRef.current?.click()}
            >
              Choose CSV File
            </Button>
          </div>
        </section>

        {loading ? (
          <p className="text-sm font-bold text-[oklch(var(--text))]/65">
            Loading moneyball data...
          </p>
        ) : filteredRows.length === 0 ? (
          <p className="text-sm font-bold text-[oklch(var(--text))]/65">
            Import one player-view CSV to populate players. Baseline imports are
            calculation-only.
          </p>
        ) : (
          <MoneyballPlayersTable />
        )}
      </main>

      <BaselineConfigModal
        open={baselineOpen}
        onClose={() => setBaselineOpen(false)}
      />
      <MoneyballWeightsConfig
        open={weightsOpen}
        onClose={() => setWeightsOpen(false)}
      />
    </div>
  );
}

export default function MoneyballPage() {
  return <MoneyballModeContent />;
}
