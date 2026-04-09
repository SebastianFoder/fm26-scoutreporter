import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attribute mode",
  description:
    "Import Football Manager 26 player CSV exports, score players with weighted attributes, and compare them with configurable highlights.",
};

export default function AttributeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
