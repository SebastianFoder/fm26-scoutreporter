import { getPlayers } from "../../data/players-store";
import PlayersListClient from "./PlayerListClient";

export default function PlayersPage() {
  const players = getPlayers();
  return <PlayersListClient players={players} />;
}
