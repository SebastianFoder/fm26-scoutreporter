import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to use",
  description:
    "Step-by-step guide to install the FM26 exporter plugin, import the scouting view, export players, and import the CSV into Scout Reporter.",
};

export default function HowToUseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

