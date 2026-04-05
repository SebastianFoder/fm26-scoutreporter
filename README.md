# FM26 Scout Reporter

A modern web app for importing **Football Manager 26** player CSV exports and turning them into a searchable, comparable scouting view with configurable:

- Attribute **weights** (profiles)
- Highlighted attributes (profiles)
- Attribute value bands / thresholds (profiles)
- Light/Dark themes
- Player comparison (gold/silver/bronze per attribute, relative to selected players)

## Features

- **CSV import** (semicolon-delimited FM export) from the homepage
- **Persisted import** (stored in `sessionStorage`, survives navigation)
- **Player list** with score + highlighted attributes
- **Player profile** view (with goalkeeper-specific layout when position includes `GK`)
- **Compare view** with:
  - Player selector (search + pagination)
  - Comparison table
  - Per-row medal ranking (gold/silver/bronze)
- **How to use** page with step-by-step exporter setup guide

## Getting started

Install dependencies and run the dev server:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Usage

- **Import CSV**: Homepage → “Choose CSV file”
- **Weights**: Homepage → “Weights” (modal)
  - Weights are **1–10 integers**
  - Profiles auto-save to `localStorage`
- **Highlights**: Homepage → “Highlights” (modal)
  - Toggle which attributes appear as highlighted columns
  - Profiles auto-save to `localStorage`
- **Attribute thresholds**: Header → “Attribute thresholds” (modal)
  - Configure numeric bands only; colours follow the light/dark theme
  - Profiles auto-save to `localStorage`
- **Compare**: Homepage → select players → “Compare selected players”

## File download (FM view)

The custom FM view is included at:

- `public/scouting-exporter.fmf`

Users can download it from the **How to use** page.

## Analytics (PostHog) with opt-in consent

This app supports **PostHog** analytics with a **first-launch opt-in modal**.

- If the user opts out, analytics are disabled for the client and the choice is saved in `localStorage`.
- The footer includes an “Analytics preferences” link to reopen the consent modal.

### Environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

If `NEXT_PUBLIC_POSTHOG_KEY` is not set, PostHog will not initialize even if the user opts in.

## Releases

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) to automate versioning and GitHub Releases. Releases are triggered automatically when commits land on `master`.

Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) format so semantic-release can determine the next version:

| Prefix | Version bump |
|--------|-------------|
| `fix:` | Patch (0.0.x) |
| `feat:` | Minor (0.x.0) |
| `feat!:` / `BREAKING CHANGE:` footer | Major (x.0.0) |

Other prefixes like `chore:`, `docs:`, `ci:` do not trigger a release.

## Tech stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- PostHog (`posthog-js`)

