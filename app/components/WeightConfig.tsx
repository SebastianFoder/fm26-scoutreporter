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
import type {
  AttributeKey,
  AttributeWeights,
  WeightProfile,
} from "../types/weights";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { useAnalytics } from "./AnalyticsConsent";

const STORAGE_KEY = "weightProfiles";

/** Upper bound for per-attribute weight inputs and stored values (wider ratio vs min 1). */
const WEIGHT_MAX = 20;

const DEFAULT_PROFILE: WeightProfile = {
  id: "default",
  name: "Default",
  weights: {},
};

type StoredConfig = {
  activeId: string;
  profiles: WeightProfile[];
};

type WeightContextValue = {
  state: StoredConfig;
  setState: Dispatch<SetStateAction<StoredConfig>>;
};

const WeightContext = createContext<WeightContextValue | null>(null);

function loadFromStorage(): StoredConfig {
  if (typeof window === "undefined") {
    return {
      activeId: DEFAULT_PROFILE.id,
      profiles: [withNormalizedWeights(DEFAULT_PROFILE)],
    };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw)
      return {
        activeId: DEFAULT_PROFILE.id,
        profiles: [withNormalizedWeights(DEFAULT_PROFILE)],
      };
    const parsed = JSON.parse(raw) as StoredConfig;
    if (!parsed.profiles?.length) {
      return {
        activeId: DEFAULT_PROFILE.id,
        profiles: [withNormalizedWeights(DEFAULT_PROFILE)],
      };
    }
    return {
      activeId: parsed.activeId ?? DEFAULT_PROFILE.id,
      profiles: parsed.profiles.map(withNormalizedWeights),
    };
  } catch {
    return {
      activeId: DEFAULT_PROFILE.id,
      profiles: [withNormalizedWeights(DEFAULT_PROFILE)],
    };
  }
}

