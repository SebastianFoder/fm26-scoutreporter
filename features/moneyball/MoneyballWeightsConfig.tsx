"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { defaultGroupWeightsForRole } from "./default-weights";
import { useMoneyball } from "./MoneyballDataProvider";
import { getStatLabel } from "./stat-labels";
import { groupStatKeysForRoleDisplay } from "./ui-stat-grouping";

type StatFilterMode = "all" | "selected" | "unselected";
type SortMode = "az" | "selected-first";

export function MoneyballWeightsConfig({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { statKeys, uiRole, setUiRole, roleGroups, weightsProfile, setWeightsProfile } =
    useMoneyball();
  const groups = roleGroups[uiRole];
  const activeIds = new Set(weightsProfile.activeGroupIdsByRole[uiRole] ?? []);
  const [query, setQuery] = useState("");
  const [filterMode, setFilterMode] = useState<StatFilterMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("az");
  const [groupControlsExpanded, setGroupControlsExpanded] = useState(true);
  const [statOverridesExpanded, setStatOverridesExpanded] = useState(true);
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>({});

  const statTags = useMemo(() => {
    const tags: Record<string, string[]> = {};
    for (const key of statKeys) {
      tags[key] = groups.filter((g) => g.statKeys.includes(key)).map((g) => g.name);
    }
    return tags;
  }, [groups, statKeys]);

  const visibleStatKeys = useMemo(() => {
    const q = query.trim().toLowerCase();
    const keys = statKeys.filter((key) => {
      const label = getStatLabel(key).toLowerCase();
      const matchesQuery = q.length === 0 || key.toLowerCase().includes(q) || label.includes(q);
      if (!matchesQuery) return false;
      const selected = (weightsProfile.statWeights[key] ?? 0) !== 0;
      if (filterMode === "selected") return selected;
      if (filterMode === "unselected") return !selected;
      return true;
    });
    if (sortMode === "selected-first") {
      return keys.sort((a, b) => {
        const as = (weightsProfile.statWeights[a] ?? 0) !== 0 ? 0 : 1;
        const bs = (weightsProfile.statWeights[b] ?? 0) !== 0 ? 0 : 1;
        if (as !== bs) return as - bs;
        return getStatLabel(a).localeCompare(getStatLabel(b));
      });
    }
    return keys.sort((a, b) => getStatLabel(a).localeCompare(getStatLabel(b)));
  }, [filterMode, query, sortMode, statKeys, weightsProfile]);

  const nonDefaultStatWeightCount = statKeys.filter((k) => (weightsProfile.statWeights[k] ?? 0) !== 0).length;
  const activeGroupCount = groups.filter((g) => activeIds.has(g.id)).length;
  const groupedVisibleStatKeys = useMemo(
    () => groupStatKeysForRoleDisplay(uiRole, visibleStatKeys),
    [uiRole, visibleStatKeys],
  );

  return (
    <Modal open={open} onClose={onClose} title="Moneyball Weights" size="xl">
      <div className="space-y-4">
        <section className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] p-3 shadow-[2px_2px_0_oklch(var(--border))]">
          <h3 className="text-xs font-black uppercase tracking-wider">Role</h3>
          <p className="mt-1 text-xs text-[oklch(var(--text))]/70">
            Final stat influence is based on group weight and stat override.
          </p>
          <div role="tablist" aria-label="Weights role tabs" className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              role="tab"
              aria-selected={uiRole === "outfield"}
              aria-controls="weights-role-panel"
              id="weights-tab-outfield"
              type="button"
              color="primary"
              variant={uiRole === "outfield" ? "solid" : "outline"}
              size="sm"
              className="font-black uppercase tracking-wider"
              onClick={() => setUiRole("outfield")}
            >
              Outfield
            </Button>
            <Button
              role="tab"
              aria-selected={uiRole === "gk"}
              aria-controls="weights-role-panel"
              id="weights-tab-gk"
              type="button"
              color="primary"
              variant={uiRole === "gk" ? "solid" : "outline"}
              size="sm"
              className="font-black uppercase tracking-wider"
              onClick={() => setUiRole("gk")}
            >
              Goalkeeper
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono text-[oklch(var(--text))]/75">
            <span className="rounded border border-[oklch(var(--border))]/50 px-2 py-1">
              Active groups: {activeGroupCount}/{groups.length}
            </span>
            <span className="rounded border border-[oklch(var(--border))]/50 px-2 py-1">
              Stat overrides: {nonDefaultStatWeightCount}
            </span>
          </div>
        </section>

        <section
          role="tabpanel"
          id="weights-role-panel"
          aria-labelledby={uiRole === "outfield" ? "weights-tab-outfield" : "weights-tab-gk"}
          className="space-y-4"
        >
          <div className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] p-3 shadow-[2px_2px_0_oklch(var(--border))]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider">Group Controls</h3>
                <p className="mt-1 text-xs text-[oklch(var(--text))]/70">
                  Toggle groups used for scoring and tune each group influence.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  color="alt"
                  variant="outline"
                  size="sm"
                  aria-expanded={groupControlsExpanded}
                  aria-controls="weights-group-controls-body"
                  onClick={() => setGroupControlsExpanded((prev) => !prev)}
                >
                  {groupControlsExpanded ? "Collapse" : "Expand"}
                </Button>
                <Button
                  color="alt"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setWeightsProfile((prev) => ({
                      ...prev,
                      groupWeightsByRole: {
                        ...prev.groupWeightsByRole,
                        [uiRole]: defaultGroupWeightsForRole(uiRole, roleGroups[uiRole]),
                      },
                      activeGroupIdsByRole: {
                        ...prev.activeGroupIdsByRole,
                        [uiRole]: roleGroups[uiRole].map((g) => g.id),
                      },
                    }))
                  }
                >
                  Reset groups
                </Button>
              </div>
            </div>
            <div
              id="weights-group-controls-body"
              className={`mt-3 grid overflow-hidden transition-all duration-200 ease-out ${
                groupControlsExpanded ? "grid-cols-[1fr]" : "grid-cols-[0fr]"
              }`}
            >
              <div className="min-w-0 overflow-hidden">
                <div className="grid gap-2 sm:grid-cols-2">
                  {groups.map((group) => {
                    const checked = activeIds.has(group.id);
                    return (
                      <div
                        key={group.id}
                        className="rounded-lg border-2 border-[oklch(var(--border))]/40 bg-[oklch(var(--background))] px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <label className="inline-flex items-center gap-2 text-xs font-bold">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setWeightsProfile((prev) => {
                                  const next = new Set(prev.activeGroupIdsByRole[uiRole] ?? []);
                                  if (checked) next.delete(group.id);
                                  else next.add(group.id);
                                  return {
                                    ...prev,
                                    activeGroupIdsByRole: {
                                      ...prev.activeGroupIdsByRole,
                                      [uiRole]: [...next],
                                    },
                                  };
                                })
                              }
                            />
                            <span>{group.name}</span>
                          </label>
                          <input
                            aria-label={`Weight for ${group.name}`}
                            type="number"
                            min={0}
                            value={weightsProfile.groupWeightsByRole[uiRole]?.[group.id] ?? 1}
                            onChange={(e) =>
                              setWeightsProfile((prev) => ({
                                ...prev,
                                groupWeightsByRole: {
                                  ...prev.groupWeightsByRole,
                                  [uiRole]: {
                                    ...(prev.groupWeightsByRole[uiRole] ?? {}),
                                    [group.id]: Math.max(0, Math.round(Number(e.target.value) || 0)),
                                  },
                                },
                              }))
                            }
                            className="w-16 rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] px-1 py-1 text-right font-mono text-xs"
                          />
                        </div>
                        <p className="mt-1 text-xs text-[oklch(var(--text))]/65">
                          {group.statKeys.length} stat{group.statKeys.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] p-3 shadow-[2px_2px_0_oklch(var(--border))]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider">
                  Stat Overrides (Grouped)
                </h3>
                <p className="mt-1 text-xs text-[oklch(var(--text))]/70">
                  Fine-tune individual stat impact inside role-based sections.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  color="alt"
                  variant="outline"
                  size="sm"
                  aria-expanded={statOverridesExpanded}
                  aria-controls="weights-stat-overrides-body"
                  onClick={() => setStatOverridesExpanded((prev) => !prev)}
                >
                  {statOverridesExpanded ? "Collapse" : "Expand"}
                </Button>
                <Button
                  color="alt"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setWeightsProfile((prev) => ({
                      ...prev,
                      statWeights: Object.fromEntries(statKeys.map((k) => [k, 0])),
                    }))
                  }
                >
                  Reset all stats
                </Button>
                <Button
                  color="alt"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setWeightsProfile((prev) => ({
                      ...prev,
                      statWeights: {
                        ...prev.statWeights,
                        ...Object.fromEntries(visibleStatKeys.map((k) => [k, 0])),
                      },
                    }))
                  }
                >
                  Reset visible
                </Button>
              </div>
            </div>
            <div
              id="weights-stat-overrides-body"
              className={`mt-3 grid overflow-hidden transition-all duration-200 ease-out ${
                statOverridesExpanded ? "grid-cols-[1fr]" : "grid-cols-[0fr]"
              }`}
            >
              <div className="min-w-0 overflow-hidden">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search stat name/key"
                    className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-2 py-1 text-xs"
                  />
                  <select
                    value={filterMode}
                    onChange={(e) => setFilterMode(e.target.value as StatFilterMode)}
                    className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-2 py-1 text-xs"
                  >
                    <option value="all">All stats</option>
                    <option value="selected">Overridden only</option>
                    <option value="unselected">Default only</option>
                  </select>
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                    className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-2 py-1 text-xs"
                  >
                    <option value="az">Sort A-Z</option>
                    <option value="selected-first">Overridden first</option>
                  </select>
                  <span className="self-center text-xs font-mono text-[oklch(var(--text))]/70">
                    Showing {visibleStatKeys.length} of {statKeys.length}
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  {groupedVisibleStatKeys.map((section) => {
                    const overriddenCount = section.statKeys.filter(
                      (key) => (weightsProfile.statWeights[key] ?? 0) !== 0,
                    ).length;
                    const sectionExpanded = expandedSectionIds[section.id] ?? true;
                    const sectionBodyId = `weights-section-${section.id}`;
                    return (
                      <section
                        key={section.id}
                        className="rounded-lg border-2 border-[oklch(var(--border))]/40 bg-[oklch(var(--background))] p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-black uppercase tracking-wider">
                            {section.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-[oklch(var(--text))]/70">
                              {overriddenCount}/{section.statKeys.length} overridden
                            </span>
                            <Button
                              color="alt"
                              variant="outline"
                              size="sm"
                              aria-expanded={sectionExpanded}
                              aria-controls={sectionBodyId}
                              onClick={() =>
                                setExpandedSectionIds((prev) => ({
                                  ...prev,
                                  [section.id]: !sectionExpanded,
                                }))
                              }
                            >
                              {sectionExpanded ? "Collapse" : "Expand"}
                            </Button>
                          </div>
                        </div>
                        <div
                          id={sectionBodyId}
                          className={`mt-2 grid overflow-hidden transition-all duration-200 ease-out ${
                            sectionExpanded ? "grid-cols-[1fr]" : "grid-cols-[0fr]"
                          }`}
                        >
                          <div className="min-w-0 overflow-hidden">
                            <div className="grid gap-2 sm:grid-cols-2">
                              {section.statKeys.map((key) => (
                                <div
                                  key={key}
                                  className="rounded-lg border-2 border-[oklch(var(--border))]/40 bg-[oklch(var(--surface))] px-3 py-2"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="truncate text-xs font-bold">{getStatLabel(key)}</p>
                                      <p className="truncate font-mono text-[10px] text-[oklch(var(--text))]/65">
                                        {key}
                                      </p>
                                    </div>
                                    <input
                                      type="number"
                                      min={0}
                                      value={weightsProfile.statWeights[key] ?? 0}
                                      onChange={(e) =>
                                        setWeightsProfile((prev) => ({
                                          ...prev,
                                          statWeights: {
                                            ...prev.statWeights,
                                            [key]: Math.max(0, Math.round(Number(e.target.value) || 0)),
                                          },
                                        }))
                                      }
                                      className="w-16 rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] px-1 py-1 text-right font-mono text-xs"
                                    />
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {statTags[key].slice(0, 3).map((tag) => (
                                      <span
                                        key={`${key}-${tag}`}
                                        className="rounded border border-[oklch(var(--border))]/50 px-1.5 py-0.5 text-[10px] font-bold"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </section>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}

