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
import type { AttributeKey } from "@/types/weights";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { useAnalytics } from "./AnalyticsConsent";

export interface HighlightProfile {
  id: string;
  name: string;
  highlighted: AttributeKey[];
}

type StoredConfig = {
  activeId: string;
  profiles: HighlightProfile[];
};

type HighlightContextValue = {
  state: StoredConfig;
  setState: Dispatch<SetStateAction<StoredConfig>>;
};

const STORAGE_KEY = "highlightProfiles";

const DEFAULT_PROFILE: HighlightProfile = {
  id: "default",
  name: "Default",
  highlighted: ["finishing", "offTheBall", "pace"],
};

const HighlightContext = createContext<HighlightContextValue | null>(null);

function loadFromStorage(): StoredConfig {
  if (typeof window === "undefined") {
    return { activeId: DEFAULT_PROFILE.id, profiles: [DEFAULT_PROFILE] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw)
      return { activeId: DEFAULT_PROFILE.id, profiles: [DEFAULT_PROFILE] };
    const parsed = JSON.parse(raw) as StoredConfig;
    if (!parsed.profiles?.length) {
      return { activeId: DEFAULT_PROFILE.id, profiles: [DEFAULT_PROFILE] };
    }
    return parsed;
  } catch {
    return { activeId: DEFAULT_PROFILE.id, profiles: [DEFAULT_PROFILE] };
  }
}

