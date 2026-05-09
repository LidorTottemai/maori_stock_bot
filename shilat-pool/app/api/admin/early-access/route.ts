import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const windows = await prisma.earlyAccessWindow.findMany({ orderBy: { opensAt: "desc" } });
  return NextResponse.json(windows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.opensAt || !body?.closesAt) {
    return NextResponse.json({ error: "נתונים חסרים" }, { status: 400 });
  }
  const window = await prisma.earlyAccessWindow.create({
    data: {
      title: body.title,
      description: body.description,
      opensAt: new Date(body.opensAt),
      closesAt: new Date(body.closesAt),
      isActive: body.isActive ?? true,
    },
  });
  return NextResponse.json(window, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "ID חסר" }, { status: 400 });
  const { id, ...data } = body;
  const updated = await prisma.earlyAccessWindow.update({ where: { id }, data });
  return NextResponse.json(updated);
}
