import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { hmacIsraeliId } from "../../../../../lib/hmac";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body?.ids)) {
    return NextResponse.json({ error: "שדה ids (מערך) נדרש" }, { status: 400 });
  }

  const ids: string[] = body.ids.filter((id: unknown) => typeof id === "string" && /^\d{9}$/.test(id));
  if (!ids.length) {
    return NextResponse.json({ error: "לא נמצאו ת.ז. תקינות" }, { status: 400 });
  }

  let created = 0;
  for (const id of ids) {
    const hmac = hmacIsraeliId(id);
    await prisma.pastMember.upsert({
      where: { israeliIdHmac: hmac },
      update: {},
      create: { israeliIdHmac: hmac },
    });
    created++;
  }

  return NextResponse.json({ imported: created });
}
