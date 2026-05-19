import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const attendances = await prisma.attendance.findMany({
    orderBy: { attendedAt: "desc" },
    include: { client: true, service: true, appointment: true }
  });
  return NextResponse.json({ attendances });
}
