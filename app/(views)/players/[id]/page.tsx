"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PlayerAttributesClient } from "../PlayerAttributesClient";
import { usePlayersData } from "../../../components/PlayersDataProvider";

export default function PlayerPage() {
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
        <h1 className="text-xl font-semibold">Player not found</h1>
        <p className="text-sm text-[oklch(var(--text))]/80">
          This player isn’t in the currently imported dataset. Import a CSV on{" "}
          <Link
            href="/"
            className="text-[oklch(var(--primary))] hover:underline"
          >
            the homepage
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
      {/* Header bar */}
      <header className="rounded-2xl bg-gradient-to-r from-[oklch(var(--alt))]/90 via-[oklch(var(--primary))]/40 to-[oklch(var(--alt))]/90 px-6 py-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[oklch(var(--alt))]/20 text-xs text-[oklch(var(--text))]/70">
              No image
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-tight">
                {raw.player}
              </h1>
              <p className="text-xs text-[oklch(var(--text))]/80">
                {raw.position} · {raw.age} years old ·{" "}
                {raw.euNational ? "EU" : "Non‑EU"}
              </p>
              <p className="mt-1 text-[11px] text-[oklch(var(--text))]/70">
                ID: {raw.uniqueId}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 text-xs text-[oklch(var(--text))]/90">
            <div className="inline-flex items-center gap-2 rounded-full bg-[oklch(var(--text))]/10 px-3 py-1">
              <span className="font-medium">
                {raw.transferValueRange ?? "No valuation"}
              </span>
            </div>
            <div className="text-right">
              <div>{raw.wage ?? "No wage data"}</div>
              <div>
                Contract to <span className="font-medium">{raw.expires}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main layout: attributes + info sidebar */}
      <section className="grid gap-4 md:grid-cols-[2fr_minmax(220px,1fr)]">
        <PlayerAttributesClient grouped={grouped} isGoalkeeper={isGoalkeeper} />

        <aside className="flex flex-col gap-3">
          <section className="rounded-2xl border border-[oklch(var(--text))]/30 bg-[oklch(var(--text))]/10 px-4 py-3 text-xs shadow-sm">
            <h2 className="mb-2 text-sm font-semibold">Info</h2>
            <dl className="space-y-1.5">
              <Row label="Position" value={raw.position} />
              <Row label="Age" value={String(raw.age)} />
              <Row label="EU National" value={raw.euNational ? "Yes" : "No"} />
            </dl>
          </section>

          <section className="rounded-2xl border border-[oklch(var(--text))]/30 bg-[oklch(var(--text))]/10 px-4 py-3 text-xs shadow-sm">
            <h2 className="mb-2 text-sm font-semibold">Footedness</h2>
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
      <dt className="text-sm text-[oklch(var(--text))]/80">{label}</dt>
      <dd className="text-right font-mono text-sm">{value}</dd>
    </div>
  );
}
