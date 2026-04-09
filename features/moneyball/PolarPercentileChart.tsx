"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface Props {
  labels: string[];
  series: Array<{ name: string; values: number[] }>;
  /** SVG viewBox / display height in px */
  size?: number;
  hideLegend?: boolean;
  title?: string;
  /** Per-spoke raw stat values (same order as labels / first series); enables vertex hover */
  rawValues?: number[];
  /** Rendered inside the card after the chart (e.g. Details button) */
  footer?: ReactNode;
}

type TooltipState = { index: number; x: number; y: number };

function polygonPoints(values: number[], radius: number, cx: number, cy: number) {
  const n = Math.max(1, values.length);
  return values
    .map((v, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const r = (Math.max(0, Math.min(100, v)) / 100) * radius;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      return `${x},${y}`;
    })
    .join(" ");
}

function vertexCoords(values: number[], radius: number, cx: number, cy: number) {
  const n = Math.max(1, values.length);
  return values.map((v, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (Math.max(0, Math.min(100, v)) / 100) * radius;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });
}

function formatRaw(n: number) {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}

const TOOLTIP_EST_W = 220;
const TOOLTIP_EST_H = 96;
const TOOLTIP_OFFSET = 14;

function clampTooltipPosition(x: number, y: number) {
  if (typeof window === "undefined") return { x, y };
  const pad = 8;
  const maxL = window.innerWidth - TOOLTIP_EST_W - pad;
  const maxT = window.innerHeight - TOOLTIP_EST_H - pad;
  return {
    x: Math.min(Math.max(pad, x + TOOLTIP_OFFSET), maxL),
    y: Math.min(Math.max(pad, y + TOOLTIP_OFFSET), maxT),
  };
}

function PolarTooltip({
  label,
  raw,
  percentile,
  x,
  y,
}: {
  label: string;
  raw: number;
  percentile: number;
  x: number;
  y: number;
}) {
  const { x: left, y: top } = clampTooltipPosition(x, y);

  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[9999] min-w-[12rem] max-w-[16rem] rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-3 py-2.5 shadow-[4px_4px_0_oklch(var(--border))]"
      style={{ left, top }}
    >
      <p className="text-[10px] font-black uppercase tracking-wider text-[oklch(var(--text))]/65">
        Stat
      </p>
      <p className="text-sm font-bold leading-snug text-[oklch(var(--text))]">{label}</p>
      <div className="mt-2 flex gap-4 border-t-2 border-[oklch(var(--border))] pt-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-wider text-[oklch(var(--text))]/65">
            Raw
          </p>
          <p className="font-mono text-sm font-bold tabular-nums text-[oklch(var(--text))]">
            {formatRaw(raw)}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-wider text-[oklch(var(--text))]/65">
            Pctl
          </p>
          <p className="font-mono text-sm font-bold tabular-nums text-[oklch(var(--primary))]">
            {percentile}
          </p>
        </div>
      </div>
    </div>
  );
}

