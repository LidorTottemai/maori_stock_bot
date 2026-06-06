import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const [totalRegs, earlyAccessRegs, totalRevenue, membershipBreakdown] = await Promise.all([
    prisma.registration.count({ where: { status: "ACTIVE" } }),
    prisma.registration.count({ where: { isEarlyAccess: true, status: "ACTIVE" } }),
    prisma.registration.aggregate({ _sum: { priceCharged: true }, where: { paymentStatus: "COMPLETED" } }),
    prisma.registration.groupBy({
      by: ["membershipTypeId"],
      _count: true,
      where: { status: "ACTIVE" },
    }),
  ]);

  return NextResponse.json({
    totalRegistrations: totalRegs,
    earlyAccessRegistrations: earlyAccessRegs,
    totalRevenue: totalRevenue._sum.priceCharged ?? 0,
    membershipBreakdown,
  });
}
