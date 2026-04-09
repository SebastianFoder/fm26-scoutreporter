import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Players",
  description:
    "Browse imported players with weighted scoring and configurable highlighted attributes.",
};

export default function AttributePlayersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
