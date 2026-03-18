import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare",
  description:
    "Compare selected players across highlighted attributes. Medals are assigned per attribute relative to the selected players.",
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}

