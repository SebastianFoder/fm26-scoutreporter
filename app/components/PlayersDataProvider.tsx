"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { parsePlayersCsv } from "../parser/csv-parser";
import { groupPlayerAttributes } from "../parser/attribute-grouper";
import type { PlayerAttributes } from "../types/player-attributes";
import type { GroupedAttributes } from "../types/grouped-attributes";
import { useAnalytics } from "./AnalyticsConsent";

export interface PlayerWithGroups {
  raw: PlayerAttributes;
  grouped: GroupedAttributes;
}

type PlayersDataState = {
  csvText: string | null;
  players: PlayerWithGroups[];
};

type PlayersDataContextValue = {
  state: PlayersDataState;
  setState: Dispatch<SetStateAction<PlayersDataState>>;
  setCsvText: (csvText: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "importedPlayersCsv";

const PlayersDataContext = createContext<PlayersDataContextValue | null>(null);

function parseAndGroup(csvText: string): PlayerWithGroups[] {
  const parsed = parsePlayersCsv(csvText);
  return parsed.map((p) => ({ raw: p, grouped: groupPlayerAttributes(p) }));
}

export function PlayersDataProvider({ children }: { children: React.ReactNode }) {
  const { capture } = useAnalytics();
  const [state, setState] = useState<PlayersDataState>({
    csvText: null,
    players: [],
  });

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const players = parseAndGroup(stored);
      setState({ csvText: stored, players });
    } catch {
      // ignore
    }
  }, []);

  const setCsvText = (csvText: string) => {
    const players = parseAndGroup(csvText);
    setState({ csvText, players });
    window.sessionStorage.setItem(STORAGE_KEY, csvText);
    capture("players_imported", { player_count: players.length });
  };

  const clear = () => {
    setState({ csvText: null, players: [] });
    window.sessionStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ state, setState, setCsvText, clear }),
    [state],
  );

  return (
    <PlayersDataContext.Provider value={value}>
      {children}
    </PlayersDataContext.Provider>
  );
}

export function usePlayersData() {
  const ctx = useContext(PlayersDataContext);
  if (!ctx) {
    throw new Error("usePlayersData must be used within PlayersDataProvider");
  }
  return ctx;
}

