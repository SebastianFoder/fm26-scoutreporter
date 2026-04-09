import { Suspense } from "react";
import PlayersPageClient from "../../(views)/players/PlayersPageClient";

export default function AttributePlayersPage() {
  return (
    <Suspense fallback={null}>
      <PlayersPageClient />
    </Suspense>
  );
}
