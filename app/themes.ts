export type ThemeKey = "light" | "dark";

export interface ThemeConfig {
  name: string;
  primary: string; // oklch triplet "L C H"
  text: string;
  alt: string;
  background: string; // oklch triplet "L C H"
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
    // Cool neutral base + indigo primary
    background: "0.985 0.005 260",
    text: "0.22 0.02 260",
    // Secondary accent (emerald/teal) that pairs with indigo primary
    alt: "0.74 0.14 155",
    primary: "0.68 0.16 285",
    specials: {
      red: { bg: "0.62 0.21 25", text: "0.98 0.01 25" },
      gold: { bg: "0.82 0.16 90", text: "0.18 0.02 90" },
      silver: { bg: "0.84 0.02 260", text: "0.18 0.02 260" },
      bronze: { bg: "0.66 0.1 60", text: "0.98 0.01 60" },
    },
  },
  dark: {
    name: "Dark",
    // Deep cool base + brighter indigo primary
    background: "0.14 0.01 260",
    text: "0.9 0.01 260",
    // Secondary accent (emerald/teal), tuned for dark backgrounds
    alt: "0.62 0.14 155",
    primary: "0.62 0.16 285",
    specials: {
      red: { bg: "0.7 0.19 25", text: "0.12 0.01 25" },
      gold: { bg: "0.8 0.16 90", text: "0.14 0.01 90" },
      silver: { bg: "0.88 0.02 260", text: "0.14 0.01 260" },
      bronze: { bg: "0.7 0.1 60", text: "0.12 0.01 60" },
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

  root.style.setProperty("--red-bg", theme.specials.red.bg);
  root.style.setProperty("--red-text", theme.specials.red.text);
  root.style.setProperty("--gold-bg", theme.specials.gold.bg);
  root.style.setProperty("--gold-text", theme.specials.gold.text);
  root.style.setProperty("--silver-bg", theme.specials.silver.bg);
  root.style.setProperty("--silver-text", theme.specials.silver.text);
  root.style.setProperty("--bronze-bg", theme.specials.bronze.bg);
  root.style.setProperty("--bronze-text", theme.specials.bronze.text);
}