export function PolarPercentileChart({
  labels,
  series,
  size = 360,
  hideLegend = false,
  title,
  rawValues,
  footer,
}: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const c = size / 2;
  const radius = size * 0.36;
  const rings = [20, 40, 60, 80, 100];
  const first = series[0];
  const fontClass = size < 280 ? "text-[7px]" : "text-[9px]";

  const showVertexHover =
    Boolean(rawValues) &&
    rawValues!.length === labels.length &&
    first.values.length === labels.length &&
    labels.length >= 2;

  const coords = showVertexHover && first ? vertexCoords(first.values, radius, c, c) : [];

  if (labels.length === 0 || !first) {
    return (
      <div className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] p-3 shadow-[2px_2px_0_oklch(var(--border))]">
        {title ? (
          <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-[oklch(var(--text))]">
            {title}
          </h3>
        ) : null}
        <p className="text-xs text-[oklch(var(--text))]/70">No stats to chart.</p>
        {footer ? <div className="mt-3 flex flex-wrap justify-end gap-2">{footer}</div> : null}
      </div>
    );
  }

  if (labels.length < 2) {
    return (
      <div className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] p-3 shadow-[2px_2px_0_oklch(var(--border))]">
        {title ? (
          <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-[oklch(var(--text))]">
            {title}
          </h3>
        ) : null}
        <ul className="space-y-1.5 text-xs">
          {labels.map((label, i) => (
            <li key={`${label}-${i}`} className="flex justify-between gap-2 border-b-2 border-[oklch(var(--border))]/20 pb-1 last:border-0">
              <span className="font-bold">{label}</span>
              <span className="font-mono font-bold">{Math.round(first.values[i] ?? 0)}</span>
            </li>
          ))}
        </ul>
        {footer ? <div className="mt-3 flex flex-wrap justify-end gap-2">{footer}</div> : null}
      </div>
    );
  }

  const tooltipContent =
    tooltip &&
    rawValues &&
    typeof document !== "undefined" &&
    createPortal(
      <PolarTooltip
        label={labels[tooltip.index] ?? ""}
        raw={rawValues[tooltip.index] ?? 0}
        percentile={Math.round(first.values[tooltip.index] ?? 0)}
        x={tooltip.x}
        y={tooltip.y}
      />,
      document.body,
    );

  return (
    <div className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] p-3 shadow-[2px_2px_0_oklch(var(--border))]">
      {tooltipContent}
      {title ? (
        <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-[oklch(var(--text))]">
          {title}
        </h3>
      ) : null}
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full" style={{ height: size }}>
        {rings.map((r) => (
          <circle
            key={r}
            cx={c}
            cy={c}
            r={(r / 100) * radius}
            fill="none"
            stroke="oklch(var(--border) / 0.3)"
            strokeWidth="1"
          />
        ))}
        {labels.map((label, i) => {
          const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
          const x = c + Math.cos(angle) * (radius + 16);
          const y = c + Math.sin(angle) * (radius + 16);
          return (
            <text
              key={`${label}-${i}`}
              x={x}
              y={y}
              textAnchor="middle"
              className={`fill-[oklch(var(--text))] ${fontClass} font-bold`}
            >
              {label}
            </text>
          );
        })}
        {series.map((s, i) => (
          <polygon
            key={s.name}
            points={polygonPoints(s.values, radius, c, c)}
            fill={i % 2 === 0 ? "oklch(var(--primary) / 0.2)" : "oklch(var(--alt) / 0.2)"}
            stroke={i % 2 === 0 ? "oklch(var(--primary))" : "oklch(var(--alt))"}
            strokeWidth="2"
            pointerEvents="none"
          />
        ))}
        {showVertexHover &&
          rawValues &&
          coords.map((pt, i) => {
            const pct = Math.round(first.values[i] ?? 0);
            const raw = rawValues[i] ?? 0;
            const ariaLabel = `${labels[i]}, raw ${formatRaw(raw)}, percentile ${pct}`;
            return (
              <circle
                key={`hit-${labels[i]}-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={9}
                fill={tooltip?.index === i ? "oklch(var(--primary) / 0.35)" : "transparent"}
                stroke="oklch(var(--border))"
                strokeWidth="1"
                className="cursor-pointer"
                aria-label={ariaLabel}
                onMouseEnter={(e) => setTooltip({ index: i, x: e.clientX, y: e.clientY })}
                onMouseMove={(e) =>
                  setTooltip((t) => (t?.index === i ? { index: i, x: e.clientX, y: e.clientY } : t))
                }
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}
      </svg>
      {!hideLegend ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {series.map((s, i) => (
            <span
              key={s.name}
              className="rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))] px-2 py-1 text-xs font-bold"
            >
              {i + 1}. {s.name}
            </span>
          ))}
        </div>
      ) : null}
      {footer ? <div className="mt-3 flex flex-wrap justify-end gap-2">{footer}</div> : null}
    </div>
  );
}
