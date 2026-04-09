"use client";

import { useEffect, useSyncExternalStore } from "react";
import { applyTheme, DEFAULT_THEME_KEY, type ThemeKey } from "@/lib/themes";
import { Button } from "./Button";

const STORAGE_KEY = "theme";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);

  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);

  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  mql.addEventListener("change", callback);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
    mql.removeEventListener("change", callback);
  };
}

function getSnapshot(): ThemeKey {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;

  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

function getServerSnapshot(): ThemeKey {
  return DEFAULT_THEME_KEY;
}

function setThemeValue(key: ThemeKey) {
  window.localStorage.setItem(STORAGE_KEY, key);
  applyTheme(key);
  document.body.style.backgroundColor = `oklch(var(--background))`;
  listeners.forEach((l) => l());
}

export function ThemeSwitcher() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    applyTheme(theme);
    document.body.style.backgroundColor = `oklch(var(--background))`;
  }, [theme]);

  const toggle = () => {
    setThemeValue(theme === "light" ? "dark" : "light");
  };

  return (
    <Button color="alt" variant="outline" size="sm" onClick={toggle}>
      {theme === "light" ? "Dark mode" : "Light mode"}
    </Button>
  );
}
