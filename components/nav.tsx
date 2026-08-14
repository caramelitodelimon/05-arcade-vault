"use client";

// ===== components/nav.tsx — nav persistente =====
// Portado de references/templates/nav.jsx (y del link "Inicio" agregado en
// references/templates/home-about/nav.jsx, spec 02-home-landing). El router
// hash del prototipo (route/navigate) se reemplaza por rutas reales de Next
// (Link, usePathname); el usuario de sesión sale de useSession() en vez de
// venir por props. El link "Acerca de" del prototipo no se porta: la
// pantalla About queda fuera de este spec.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/lib/session-context";

export function Nav() {
  const pathname = usePathname();
  const { user, logout } = useSession();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const isHome = pathname === "/home";
  const isGames = pathname === "/games" || pathname.startsWith("/juegos");
  const isSalon = pathname === "/salon";
  const isAuth = pathname === "/auth";

  return (
    <>
      <nav className="av-nav">
        <Link href="/home" className="logo" onClick={close}>
          <div className="logo-mark" />
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          <Link className={isHome ? "active" : ""} href="/home">
            Inicio
          </Link>
          <Link className={isGames ? "active" : ""} href="/games">
            Biblioteca
          </Link>
          <Link className={isSalon ? "active" : ""} href="/salon">
            Salón de la Fama
          </Link>
        </div>
        <div className="spacer" />
        <div className="coin-counter">
          <span className="coin" />
          <span>CRÉDITOS · 03</span>
        </div>
        {user ? (
          <button className="btn ghost auth-btn" onClick={logout}>
            {user.name} ▾
          </button>
        ) : (
          <Link className="btn auth-btn" href="/auth">
            Iniciar Sesión
          </Link>
        )}
        <button className="btn ghost hamburger" onClick={() => setOpen(true)} aria-label="Menú">
          ≡
        </button>
      </nav>

      <div className={"av-mobile-backdrop" + (open ? " open" : "")} onClick={close} />
      <aside className={"av-mobile-panel" + (open ? " open" : "")}>
        <div className="pixel neon-cyan" style={{ fontSize: 11, marginBottom: 16 }}>
          MENÚ
        </div>
        <Link className={isHome ? "active" : ""} href="/home" onClick={close}>
          Inicio
        </Link>
        <Link className={isGames ? "active" : ""} href="/games" onClick={close}>
          Biblioteca
        </Link>
        <Link className={isSalon ? "active" : ""} href="/salon" onClick={close}>
          Salón de la Fama
        </Link>
        <Link className={isAuth ? "active" : ""} href="/auth" onClick={close}>
          {user ? "Cuenta" : "Iniciar Sesión"}
        </Link>
        <div style={{ flex: 1 }} />
        <div className="pixel" style={{ fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.16em" }}>
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
