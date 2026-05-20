import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/schemas";
import { handleApiError, requireUser } from "@/lib/api";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const client = await prisma.client.findFirst({
    where: { id, studioId: auth.user!.studioId },
    include: {
      appointments: { orderBy: { startsAt: "desc" }, include: { service: true, attendance: true } },
      attendances: { orderBy: { attendedAt: "desc" }, include: { service: true, appointment: true } }
    }
  });
  if (!client) return NextResponse.json({ message: "Cliente nao encontrada." }, { status: 404 });
  return NextResponse.json({ client });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const { id } = await params;
    const data = clientSchema.parse(await request.json());
    const exists = await prisma.client.findFirst({ where: { id, studioId: auth.user!.studioId } });
    if (!exists) return NextResponse.json({ message: "Cliente nao encontrada." }, { status: 404 });
    const client = await prisma.client.update({ where: { id }, data });
    return NextResponse.json({ client });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const { id } = await params;
    const exists = await prisma.client.findFirst({ where: { id, studioId: auth.user!.studioId } });
    if (!exists) return NextResponse.json({ message: "Cliente nao encontrada." }, { status: 404 });
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
