import { NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const attendances = await prisma.attendance.findMany({
    where: status === "pending" ? { paymentStatus: PaymentStatus.PENDING } : undefined,
    orderBy: { attendedAt: "desc" },
    include: { client: true, service: true, appointment: true }
  });
  return NextResponse.json({ attendances });
}
