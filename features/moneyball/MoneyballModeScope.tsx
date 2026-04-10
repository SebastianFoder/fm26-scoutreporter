"use client";

import { useEffect } from "react";
import { useMoneyball } from "./MoneyballDataProvider";

export function MoneyballModeScope({ children }: { children: React.ReactNode }) {
  const { setMustermannMode } = useMoneyball();

  useEffect(() => {
    setMustermannMode(false);
  }, [setMustermannMode]);

  return <>{children}</>;
}
