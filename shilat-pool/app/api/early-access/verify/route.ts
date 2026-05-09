import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { hmacIsraeliId } from "../../../../lib/hmac";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.israeliId || !/^\d{9}$/.test(body.israeliId)) {
    return NextResponse.json({ error: "תעודת זהות לא תקינה" }, { status: 400 });
  }

  const hashed = hmacIsraeliId(body.israeliId);
  const pastMember = await prisma.pastMember.findUnique({
    where: { israeliIdHmac: hashed },
  });

  if (!pastMember) {
    return NextResponse.json({ eligible: false });
  }

  const now = new Date();
  const window = await prisma.earlyAccessWindow.findFirst({
    where: { isActive: true, opensAt: { lte: now }, closesAt: { gte: now } },
    orderBy: { opensAt: "asc" },
  });

  return NextResponse.json({ eligible: true, windowId: window?.id ?? null });
}
