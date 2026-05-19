import { addMinutes } from "date-fns";
import { NextResponse } from "next/server";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/schemas";
import { handleApiError, requireUser } from "@/lib/api";

async function hasConflict(startsAt: Date, endsAt: Date, ignoreId: string) {
  const conflict = await prisma.appointment.findFirst({
    where: {
      id: { not: ignoreId },
      status: { not: AppointmentStatus.CANCELED },
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
  const appointment = await prisma.appointment.findUnique({
    where: { id },
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
    const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
    if (!service) return NextResponse.json({ message: "Servico nao encontrado." }, { status: 404 });
    const startsAt = new Date(data.startsAt);
    const endsAt = addMinutes(startsAt, service.durationMinutes);
    if (await hasConflict(startsAt, endsAt, id)) {
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
    const appointment = await prisma.appointment.update({ where: { id }, data: { status: AppointmentStatus.CANCELED } });
    return NextResponse.json({ appointment });
  } catch (error) {
    return handleApiError(error);
  }
}
