"use client";

// ===== components/mini-game-card.tsx =====
// Portado de MiniCard en references/templates/home-about/home.jsx. Usado
// solo por la sección "JUEGOS DISPONIBLES AHORA" de app/home/page.tsx;
// visualmente distinto de components/game-card.tsx (portada cuadrada, sin
// badges ni stats).

import { useRouter } from "next/navigation";
import type { Game } from "@/lib/data";

export function MiniGameCard({ game }: { game: Game }) {
  const router = useRouter();

  return (
    <div className="mini-card" onClick={() => router.push(`/juegos/${game.id}`)}>
      <div className="mini-cover">
        <div className={"cover-bg " + game.cover} />
      </div>
      <div className="mini-meta">
        <div className="mini-title">{game.title}</div>
        <div className="mini-cat">{game.cat}</div>
      </div>
    </div>
  );
}