function saveToStorage(config: StoredConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function useWeightContext(): WeightContextValue {
  const ctx = useContext(WeightContext);
  if (!ctx) {
    return {
      state: { activeId: DEFAULT_PROFILE.id, profiles: [DEFAULT_PROFILE] },
      setState: () => {},
    };
  }
  return ctx;
}

export function WeightProvider({ children }: { children: React.ReactNode }) {
  const { capture } = useAnalytics();
  const [state, setState] = useState<StoredConfig>({
    activeId: DEFAULT_PROFILE.id,
    profiles: [withNormalizedWeights(DEFAULT_PROFILE)],
  });

  /* eslint-disable react-hooks/set-state-in-effect -- post-SSR localStorage hydration */
  useEffect(() => {
    setState(loadFromStorage());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  // Debounced capture of aggregate weight usage (no attribute names/ids)
  useEffect(() => {
    const active =
      state.profiles.find((p) => p.id === state.activeId) ??
      state.profiles[0] ??
      withNormalizedWeights(DEFAULT_PROFILE);

    // Capture per-attribute weights for the active profile
    const weights = withNormalizedWeights(active).weights;
    const weightsByAttribute = Object.fromEntries(
      ALL_KEYS.map((k) => [k, weights[k] ?? 1]),
    );

    const t = window.setTimeout(() => {
      capture("weights_profile_updated", {
        profile_id: active.id,
        weights: weightsByAttribute,
      });
    }, 800);

    return () => window.clearTimeout(t);
  }, [state.activeId, state.profiles, capture]);

  return (
    <WeightContext.Provider value={{ state, setState }}>
      {children}
    </WeightContext.Provider>
  );
}

export function useActiveWeights(): AttributeWeights {
  const { state } = useWeightContext();
  const active =
    state.profiles.find((p) => p.id === state.activeId) ??
    state.profiles[0] ??
    withNormalizedWeights(DEFAULT_PROFILE);
  return active.weights;
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

const ALL_KEYS: AttributeKey[] = [
  ...TECHNICAL_KEYS,
  ...MENTAL_KEYS,
  ...PHYSICAL_KEYS,
  ...GOALKEEPING_KEYS,
];

function titleCaseFromCamel(key: string) {
  const withSpaces = key.replace(/([a-z])([A-Z])/g, "$1 $2");
  return withSpaces
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");
}

function safeNumber(v: string) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 1;
  const rounded = Math.round(n);
  return clampWeight(rounded);
}

export function WeightConfigModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state, setState } = useWeightContext();
  const { activeId, profiles } = state;

  const active =
    profiles.find((p) => p.id === activeId) ?? profiles[0] ?? DEFAULT_PROFILE;

  const [json, setJson] = useState("");

  useEffect(() => {
    if (!open) return;
    setJson("");
  }, [open]);

  const updateActive = (updater: (p: WeightProfile) => WeightProfile) => {
    setState((prev) => ({
      activeId: prev.activeId,
      profiles: prev.profiles.map((p) => (p.id === active.id ? updater(p) : p)),
    }));
  };

  const createNew = () => {
    const id = `profile-${Date.now()}`;
    const next: WeightProfile = {
      id,
      name: "New Profile",
      weights: defaultWeights(),
    };
    setState((prev) => ({
      activeId: id,
      profiles: [...prev.profiles, next],
    }));
  };

  const duplicate = () => {
    const id = `profile-${Date.now()}`;
    const next: WeightProfile = {
      ...active,
      id,
      name: `${active.name} Copy`,
      weights: { ...active.weights },
    };
    setState((prev) => ({ activeId: id, profiles: [...prev.profiles, next] }));
  };

  const remove = () => {
    if (profiles.length <= 1) return;
    const remaining = profiles.filter((p) => p.id !== active.id);
    setState({ activeId: remaining[0].id, profiles: remaining });
  };

  const exportProfile = () => {
    setJson(JSON.stringify(active, null, 2));
  };

  const importProfile = () => {
    try {
      const parsed = JSON.parse(json) as WeightProfile;
      if (!parsed?.id || !parsed?.name || !parsed?.weights) {
        throw new Error("invalid");
      }
      setState((prev) => {
        const exists = prev.profiles.some((p) => p.id === parsed.id);
        const nextProfiles = exists
          ? prev.profiles.map((p) => (p.id === parsed.id ? parsed : p))
          : [...prev.profiles, parsed];
        return { activeId: parsed.id, profiles: nextProfiles };
      });
    } catch {
      alert("Invalid profile JSON");
    }
  };

  const setWeight = (key: AttributeKey, value: number) => {
    updateActive((p) => ({
      ...p,
      weights: {
        ...p.weights,
        [key]: clampWeight(value),
      },
    }));
  };

  const renderGroup = (title: string, keys: AttributeKey[]) => {
    const sorted = [...keys].sort((a, b) => a.localeCompare(b));
    return (
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[oklch(var(--text))/0.7]">
          {title}
        </h3>
        <div className="space-y-1">
          {sorted.map((k) => (
            <div key={k} className="flex items-center justify-between gap-3">
              <div className="text-sm text-[oklch(var(--text))/0.9]">
                {titleCaseFromCamel(k)}
              </div>
              <input
                type="number"
                min={1}
                max={WEIGHT_MAX}
                step={1}
                className="w-20 rounded-xl border border-[oklch(var(--alt))/0.6] bg-[oklch(var(--alt))/0.8] px-2 py-1 text-right font-mono text-sm"
                value={pWeight(active.weights, k)}
                onChange={(e) => setWeight(k, safeNumber(e.target.value))}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const footer = useMemo(
    () => (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-[oklch(var(--text))/0.7]">
          Weights are applied to the score immediately.
        </div>
      </div>
    ),
    [],
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Attribute Weights"
      description="Adjust how each attribute contributes to the computed score. Higher weight means more impact."
      size="xl"
      footer={footer}
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-xl border border-[oklch(var(--alt))/0.6] bg-[oklch(var(--alt))/0.8] px-2 py-1 text-sm"
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
            <Button
              color="primary"
              variant="solid"
              size="sm"
              onClick={exportProfile}
            >
              Export
            </Button>
            <Button
              color="alt"
              variant="solid"
              size="sm"
              onClick={importProfile}
            >
              Import
            </Button>
          </div>

          <input
            type="text"
            className="w-full rounded-xl border border-[oklch(var(--alt))/0.6] bg-[oklch(var(--alt))/0.8] px-3 py-2 text-sm sm:w-64"
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

        <textarea
          className="h-32 w-full rounded-2xl border border-[oklch(var(--alt))/0.5] bg-[oklch(var(--alt))/0.6] p-3 font-mono text-xs"
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder="Exported profile JSON will appear here. Paste JSON here to import."
        />
      </div>
    </Modal>
  );
}

function pWeight(weights: AttributeWeights, key: AttributeKey) {
  const v = weights[key];
  return typeof v === "number" ? v : 1;
}

function clampWeight(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(WEIGHT_MAX, Math.max(1, Math.round(value)));
}

function defaultWeights(): AttributeWeights {
  return Object.fromEntries(ALL_KEYS.map((k) => [k, 1])) as AttributeWeights;
}

function withNormalizedWeights(profile: WeightProfile): WeightProfile {
  const weights = profile.weights ?? {};
  const normalized: AttributeWeights = {};

  for (const k of ALL_KEYS) {
    const raw = weights[k];
    normalized[k] = clampWeight(typeof raw === "number" ? raw : 1);
  }

  return { ...profile, weights: normalized };
}
