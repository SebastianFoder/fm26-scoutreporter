"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { parsePlayersCsv } from "@/lib/parser/csv-parser";
import { groupPlayerAttributes } from "@/lib/parser/attribute-grouper";
import type { PlayerAttributes } from "@/types/player-attributes";
import type { GroupedAttributes } from "@/types/grouped-attributes";

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
  /** Returns false if the CSV could not be persisted (e.g. storage quota). In-memory state is still updated. */
  setCsvText: (csvText: string) => boolean;
  clear: () => void;
};

const STORAGE_KEY = "importedPlayersCsv";
const LEGACY_SESSION_KEY = "importedPlayersCsv";

const PlayersDataContext = createContext<PlayersDataContextValue | null>(null);

function parseAndGroup(csvText: string): PlayerWithGroups[] {
  const parsed = parsePlayersCsv(csvText);
  return parsed.map((p) => ({ raw: p, grouped: groupPlayerAttributes(p) }));
}

function readStoredCsv(): string | null {
  try {
    let stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const legacy = window.sessionStorage.getItem(LEGACY_SESSION_KEY);
      if (legacy) {
        window.localStorage.setItem(STORAGE_KEY, legacy);
        window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
        stored = legacy;
      }
    }
    return stored;
  } catch {
    return null;
  }
}

export function PlayersDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<PlayersDataState>({
    csvText: null,
    players: [],
  });

  /* eslint-disable react-hooks/set-state-in-effect -- post-SSR localStorage hydration */
  useEffect(() => {
    try {
      const stored = readStoredCsv();
      if (!stored) return;
      const players = parseAndGroup(stored);
      setState({ csvText: stored, players });
    } catch {
      // ignore
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      if (e.newValue) {
        try {
          const players = parseAndGroup(e.newValue);
          setState({ csvText: e.newValue, players });
        } catch {
          setState({ csvText: null, players: [] });
        }
      } else {
        setState({ csvText: null, players: [] });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setCsvText = useCallback(
    (csvText: string) => {
      const players = parseAndGroup(csvText);
      setState({ csvText, players });
      let persisted = true;
      try {
        window.localStorage.setItem(STORAGE_KEY, csvText);
        window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
      } catch {
        persisted = false;
      }
      return persisted;
    },
    [],
  );

  const clear = useCallback(() => {
    setState({ csvText: null, players: [] });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({ state, setState, setCsvText, clear }),
    [state, setCsvText, clear],
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
