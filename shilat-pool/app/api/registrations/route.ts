import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { z } from "zod/v4";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  israeliId: z.string().regex(/^\d{9}$/),
  email: z.string().email(),
  phone: z.string().min(9),
  city: z.string().optional(),
  membershipTypeId: z.string().min(1),
  priceCharged: z.number().int().positive(),
  isEarlyAccess: z.boolean().default(false),
  earlyAccessWindowId: z.string().optional(),
  familyMembers: z
    .array(z.object({ firstName: z.string(), lastName: z.string(), relation: z.string() }))
    .default([]),
  mockTransactionId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 });
  }

  const d = parsed.data;

  const membershipType = await prisma.membershipType.findUnique({
    where: { id: d.membershipTypeId },
  });
  if (!membershipType) {
    return NextResponse.json({ error: "סוג מינוי לא נמצא" }, { status: 404 });
  }

  const registration = await prisma.registration.create({
    data: {
      firstName: d.firstName,
      lastName: d.lastName,
      israeliId: d.israeliId,
      email: d.email,
      phone: d.phone,
      city: d.city,
      membershipTypeId: d.membershipTypeId,
      priceCharged: d.priceCharged,
      isEarlyAccess: d.isEarlyAccess,
      earlyAccessWindowId: d.earlyAccessWindowId,
      paymentStatus: "COMPLETED",
      mockTransactionId: d.mockTransactionId,
      familyMembers: {
        create: d.familyMembers,
      },
    },
  });

  return NextResponse.json(
    { id: registration.id, confirmationNumber: registration.confirmationNumber },
    { status: 201 }
  );
}
