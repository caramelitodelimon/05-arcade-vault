// ===== app/biblioteca/page.tsx =====
// Redirect de compatibilidad: /biblioteca se renombró a /games en spec
// 02-home-landing. Se mantiene esta ruta para no romper bookmarks/links
// antiguos.

import { redirect } from "next/navigation";

export default function BibliotecaPage() {
  redirect("/games");
}
