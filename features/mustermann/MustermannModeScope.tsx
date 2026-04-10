"use client";

import { useEffect } from "react";
import { useMoneyball } from "@/features/moneyball/MoneyballDataProvider";

export function MustermannModeScope({ children }: { children: React.ReactNode }) {
  const { setMustermannMode } = useMoneyball();

  useEffect(() => {
    setMustermannMode(true);
  }, [setMustermannMode]);

  return <>{children}</>;
}
