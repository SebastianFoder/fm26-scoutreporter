"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/Button";
import { useMoneyball } from "@/features/moneyball/MoneyballDataProvider";
import { MustermannDataProvider } from "@/features/mustermann/MustermannDataProvider";
import { MustermannOptaModal } from "@/features/mustermann/MustermannOptaModal";
import { MustermannPlayerCards } from "@/features/mustermann/MustermannPlayerCards";

function MustermannModeContent() {
  const [optaOpen, setOptaOpen] = useState(false);
  const [testDataLoading, setTestDataLoading] = useState(false);
  const playerCsvInputRef = useRef<HTMLInputElement>(null);
  const {
    loading,
    latestComputed,
    filteredRows,
    playerViewImport,
    importPlayerViewCsvFile,
    clearPlayerViewImport,
  } = useMoneyball();

  const loadTestData = async () => {
    setTestDataLoading(true);
    try {
      const res = await fetch("/api/fixtures/stats");
      if (!res.ok) throw new Error("Failed to fetch fixture");
      const text = await res.text();
      const file = new File([text], "stats.csv", { type: "text/csv" });
      await importPlayerViewCsvFile(file);
    } finally {
      setTestDataLoading(false);
    }
  };

  return (
    <MustermannDataProvider>
      <div className="min-h-screen bg-[oklch(var(--background))] text-[oklch(var(--text))]">
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
          <header className="space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tight">
              Mustermann Mode
            </h1>
            <p className="text-sm text-[oklch(var(--text))/0.75]">
              Import Mustermann-format CSVs and analyze players with control,
              excitement, and effort cards.
            </p>
          </header>

          <section className="flex flex-wrap items-center gap-2 rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] px-4 py-3 shadow-[4px_4px_0_oklch(var(--border))]">
            <Button
              color="alt"
              variant="outline"
              size="sm"
              onClick={() => setOptaOpen(true)}
            >
              Opta leagues
            </Button>
          </section>
          <section className="flex flex-col items-start gap-3 rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] px-6 py-5 shadow-[4px_4px_0_oklch(var(--border))] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide">
                Mustermann view (.fmf)
              </p>
              <p className="text-xs text-[oklch(var(--text))/0.65]">
                Import this view in FM26 before exporting CSV for Mustermann
                mode.
              </p>
            </div>
            <a
              href="/SCOUT%20REPORTER%20STATS%20V1.fmf"
              className="inline-flex items-center rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--primary))] px-4 py-2 text-sm font-bold text-[oklch(var(--background))] shadow-[2px_2px_0_oklch(var(--border))] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_oklch(var(--border))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Download Mustermann View
            </a>
          </section>

          <section className="flex flex-col items-start gap-4 rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] px-6 py-5 shadow-[4px_4px_0_oklch(var(--border))] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide">
                Player View CSV
              </p>
              <p className="text-xs text-[oklch(var(--text))/0.65]">
                Import one CSV for player view. Importing another CSV replaces
                the current player view.
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
              Loading mustermann data...
            </p>
          ) : filteredRows.length === 0 ? (
            <p className="text-sm font-bold text-[oklch(var(--text))]/65">
              Import one player-view CSV to populate players.
            </p>
          ) : (
            <div className="flex flex-col gap-8">
              <section className="space-y-3">
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  Control score cards
                </h2>
                <MustermannPlayerCards />
              </section>
            </div>
          )}
        </main>

        <MustermannOptaModal
          open={optaOpen}
          onClose={() => setOptaOpen(false)}
        />
      </div>
    </MustermannDataProvider>
  );
}

export default function MustermannPage() {
  return <MustermannModeContent />;
}
