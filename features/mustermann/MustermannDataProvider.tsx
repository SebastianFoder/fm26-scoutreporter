"use client";

import { MustermannModeScope } from "./MustermannModeScope";

export function MustermannDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MustermannModeScope>{children}</MustermannModeScope>;
}
