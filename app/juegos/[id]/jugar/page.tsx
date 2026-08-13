// ===== app/juegos/[id]/jugar/page.tsx =====
// Server Component: valida el id y dispara notFound() antes de montar la
// simulación de partida (GamePlayer, client component).

import { notFound } from "next/navigation";
import { getGame } from "@/lib/data";
import { GamePlayer } from "@/components/game-player";

export default async function JugarPage({ params }: PageProps<"/juegos/[id]/jugar">) {
  const { id } = await params;
  const game = getGame(id);
  if (!game) notFound();

  return <GamePlayer game={game} />;
}
