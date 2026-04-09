"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PlayerAttributesClient } from "@/features/attribute/players/PlayerAttributesClient";
import { usePlayersData } from "@/components/PlayersDataProvider";

export default function AttributePlayerPage() {
  const { state } = usePlayersData();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const player = useMemo(
    () => state.players.find((p) => p.raw.uniqueId === id),
    [state.players, id],
  );

  if (!player) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6 text-[oklch(var(--text))]">
        <h1 className="text-2xl font-black uppercase">Player not found</h1>
        <p className="text-sm text-[oklch(var(--text))]/75">
          This player isn&apos;t in the currently imported dataset. Import a CSV on{" "}
          <Link
            href="/attribute"
            className="font-bold text-[oklch(var(--primary))] underline decoration-2 underline-offset-2 hover:decoration-[oklch(var(--alt))]"
          >
            attribute mode
          </Link>{" "}
          and try again.
        </p>
      </div>
    );
  }

  const { raw, grouped } = player;
  const isGoalkeeper = raw.position.includes("GK");

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6 text-[oklch(var(--text))]">
      <header className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] px-6 py-4 shadow-[4px_4px_0_oklch(var(--border))]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] font-mono text-xs text-[oklch(var(--text))]/70">
              N/A
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase leading-tight tracking-tight">
                {raw.player}
              </h1>
              <p className="font-mono text-xs text-[oklch(var(--text))]/75">
                {raw.position} · {raw.age} yrs ·{" "}
                {raw.euNational ? "EU" : "Non-EU"}
              </p>
              <p className="mt-1 font-mono text-[11px] text-[oklch(var(--text))]/55">
                ID: {raw.uniqueId}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 text-xs text-[oklch(var(--text))]">
            <div className="inline-flex items-center gap-2 rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-3 py-1">
              <span className="font-bold">
                {raw.transferValueRange ?? "No valuation"}
              </span>
            </div>
            <div className="text-right font-mono">
              <div>{raw.wage ?? "No wage data"}</div>
              <div>
                Expires <span className="font-bold">{raw.expires}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-[2fr_minmax(220px,1fr)]">
        <PlayerAttributesClient grouped={grouped} isGoalkeeper={isGoalkeeper} />

        <aside className="flex flex-col gap-3">
          <section className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] px-4 py-3 text-xs shadow-[2px_2px_0_oklch(var(--border))]">
            <h2 className="mb-2 text-sm font-black uppercase tracking-wide">Info</h2>
            <dl className="space-y-1.5">
              <Row label="Position" value={raw.position} />
              <Row label="Age" value={String(raw.age)} />
              <Row label="EU National" value={raw.euNational ? "Yes" : "No"} />
            </dl>
          </section>

          <section className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] px-4 py-3 text-xs shadow-[2px_2px_0_oklch(var(--border))]">
            <h2 className="mb-2 text-sm font-black uppercase tracking-wide">Footedness</h2>
            <dl className="space-y-1.5">
              <Row label="Right Foot" value={raw.rightFoot} />
              <Row label="Left Foot" value={raw.leftFoot} />
            </dl>
          </section>
        </aside>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-sm font-bold text-[oklch(var(--text))]/75">{label}</dt>
      <dd className="text-right font-mono text-sm">{value}</dd>
    </div>
  );
}
