"use client";

import type { GroupedAttributes } from "../../types/grouped-attributes";
import {
  getBandForValue,
  useActiveAttributeProfile,
} from "../../components/AttributeColorConfig";
import type { AttributeKey } from "../../types/weights";

interface Props {
  grouped: GroupedAttributes;
  isGoalkeeper?: boolean;
}

const LABEL_OVERRIDES: Partial<Record<AttributeKey, string>> = {
  rushingOutTendency: "Rushing Out (Tendency)",
  oneOnOnes: "One On Ones",
  commandOfArea: "Command Of Area",
  offTheBall: "Off The Ball",
  freeKickTaking: "Free Kick Taking",
  penaltyTaking: "Penalty Taking",
  naturalFitness: "Natural Fitness",
  aerialReach: "Aerial Reach",
  firstTouch: "First Touch",
  longThrows: "Long Throws",
  longShots: "Long Shots",
  jumpingReach: "Jumping Reach",
  teamWork: "Teamwork",
  workRate: "Work Rate",
  // FM-style labels
  punching: "Punching (Tendency)",
};

const GK_PANEL_KEYS: AttributeKey[] = [
  "aerialReach",
  "commandOfArea",
  "communication",
  "eccentricity",
  "firstTouch",
  "handling",
  "kicking",
  "oneOnOnes",
  "passing",
  "punching",
  "reflexes",
  "rushingOutTendency",
  "throwing",
];

const GK_TECHNICAL_KEYS: AttributeKey[] = [
  "freeKickTaking",
  "penaltyTaking",
  "technique",
];

function getValueByKey(grouped: GroupedAttributes, key: AttributeKey): number {
  return (
    (grouped.goalkeeping as any)[key] ??
    (grouped.technical as any)[key] ??
    (grouped.mental as any)[key] ??
    (grouped.physical as any)[key] ??
    0
  );
}

function prettyLabel(key: AttributeKey) {
  const override = LABEL_OVERRIDES[key];
  if (override) return override;
  const withSpaces = key.replace(/([a-z])([A-Z])/g, "$1 $2");
  return withSpaces
    .split(" ")
    .map((word) =>
      word.length > 0 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : "",
    )
    .join(" ");
}

export function PlayerAttributesClient({ grouped, isGoalkeeper }: Props) {
  const profile = useActiveAttributeProfile();

  const renderColumn = (
    title: string,
    attributes: Record<string, number>,
    compact?: boolean,
  ) => {
    const entries = Object.entries(attributes).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    return (
      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[oklch(var(--text))/0.7]">
          {title}
        </h2>
        <dl
          className={`grid ${
            compact ? "gap-y-0.5 text-xs" : "gap-y-1 text-sm"
          }`}
        >
          {entries.map(([key, value]) => {
            const withSpaces = key.replace(/([a-z])([A-Z])/g, "$1 $2");
            const pretty = withSpaces
              .split(" ")
              .map((word) =>
                word.length > 0
                  ? word[0].toUpperCase() + word.slice(1).toLowerCase()
                  : "",
              )
              .join(" ");
            const band = getBandForValue(value, profile.thresholds);
            const color = profile.colors[band];
            return (
              <div
                key={key}
                className="flex items-center justify-between gap-3"
              >
                <dt className="text-[oklch(var(--text))/0.9]">{pretty}</dt>
                <dd
                  className="min-w-[1.75rem] text-right font-mono text-base"
                  style={{ color }}
                >
                  {value}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    );
  };

  const renderKeyColumn = (
    title: string,
    keys: AttributeKey[],
    compact?: boolean,
  ) => {
    const sorted = [...keys].sort((a, b) => a.localeCompare(b));
    return (
      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[oklch(var(--text))/0.7]">
          {title}
        </h2>
        <dl className={`grid ${compact ? "gap-y-0.5 text-xs" : "gap-y-1 text-sm"}`}>
          {sorted.map((key) => {
            const value = getValueByKey(grouped, key);
            const band = getBandForValue(value, profile.thresholds);
            const color = profile.colors[band];
            return (
              <div key={key} className="flex items-center justify-between gap-3">
                <dt className="text-[oklch(var(--text))/0.9]">
                  {prettyLabel(key)}
                </dt>
                <dd
                  className="min-w-[1.75rem] text-right font-mono text-base"
                  style={{ color }}
                >
                  {value}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    );
  };

  return (
    <div className="space-y-3 rounded-2xl bg-[oklch(var(--text))]/10 px-4 py-4 shadow-sm">
      {isGoalkeeper ? (
        <div className="grid gap-4 md:grid-cols-3">
          {renderKeyColumn("Goalkeeping", GK_PANEL_KEYS)}
          {renderColumn("Mental", grouped.mental)}
          <div className="space-y-4">
            {renderColumn("Physical", grouped.physical)}
            {renderKeyColumn("Technical", GK_TECHNICAL_KEYS, true)}
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            {renderColumn("Technical", grouped.technical)}
            {renderColumn("Mental", grouped.mental)}
            {renderColumn("Physical", grouped.physical)}
          </div>
          <div className="mt-3">{renderColumn("Goalkeeping", grouped.goalkeeping, true)}</div>
        </>
      )}
    </div>
  );
}

