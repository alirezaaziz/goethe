import { NextResponse } from "next/server";
import { checkPassword, createSession, destroySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SECRET) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD und ADMIN_SECRET sind auf dem Server nicht gesetzt." },
      { status: 500 },
    );
  }

  let password = "";
  try {
    password = String(((await request.json()) as { password?: unknown }).password ?? "");
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
