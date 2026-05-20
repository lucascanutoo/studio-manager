import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireUser } from "@/lib/api";
import { serviceSchema } from "@/lib/schemas";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const services = await prisma.service.findMany({ where: { studioId: auth.user!.studioId }, orderBy: [{ active: "desc" }, { name: "asc" }] });
  return NextResponse.json({ services });
}

export async function POST(request: Request) {
  try {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const data = serviceSchema.parse(await request.json());
    const service = await prisma.service.create({
      data: { studioId: auth.user!.studioId, name: data.name, description: data.description, priceCents: data.price, durationMinutes: data.durationMinutes, active: data.active }
    });
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
