"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

export type AttributeBand = "excellent" | "good" | "average" | "low";

export interface AttributeColorProfile {
  id: string;
  name: string;
  thresholds: {
    excellent: number;
    good: number;
    average: number;
  };
  colors: Record<AttributeBand, string>; // CSS colors (e.g. hex)
}

const STORAGE_KEY = "attributeColorProfiles";

const DEFAULT_PROFILE: AttributeColorProfile = {
  id: "default",
  name: "Default",
  thresholds: {
    excellent: 16,
    good: 11,
    average: 6,
  },
  colors: {
    excellent: "#34d399",
    good: "#fbbf24",
    average: "#9ca3af",
    low: "#4b5563",
  },
};

interface StoredConfig {
  activeId: string;
  profiles: AttributeColorProfile[];
}

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

export function getBandForValue(
  value: number,
  thresholds: AttributeColorProfile["thresholds"],
): AttributeBand {
  if (value >= thresholds.excellent) return "excellent";
  if (value >= thresholds.good) return "good";
  if (value >= thresholds.average) return "average";
  return "low";
}

export function useActiveAttributeProfile(): AttributeColorProfile {
  const ctx = useAttributeColorContext();
  const { activeId, profiles } = ctx.state;
  return (
    profiles.find((p) => p.id === activeId) ?? profiles[0] ?? DEFAULT_PROFILE
  );
}

type AttributeColorContextValue = {
  state: StoredConfig;
  setState: Dispatch<SetStateAction<StoredConfig>>;
};

const AttributeColorContext = createContext<AttributeColorContextValue | null>(
  null,
);

export function AttributeColorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<StoredConfig>({
    activeId: DEFAULT_PROFILE.id,
    profiles: [DEFAULT_PROFILE],
  });

  /* eslint-disable react-hooks/set-state-in-effect -- post-SSR localStorage hydration */
  useEffect(() => {
    const stored = loadFromStorage();
    setState(stored);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  return (
    <AttributeColorContext.Provider value={{ state, setState }}>
      {children}
    </AttributeColorContext.Provider>
  );
}

function useAttributeColorContext(): AttributeColorContextValue {
  const ctx = useContext(AttributeColorContext);
  if (!ctx) {
    return {
      state: { activeId: DEFAULT_PROFILE.id, profiles: [DEFAULT_PROFILE] },
      setState: () => {},
    };
  }
  return ctx;
}

export function AttributeColorConfig() {
  const [open, setOpen] = useState(false);
  const { state, setState } = useAttributeColorContext();
  const { activeId, profiles } = state;

  const active =
    profiles.find((p) => p.id === activeId) ?? profiles[0] ?? DEFAULT_PROFILE;

  const updateActive = (
    updater: (p: AttributeColorProfile) => AttributeColorProfile,
  ) => {
    setState((prev) => ({
      activeId: prev.activeId,
      profiles: prev.profiles.map((p) => (p.id === active.id ? updater(p) : p)),
    }));
  };

  const addProfile = () => {
    const id = `profile-${Date.now()}`;
    const next: AttributeColorProfile = {
      ...active,
      id,
      name: `${active.name} Copy`,
    };
    setState((prev) => ({
      activeId: id,
      profiles: [...prev.profiles, next],
    }));
  };

  const deleteProfile = () => {
    if (profiles.length <= 1) return;
    const remaining = profiles.filter((p) => p.id !== active.id);
    setState({
      activeId: remaining[0].id,
      profiles: remaining,
    });
  };

  return (
    <div>
      <Button
        color="alt"
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
      >
        Attribute Colors
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Attribute Colors"
        description="Configure thresholds and colors for attribute values (1–20). Saved per profile."
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="w-full rounded-xl border border-[oklch(var(--text))]/40 bg-[oklch(var(--text))]/10 px-2 py-2 text-sm sm:w-56"
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
              <Button
                color="primary"
                variant="solid"
                size="sm"
                onClick={addProfile}
              >
                Duplicate
              </Button>
              <Button
                color="red"
                variant="solid"
                size="sm"
                onClick={deleteProfile}
                disabled={profiles.length <= 1}
              >
                Delete
              </Button>
            </div>

            <input
              type="text"
              className="w-full rounded-xl border border-[oklch(var(--text))]/40 bg-[oklch(var(--text))]/10 px-3 py-2 text-sm sm:w-64"
              value={active.name}
              onChange={(e) =>
                updateActive((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="Profile name"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <span className="text-[10px] font-semibold uppercase text-[oklch(var(--text))]/70">
              Band
            </span>
            <span className="text-[10px] font-semibold uppercase text-[oklch(var(--text))]/70">
              Threshold
            </span>
            <span className="text-[10px] font-semibold uppercase text-[oklch(var(--text))]/70">
              Color
            </span>

            {(
              ["excellent", "good", "average"] as const satisfies ReadonlyArray<
                keyof typeof active.thresholds
              >
            ).map((band) => (
              <FragmentRow
                key={band}
                label={band}
                value={active.thresholds[band]}
                color={active.colors[band]}
                onThresholdChange={(val) =>
                  updateActive((p) => ({
                    ...p,
                    thresholds: { ...p.thresholds, [band]: val },
                  }))
                }
                onColorChange={(val) =>
                  updateActive((p) => ({
                    ...p,
                    colors: { ...p.colors, [band]: val },
                  }))
                }
              />
            ))}

            <FragmentRow
              label="low"
              value={0}
              color={active.colors.low}
              readOnlyThreshold
              onColorChange={(val) =>
                updateActive((p) => ({
                  ...p,
                  colors: { ...p.colors, low: val },
                }))
              }
            />
          </div>

          <p className="text-xs text-[oklch(var(--text))]/70">
            Colors are hex values like{" "}
            <code className="font-mono">#34d399</code>.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function FragmentRow(props: {
  label: string;
  value: number;
  color: string;
  readOnlyThreshold?: boolean;
  onThresholdChange?: (value: number) => void;
  onColorChange?: (value: string) => void;
}) {
  const {
    label,
    value,
    color,
    readOnlyThreshold,
    onThresholdChange,
    onColorChange,
  } = props;

  const pretty =
    label[0].toUpperCase() + label.slice(1).toLowerCase() + " Attribute";

  return (
    <>
      <span className="py-1 text-[11px]">{pretty}</span>
      <span className="py-1">
        {readOnlyThreshold ? (
          <span className="text-[11px] text-[oklch(var(--text))/0.7]">
            0–{value}
          </span>
        ) : (
          <input
            type="number"
            min={0}
            max={20}
            className="w-14 rounded-xl border border-[oklch(var(--text))]/40 bg-[oklch(var(--text))]/10 px-1 py-0.5 text-right text-[11px]"
            value={value}
            onChange={(e) => onThresholdChange?.(Number(e.target.value) || 0)}
          />
        )}
      </span>
      <span className="flex items-center gap-1 py-1">
        <input
          type="color"
          className="h-6 w-10 cursor-pointer rounded-xl border border-[oklch(var(--text))]/40 bg-transparent p-0"
          value={color}
          onChange={(e) => onColorChange?.(e.target.value)}
        />
        <input
          type="text"
          className="flex-1 rounded-xl border border-[oklch(var(--text))]/40 bg-[oklch(var(--text))]/10 px-1 py-0.5 text-[11px]"
          value={color}
          onChange={(e) => onColorChange?.(e.target.value)}
        />
      </span>
    </>
  );
}