function saveToStorage(config: StoredConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function useHighlightContext(): HighlightContextValue {
  const ctx = useContext(HighlightContext);
  if (!ctx) {
    return {
      state: { activeId: DEFAULT_PROFILE.id, profiles: [DEFAULT_PROFILE] },
      setState: () => {},
    };
  }
  return ctx;
}

export function HighlightedAttributesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { capture } = useAnalytics();
  const [state, setState] = useState<StoredConfig>({
    activeId: DEFAULT_PROFILE.id,
    profiles: [DEFAULT_PROFILE],
  });

  /* eslint-disable react-hooks/set-state-in-effect -- post-SSR localStorage hydration */
  useEffect(() => {
    setState(loadFromStorage());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  // Debounced capture of highlight usage (count only)
  useEffect(() => {
    const active =
      state.profiles.find((p) => p.id === state.activeId) ??
      state.profiles[0] ??
      DEFAULT_PROFILE;

    const count = active.highlighted?.length ?? 0;

    const t = window.setTimeout(() => {
      capture("highlight_profile_updated", { highlighted_count: count });
    }, 800);

    return () => window.clearTimeout(t);
  }, [state.activeId, state.profiles, capture]);

  return (
    <HighlightContext.Provider value={{ state, setState }}>
      {children}
    </HighlightContext.Provider>
  );
}

export function useHighlightedAttributes(): AttributeKey[] {
  const { state } = useHighlightContext();
  const active =
    state.profiles.find((p) => p.id === state.activeId) ??
    state.profiles[0] ??
    DEFAULT_PROFILE;
  return active.highlighted;
}

const GOALKEEPING_KEYS: AttributeKey[] = [
  "aerialReach",
  "commandOfArea",
  "communication",
  "eccentricity",
  "handling",
  "kicking",
  "oneOnOnes",
  "punching",
  "reflexes",
  "rushingOutTendency",
  "throwing",
];

const TECHNICAL_KEYS: AttributeKey[] = [
  "corners",
  "crossing",
  "dribbling",
  "finishing",
  "firstTouch",
  "freeKickTaking",
  "penaltyTaking",
  "heading",
  "longShots",
  "longThrows",
  "marking",
  "passing",
  "tackling",
  "technique",
];

const MENTAL_KEYS: AttributeKey[] = [
  "aggression",
  "anticipation",
  "bravery",
  "composure",
  "concentration",
  "decisions",
  "determination",
  "flair",
  "leadership",
  "offTheBall",
  "positioning",
  "teamWork",
  "vision",
  "workRate",
];

const PHYSICAL_KEYS: AttributeKey[] = [
  "acceleration",
  "agility",
  "balance",
  "jumpingReach",
  "naturalFitness",
  "pace",
  "stamina",
  "strength",
];

function titleCaseFromCamel(key: string) {
  const withSpaces = key.replace(/([a-z])([A-Z])/g, "$1 $2");
  return withSpaces
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");
}

export function HighlightConfigModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state, setState } = useHighlightContext();
  const { activeId, profiles } = state;

  const active =
    profiles.find((p) => p.id === activeId) ?? profiles[0] ?? DEFAULT_PROFILE;

  const updateActive = (updater: (p: HighlightProfile) => HighlightProfile) => {
    setState((prev) => ({
      activeId: prev.activeId,
      profiles: prev.profiles.map((p) => (p.id === active.id ? updater(p) : p)),
    }));
  };

  const createNew = () => {
    const id = `profile-${Date.now()}`;
    const next: HighlightProfile = {
      id,
      name: "New Profile",
      highlighted: [],
    };
    setState((prev) => ({
      activeId: id,
      profiles: [...prev.profiles, next],
    }));
  };

  const duplicate = () => {
    const id = `profile-${Date.now()}`;
    const next: HighlightProfile = {
      ...active,
      id,
      name: `${active.name} Copy`,
      highlighted: [...active.highlighted],
    };
    setState((prev) => ({ activeId: id, profiles: [...prev.profiles, next] }));
  };

  const remove = () => {
    if (profiles.length <= 1) return;
    const remaining = profiles.filter((p) => p.id !== active.id);
    setState({ activeId: remaining[0].id, profiles: remaining });
  };

  const toggleKey = (key: AttributeKey) => {
    updateActive((p) => {
      const exists = p.highlighted.includes(key);
      const highlighted = exists
        ? p.highlighted.filter((k) => k !== key)
        : [...p.highlighted, key];
      return { ...p, highlighted };
    });
  };

  const renderGroup = (title: string, keys: AttributeKey[]) => {
    const sorted = [...keys].sort((a, b) => a.localeCompare(b));
    return (
      <div>
        <h3 className="mb-2 text-sm font-black uppercase tracking-wider text-[oklch(var(--text))/0.65]">
          {title}
        </h3>
        <div className="space-y-1">
          {sorted.map((k) => {
            const checked = active.highlighted.includes(k);
            return (
              <label
                key={k}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border-2 border-transparent px-2 py-1 hover:border-[oklch(var(--border))]/30 hover:bg-[oklch(var(--primary))]/5"
              >
                <span className="text-sm text-[oklch(var(--text))/0.85]">
                  {titleCaseFromCamel(k)}
                </span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[oklch(var(--primary))]"
                  checked={checked}
                  onChange={() => toggleKey(k)}
                />
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  const footer = useMemo(
    () => (
      <div className="text-xs text-[oklch(var(--text))/0.7]">
        Selected attributes appear as highlighted columns in the player list and
        comparison.
      </div>
    ),
    [],
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Highlighted Attributes"
      description="Choose which attributes show as highlighted columns, and save sets as profiles."
      size="xl"
      footer={footer}
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-2 py-1 text-sm font-bold shadow-[2px_2px_0_oklch(var(--border))]"
              value={active.id}
              onChange={(e) =>
                setState((prev) => ({ ...prev, activeId: e.target.value }))
              }
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Button color="alt" variant="solid" size="sm" onClick={createNew}>
              Create New
            </Button>
            <Button
              color="primary"
              variant="solid"
              size="sm"
              onClick={duplicate}
            >
              Duplicate
            </Button>
            <Button
              color="red"
              variant="solid"
              size="sm"
              onClick={remove}
              disabled={profiles.length <= 1}
            >
              Delete
            </Button>
          </div>

          <input
            type="text"
            className="w-full rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-3 py-2 text-sm font-bold shadow-[2px_2px_0_oklch(var(--border))] focus:outline-none focus:ring-3 focus:ring-[oklch(var(--primary))] sm:w-64"
            value={active.name}
            onChange={(e) =>
              updateActive((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="Profile name"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {renderGroup("Technical", TECHNICAL_KEYS)}
          {renderGroup("Mental", MENTAL_KEYS)}
          {renderGroup("Physical", PHYSICAL_KEYS)}
          {renderGroup("Goalkeeping", GOALKEEPING_KEYS)}
        </div>
      </div>
    </Modal>
  );
}
