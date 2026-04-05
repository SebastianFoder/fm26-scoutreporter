export type ThemeKey = "light" | "dark";

/** FM attribute value bands (1–20); text color on page surface */
export interface ThemeAttributeBands {
  excellent: string;
  good: string;
  average: string;
  low: string;
}

export interface ThemeConfig {
  name: string;
  primary: string; // oklch triplet "L C H"
  text: string;
  alt: string;
  background: string;
  surface: string;
  border: string;
  attributeBands: ThemeAttributeBands;
  specials: {
    red: { bg: string; text: string };
    gold: { bg: string; text: string };
    silver: { bg: string; text: string };
    bronze: { bg: string; text: string };
  };
}

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  light: {
    name: "Light",
    /* Warm paper base, stronger surface step, inky borders — poster-like contrast */
    background: "0.978 0.012 95",
    surface: "0.932 0.028 100",
    border: "0.20 0.048 270",
    text: "0.20 0.045 270",
    alt: "0.55 0.20 175",
    primary: "0.50 0.27 285",
    attributeBands: {
      excellent: "0.42 0.19 158",
      good: "0.48 0.17 72",
      average: "0.46 0.045 265",
      low: "0.36 0.035 265",
    },
    specials: {
      red: { bg: "0.56 0.28 26", text: "0.99 0.008 26" },
      gold: { bg: "0.78 0.18 88", text: "0.22 0.04 88" },
      silver: { bg: "0.80 0.04 270", text: "0.22 0.04 270" },
      bronze: { bg: "0.62 0.18 58", text: "0.99 0.01 58" },
    },
  },
  dark: {
    name: "Dark",
    /* Deep tinted void, lifted panels, bright rim — neon brutalism */
    background: "0.09 0.042 278",
    surface: "0.16 0.058 282",
    border: "0.90 0.038 285",
    text: "0.93 0.028 282",
    alt: "0.72 0.17 175",
    primary: "0.67 0.25 290",
    attributeBands: {
      excellent: "0.74 0.16 158",
      good: "0.84 0.14 88",
      average: "0.66 0.05 278",
      low: "0.52 0.04 278",
    },
    specials: {
      red: { bg: "0.58 0.26 26", text: "0.14 0.025 26" },
      gold: { bg: "0.78 0.17 88", text: "0.16 0.03 88" },
      silver: { bg: "0.82 0.04 275", text: "0.16 0.03 275" },
      bronze: { bg: "0.64 0.17 58", text: "0.14 0.025 58" },
    },
  },
};

export const DEFAULT_THEME_KEY: ThemeKey = "light";

export function applyTheme(key: ThemeKey) {
  if (typeof document === "undefined") return;
  const theme = THEMES[key];
  const root = document.documentElement;

  root.setAttribute("data-theme", key);

  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--text", theme.text);
  root.style.setProperty("--alt", theme.alt);
  root.style.setProperty("--background", theme.background);
  root.style.setProperty("--surface", theme.surface);
  root.style.setProperty("--border", theme.border);

  root.style.setProperty("--red-bg", theme.specials.red.bg);
  root.style.setProperty("--red-text", theme.specials.red.text);
  root.style.setProperty("--gold-bg", theme.specials.gold.bg);
  root.style.setProperty("--gold-text", theme.specials.gold.text);
  root.style.setProperty("--silver-bg", theme.specials.silver.bg);
  root.style.setProperty("--silver-text", theme.specials.silver.text);
  root.style.setProperty("--bronze-bg", theme.specials.bronze.bg);
  root.style.setProperty("--bronze-text", theme.specials.bronze.text);

  root.style.setProperty("--attr-excellent", theme.attributeBands.excellent);
  root.style.setProperty("--attr-good", theme.attributeBands.good);
  root.style.setProperty("--attr-average", theme.attributeBands.average);
  root.style.setProperty("--attr-low", theme.attributeBands.low);
}
