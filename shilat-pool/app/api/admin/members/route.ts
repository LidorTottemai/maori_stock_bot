import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? 1);
  const limit = 20;

  const where = q
    ? {
        OR: [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
          { email: { contains: q } },
          { israeliId: { contains: q } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.registration.findMany({
      where,
      include: { membershipType: true, familyMembers: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.registration.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit });
}
