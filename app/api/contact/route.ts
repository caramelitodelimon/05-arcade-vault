// ===== app/api/contact/route.ts =====
// Endpoint de contacto de la pantalla About (spec 03-about-contacto-resend).
// Recibe el formulario de app/about/page.tsx y envía el correo real vía
// Resend hacia shaddeveloper@gmail.com. La API key vive en RESEND_API_KEY
// (.env.local, no versionado — ver .env.example).

import { NextResponse } from "next/server";
import { Resend } from "resend";

const RECIPIENT = "shaddeveloper@gmail.com";
const FROM = "Arcade Vault <onboarding@resend.dev>";
const SUBJECT = "Nuevo mensaje de contacto — Arcade Vault";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  msg?: unknown;
  website?: unknown; // honeypot
};

export async function POST(request: Request) {
  let payload: ContactPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido." }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const msg = typeof payload.msg === "string" ? payload.msg.trim() : "";
  const website = typeof payload.website === "string" ? payload.website.trim() : "";

  // Honeypot: los bots suelen rellenar todos los campos, incluido este,
  // que un humano nunca ve ni completa. Se descarta en silencio como éxito.
  if (website) {
    return NextResponse.json({ ok: true });
  }

  if (!name || !email || !msg) {
    return NextResponse.json({ ok: false, error: "Faltan campos requeridos." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "El email no tiene un formato válido." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[api/contact] RESEND_API_KEY no está configurada.");
    return NextResponse.json({ ok: false, error: "No se pudo enviar el mensaje." }, { status: 500 });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: RECIPIENT,
      replyTo: email,
      subject: SUBJECT,
      text: `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${msg}`,
    });

    if (error) {
      console.error("[api/contact] Resend devolvió error:", error);
      return NextResponse.json({ ok: false, error: "No se pudo enviar el mensaje." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/contact] Falló el envío:", err);
    return NextResponse.json({ ok: false, error: "No se pudo enviar el mensaje." }, { status: 500 });
  }
}
