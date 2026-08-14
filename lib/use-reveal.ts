"use client";

// ===== lib/use-reveal.ts =====
// Portado de useReveal() en references/templates/home-about/home.jsx.
// Observa todos los elementos ".reveal" del documento y les agrega ".in"
// cuando entran al viewport, disparando la animación fade-up definida en
// app/globals.css. Reutilizable por futuras pantallas (p. ej. About).

import { useEffect } from "react";

export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
