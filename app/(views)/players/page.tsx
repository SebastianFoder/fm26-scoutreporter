import { Suspense } from "react";
import PlayersPageClient from "./PlayersPageClient";

export default function PlayersPage() {
  return (
    <Suspense fallback={null}>
      <PlayersPageClient />
    </Suspense>
  );
}
