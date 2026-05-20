import { addMinutes } from "date-fns";
import { NextResponse } from "next/server";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/schemas";
import { handleApiError, requireUser } from "@/lib/api";
import { parseBrazilDateTime } from "@/lib/timezone";

async function hasConflict(studioId: string, startsAt: Date, endsAt: Date, ignoreId: string) {
  const conflict = await prisma.appointment.findFirst({
    where: {
      studioId,
      id: { not: ignoreId },
      status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt }
    }
  });
  return Boolean(conflict);
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { id } = await params;
  const appointment = await prisma.appointment.findFirst({
    where: { id, studioId: auth.user!.studioId },
    include: { client: true, service: true, attendance: true }
  });
  if (!appointment) return NextResponse.json({ message: "Agendamento nao encontrado." }, { status: 404 });
  return NextResponse.json({ appointment });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const { id } = await params;
    const data = appointmentSchema.parse(await request.json());
    const editableStatuses: AppointmentStatus[] = [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED];
    if (!editableStatuses.includes(data.status)) {
      return NextResponse.json({ message: "Use as acoes da agenda para concluir ou cancelar atendimentos." }, { status: 400 });
    }
    const [appointmentExists, service, client] = await Promise.all([
      prisma.appointment.findFirst({ where: { id, studioId: auth.user!.studioId } }),
      prisma.service.findFirst({ where: { id: data.serviceId, studioId: auth.user!.studioId } }),
      prisma.client.findFirst({ where: { id: data.clientId, studioId: auth.user!.studioId } })
    ]);
    if (!appointmentExists) return NextResponse.json({ message: "Agendamento nao encontrado." }, { status: 404 });
    if (!service) return NextResponse.json({ message: "Servico nao encontrado." }, { status: 404 });
    if (!client) return NextResponse.json({ message: "Cliente nao encontrada." }, { status: 404 });
    const startsAt = parseBrazilDateTime(data.startsAt);
    const endsAt = addMinutes(startsAt, service.durationMinutes);
    if (await hasConflict(auth.user!.studioId, startsAt, endsAt, id)) {
      return NextResponse.json({ message: "Ja existe um atendimento nesse horario." }, { status: 409 });
    }
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { clientId: data.clientId, serviceId: data.serviceId, startsAt, endsAt, status: data.status, notes: data.notes },
      include: { client: true, service: true, attendance: true }
    });
    return NextResponse.json({ appointment });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const { id } = await params;
    const exists = await prisma.appointment.findFirst({ where: { id, studioId: auth.user!.studioId } });
    if (!exists) return NextResponse.json({ message: "Agendamento nao encontrado." }, { status: 404 });
    const appointment = await prisma.appointment.update({ where: { id }, data: { status: AppointmentStatus.CANCELED } });
    return NextResponse.json({ appointment });
  } catch (error) {
    return handleApiError(error);
  }
}
