import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const types = await prisma.membershipType.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(
    types.map((t) => ({ ...t, features: JSON.parse(t.features) }))
  );
}
