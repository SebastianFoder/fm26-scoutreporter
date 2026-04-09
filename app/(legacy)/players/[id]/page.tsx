import { redirect } from "next/navigation";

export default function PlayerLegacyPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  redirect(`/attribute/players/${encodeURIComponent(id)}`);
}
