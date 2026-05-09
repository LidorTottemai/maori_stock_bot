import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const now = new Date();
  const windows = await prisma.earlyAccessWindow.findMany({
    where: { isActive: true, opensAt: { lte: now }, closesAt: { gte: now } },
  });
  return NextResponse.json(windows);
}
