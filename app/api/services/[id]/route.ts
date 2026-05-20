import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireUser } from "@/lib/api";
import { serviceSchema } from "@/lib/schemas";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const { id } = await params;
    const data = serviceSchema.parse(await request.json());
    const exists = await prisma.service.findFirst({ where: { id, studioId: auth.user!.studioId } });
    if (!exists) return NextResponse.json({ message: "Servico nao encontrado." }, { status: 404 });
    const service = await prisma.service.update({
      where: { id },
      data: { name: data.name, description: data.description, priceCents: data.price, durationMinutes: data.durationMinutes, active: data.active }
    });
    return NextResponse.json({ service });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const { id } = await params;
    const exists = await prisma.service.findFirst({ where: { id, studioId: auth.user!.studioId } });
    if (!exists) return NextResponse.json({ message: "Servico nao encontrado." }, { status: 404 });
    const service = await prisma.service.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ service });
  } catch (error) {
    return handleApiError(error);
  }
}
