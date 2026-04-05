---
name: design-standard
description: Neo-brutalist design system for FM26 Scout Reporter. Use when creating or styling UI components, adding new pages/views, updating layouts, or when the user asks about design tokens, colors, typography, spacing, or visual styling.
---

# Neo-Brutalist Design Standard

This project follows a **neo-brutalist** design system: bold borders, hard offset shadows, high-contrast saturated colors, blocky shapes, and intentional "raw" aesthetics -- adapted for a data-dense scouting tool.

## Tech Stack Context

- **Tailwind CSS v4** (configured via `app/globals.css`, no `tailwind.config.*`)
- **OKLCH color system** via CSS custom properties set at runtime by `app/themes.ts`
- **Next.js App Router** with `"use client"` for interactive components
- **Outfit** (400–900) + **Space Mono** fonts

## Design Tokens

All colors are OKLCH triplets (`L C H`) stored as CSS custom properties and applied via `oklch(var(--token))` in Tailwind arbitrary values.

### Semantic Tokens

| Token | Purpose |
|-------|---------|
| `--primary` | Primary accent (indigo, high chroma) |
| `--text` | Body text |
| `--alt` | Secondary accent (teal) |
| `--background` | Page background |
| `--surface` | Card/section background (slightly offset from `--background`) |
| `--border` | Borders and shadow color (high contrast against background) |

### Special Tokens

Medal and status colors: `--red-bg`, `--red-text`, `--gold-bg`, `--gold-text`, `--silver-bg`, `--silver-text`, `--bronze-bg`, `--bronze-text`.

### Using Tokens in Tailwind

```
bg-[oklch(var(--surface))]
text-[oklch(var(--text))]
border-[oklch(var(--border))]
shadow-[4px_4px_0_oklch(var(--border))]
```

Opacity modifiers: `text-[oklch(var(--text))]/75` or `text-[oklch(var(--text))/0.75]`.

## Borders

- **Minimum**: `border-2` (2px). Never use `border` (1px).
- **Emphasis**: `border-3` (3px) for major separators (header/footer borders, modal panels).
- **Color**: Always `border-[oklch(var(--border))]` unless using a semantic color for outlines.

## Shadows (hard, no blur)

| Size | Class | Use |
|------|-------|-----|
| sm | `shadow-[2px_2px_0_oklch(var(--border))]` | Buttons, tags, small inputs |
| md | `shadow-[4px_4px_0_oklch(var(--border))]` | Cards, sections, tables |
| lg | `shadow-[6px_6px_0_oklch(var(--border))]` | Modals, hero elements |

Never use Tailwind's built-in `shadow-sm`/`shadow-md`/`shadow-lg` (they have blur).

## Border Radius

- Default: `rounded-lg` (8px) for buttons, cards, inputs, tables.
- **Never** use `rounded-full` except for avatar badges.
- **Never** use `rounded-2xl` or larger -- keep shapes blocky.

## Typography

| Element | Classes |
|---------|---------|
| Page heading (h1) | `text-4xl font-black uppercase tracking-tight` |
| Section heading (h2) | `text-2xl font-black uppercase tracking-tight` |
| Card heading (h3) | `text-sm font-black uppercase tracking-wide` |
| Body text | `text-sm` (default weight) |
| Labels / table headers | `text-xs font-black uppercase tracking-wider` |
| Data values / scores | `font-mono font-bold` |
| Links | `font-bold text-[oklch(var(--primary))] underline decoration-2 underline-offset-2 hover:decoration-[oklch(var(--alt))]` |

Use **Space Mono** (`font-mono`) aggressively for: scores, attribute values, IDs, counts, pagination numbers.

## Component Patterns

### Card

```
rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] shadow-[4px_4px_0_oklch(var(--border))]
```

With padding: `px-6 py-5` (generous).

### Button (solid variant)

```
rounded-lg border-2 border-[oklch(var(--border))] font-bold
shadow-[2px_2px_0_oklch(var(--border))]
hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_oklch(var(--border))]
active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
transition-all
```

Use the `Button` component from `app/components/Button.tsx`. It handles color, variant (solid/outline/ghost), and size (sm/md/lg).

### Input / Select

```
rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--background))]
shadow-[2px_2px_0_oklch(var(--border))]
focus:outline-none focus:ring-3 focus:ring-[oklch(var(--primary))]
```

### Modal

Use the `Modal` component from `app/components/Modal.tsx`. It applies:
- `border-3` panel border
- `shadow-[6px_6px_0]` hard shadow
- Solid overlay (no backdrop blur)
- `rounded-lg` shape
- `font-black uppercase` title

### Table

```
overflow-x-auto rounded-lg border-2 border-[oklch(var(--border))] bg-[oklch(var(--surface))] shadow-[4px_4px_0_oklch(var(--border))]
```

- Headers: `bg-[oklch(var(--border))]/10`, `border-b-2`, uppercase labels
- Rows: `border-b-2 border-[oklch(var(--border))]/30`
- Data cells: `font-mono` for numbers

## Interactions

| State | Effect |
|-------|--------|
| Hover (buttons) | `translate-x-[1px] translate-y-[1px]` + shadow shrinks to 1px |
| Active (buttons) | `translate-x-[2px] translate-y-[2px]` + `shadow-none` |
| Hover (links) | Underline color changes to `--alt` |
| Hover (nav links) | Border appears (`border-[oklch(var(--border))]`) |
| Focus | `ring-3 ring-[oklch(var(--primary))]` (thick, no blur) |

## Layout

- Max content width: `max-w-6xl` (or `max-w-5xl` for narrower views)
- Section padding: `px-6 py-5` minimum
- Gap between sections: `gap-6` or `gap-8`
- Header: `border-b-3` thick bottom border, `bg-[oklch(var(--surface))]`
- Footer: `border-t-3` thick top border, `bg-[oklch(var(--surface))]`
- Visible structure: use borders between sections, not just whitespace

## Theme System

Themes live in `app/themes.ts`. Each `ThemeConfig` has: `primary`, `text`, `alt`, `background`, `surface`, `border`, `attributeBands` (FM attribute value text colours), and `specials` (medal colours). `applyTheme()` sets CSS vars on `:root`.

When adding new tokens, update both:
1. `:root` defaults in `app/globals.css`
2. `ThemeConfig` interface + both theme objects + `applyTheme()` in `app/themes.ts`

FM attribute value colours use `--attr-excellent`, `--attr-good`, `--attr-average`, `--attr-low` (set per theme). Users only edit thresholds in `AttributeColorConfig`; do not store per-user colours.

## Anti-Patterns (never do these)

- `shadow-sm`, `shadow-md`, `shadow-lg` (blurred shadows)
- `rounded-full` on cards/buttons/inputs
- `rounded-2xl` or larger
- `border` without a width (`border-2` minimum)
- `backdrop-blur-*` on overlays
- `font-light` or `font-thin` (too delicate for neo-brutalism)
- Subtle hover states with only opacity changes (use borders or translate)
- Gradients for backgrounds (solid colors only, except rare hero accents)
