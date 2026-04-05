"use client";

import Link from "next/link";
import PlayersListClient from "./PlayerListClient";
import { usePlayersData } from "../../components/PlayersDataProvider";

export default function PlayersPageClient() {
  const { state } = usePlayersData();
  const players = state.players;

  if (players.length === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6 text-[oklch(var(--text))]">
        <h1 className="text-xl font-semibold">Players</h1>
        <p className="text-sm text-[oklch(var(--text))]/80">
          No players imported yet. Load a CSV on the homepage to browse and open
          profiles here.
        </p>
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-[oklch(var(--primary))] hover:underline"
        >
          Go to import
        </Link>
      </div>
    );
  }

  return <PlayersListClient players={players} />;
}
