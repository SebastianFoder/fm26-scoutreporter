"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/Button";
import { BaselineConfigModal } from "@/features/moneyball/BaselineConfigModal";
import { MoneyballModeScope } from "@/features/moneyball/MoneyballModeScope";
import { useMoneyball } from "@/features/moneyball/MoneyballDataProvider";
import { MoneyballPlayersTable } from "@/features/moneyball/MoneyballPlayersTable";
import { MoneyballWeightsConfig } from "@/features/moneyball/MoneyballWeightsConfig";

function MoneyballModeContent() {
  const [baselineOpen, setBaselineOpen] = useState(false);
  const [weightsOpen, setWeightsOpen] = useState(false);
  const [testDataLoading, setTestDataLoading] = useState(false);
  const playerCsvInputRef = useRef<HTMLInputElement>(null);
  const {
    loading,
    latestComputed,
    filteredRows,
    playerViewImport,
    importBaselineCsvFiles,
    clearBaselineImports,
    importPlayerViewCsvFile,
    clearPlayerViewImport,
    calculatePercentiles,
  } = useMoneyball();

  const loadTestData = async () => {
    setTestDataLoading(true);
    try {
      const res = await fetch("/api/fixtures/stats");
      if (!res.ok) throw new Error("Failed to fetch fixture");
      const text = await res.text();
      const file = new File([text], "stats.csv", { type: "text/csv" });
      const transfer = new DataTransfer();
      transfer.items.add(file);
      await clearBaselineImports();
      await importBaselineCsvFiles(transfer.files);
      await importPlayerViewCsvFile(file);
      await calculatePercentiles();
    } finally {
      setTestDataLoading(false);
    }
  };

  return (
    <MoneyballModeScope>
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
          <div className="ml-auto w-full font-mono text-xs text-[oklch(var(--text))]/70 sm:ml-0 sm:w-auto sm:pl-2">
            {latestComputed
              ? `Computed on ${new Date(latestComputed.createdAt).toLocaleString()}`
              : "No percentile snapshot yet"}
          </div>
        </section>
        <section className="flex flex-col items-start gap-3 rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] px-6 py-5 shadow-[4px_4px_0_oklch(var(--border))] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide">Moneyball view (.fmf)</p>
            <p className="text-xs text-[oklch(var(--text))/0.65]">
              Import this view in FM26 before exporting CSV for Moneyball mode.
            </p>
          </div>
          <a
            href="/SCOUT%20REPORTER%20STATS%20V1.fmf"
            className="inline-flex items-center rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--primary))] px-4 py-2 text-sm font-bold text-[oklch(var(--background))] shadow-[2px_2px_0_oklch(var(--border))] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_oklch(var(--border))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Download Moneyball View
          </a>
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
          <div className="flex flex-wrap items-center gap-2">
            <Button
              color="alt"
              variant="outline"
              size="lg"
              onClick={() => void clearPlayerViewImport()}
              disabled={!playerViewImport}
            >
              Clear CSV Import
            </Button>
            <Button
              color="alt"
              variant="outline"
              size="lg"
              onClick={() => void loadTestData()}
              disabled={testDataLoading}
            >
              {testDataLoading ? "Loading…" : "Load test data"}
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
          <div className="flex flex-col gap-8">
            <section className="space-y-3">
              <MoneyballPlayersTable />
            </section>
          </div>
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
    </MoneyballModeScope>
  );
}

export default function MoneyballPage() {
  return <MoneyballModeContent />;
}
