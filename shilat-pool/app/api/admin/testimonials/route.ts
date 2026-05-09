import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(testimonials);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, text, initials, color, sortOrder } = body;
  if (!name || !text || !initials) {
    return NextResponse.json({ error: "name, text, initials required" }, { status: 400 });
  }
  const t = await prisma.testimonial.create({
    data: {
      name,
      text,
      initials,
      color: color ?? "from-[#0C4A8B] to-[#1565C0]",
      sortOrder: sortOrder ?? 0,
    },
  });
  return NextResponse.json(t, { status: 201 });
}
