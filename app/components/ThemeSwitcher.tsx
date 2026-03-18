"use client";

import { useEffect, useState } from "react";
import { applyTheme, DEFAULT_THEME_KEY, type ThemeKey } from "../themes";
import { Button } from "./Button";

function getInitialTheme(): ThemeKey {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored as ThemeKey;

  // fallback to system preference
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeKey>(DEFAULT_THEME_KEY);

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    applyTheme(theme);
    window.localStorage.setItem("theme", theme);
    document.body.style.backgroundColor = `oklch(var(--background))`;
  }, [theme]);

  const toggle = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    document.body.style.backgroundColor = `oklch(var(--background))`;
  };

  return (
    <Button color="alt" variant="outline" size="sm" onClick={toggle}>
      {theme === "light" ? "Dark mode" : "Light mode"}
    </Button>
  );
}
