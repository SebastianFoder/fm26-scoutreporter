"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PlayersListClient from "../(views)/players/PlayerListClient";
import { WeightConfigModal } from "./WeightConfig";
import { Button } from "./Button";
import { usePlayersData } from "./PlayersDataProvider";
import { HighlightConfigModal } from "./HighlightedAttributesConfig";

export default function AttributeModeHome() {
  const { state, setCsvText, clear } = usePlayersData();
  const players = state.players.length > 0 ? state.players : null;
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [weightsOpen, setWeightsOpen] = useState(false);
  const [highlightsOpen, setHighlightsOpen] = useState(false);
  const router = useRouter();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const persisted = setCsvText(text);
      setSelectedIds([]);
      setError(
        persisted
          ? null
          : "Import loaded in this tab only: browser storage is full or blocked. Free space or allow storage to keep data across tabs and visits.",
      );
    } catch (e) {
      console.error(e);
      setError("Could not parse CSV. Please check the file format.");
      clear();
    }
  };

  return (
    <div className="min-h-screen bg-[oklch(var(--background))] text-[oklch(var(--text))]">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tight">
            Scout Reporter
          </h1>
          <p className="max-w-2xl text-sm text-[oklch(var(--text))/0.75]">
            Import a player export CSV (same format as the template) to score
            and explore players.
          </p>
        </header>

        <section className="flex flex-col items-start gap-4 rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] px-6 py-5 shadow-[4px_4px_0_oklch(var(--border))] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide">Import player CSV</p>
            <p className="text-xs text-[oklch(var(--text))/0.65]">
              Semicolon-separated file with the same columns as your template
              export.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              color="alt"
              variant="outline"
              size="md"
              onClick={() => {
                clear();
                setSelectedIds([]);
                setError(null);
              }}
            >
              Clear import
            </Button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--primary))] px-5 py-2.5 text-sm font-bold text-[oklch(var(--background))] shadow-[2px_2px_0_oklch(var(--border))] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_oklch(var(--border))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <span>Choose CSV file</span>
            </label>
          </div>
        </section>

        {error && (
          <div className="rounded-lg border-2 border-[oklch(var(--red-bg))] bg-[oklch(var(--red-bg))/0.1] px-4 py-3 text-sm font-bold text-[oklch(var(--red-bg))]">
            {error}
          </div>
        )}

        {players && players.length > 0 && (
          <>
            <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-sm font-bold text-[oklch(var(--text))]">
                {players.length} players loaded
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  color="alt"
                  variant="solid"
                  size="md"
                  onClick={() => setWeightsOpen(true)}
                >
                  Weights
                </Button>
                <Button
                  color="alt"
                  variant="outline"
                  size="md"
                  onClick={() => setHighlightsOpen(true)}
                >
                  Columns
                </Button>

                <Button
                  color="primary"
                  variant="solid"
                  size="md"
                  disabled={selectedIds.length < 2}
                  onClick={() => {
                    if (selectedIds.length < 2) return;
                    const ids = selectedIds.join(",");
                    router.push(`/attribute/compare?ids=${encodeURIComponent(ids)}`);
                  }}
                >
                  Compare selected ({selectedIds.length})
                </Button>
              </div>
            </section>

            <section className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] shadow-[4px_4px_0_oklch(var(--border))]">
              <PlayersListClient
                players={players}
                selectable
                selectedIds={selectedIds}
                onToggleSelect={(id) =>
                  setSelectedIds((prev) =>
                    prev.includes(id)
                      ? prev.filter((x) => x !== id)
                      : [...prev, id],
                  )
                }
              />
            </section>
          </>
        )}

        {!players && !error && (
          <p className="text-sm font-bold text-[oklch(var(--text))/0.6]">
            No CSV imported yet. Use the button above to load players.
          </p>
        )}
      </main>

      <WeightConfigModal
        open={weightsOpen}
        onClose={() => setWeightsOpen(false)}
      />
      <HighlightConfigModal
        open={highlightsOpen}
        onClose={() => setHighlightsOpen(false)}
      />
    </div>
  );
}
