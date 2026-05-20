import { addMinutes } from "date-fns";
import { NextResponse } from "next/server";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/schemas";
import { handleApiError, requireUser } from "@/lib/api";
import { getBrazilDayRange, getBrazilWeekRange, parseBrazilDateTime, todayInBrazil } from "@/lib/timezone";

async function hasConflict(studioId: string, startsAt: Date, endsAt: Date, ignoreId?: string) {
  const conflict = await prisma.appointment.findFirst({
    where: {
      studioId,
      id: ignoreId ? { not: ignoreId } : undefined,
      status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt }
    }
  });
  return Boolean(conflict);
}

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") ?? "day";
  const date = searchParams.get("date") ?? todayInBrazil();
  const { from, to } = view === "week" ? getBrazilWeekRange(date) : getBrazilDayRange(date);

  const appointments = await prisma.appointment.findMany({
    where: {
      studioId: auth.user!.studioId,
      startsAt: { gte: from, lte: to },
      status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] }
    },
    orderBy: { startsAt: "asc" },
    include: { client: true, service: true, attendance: true }
  });
  return NextResponse.json({ appointments });
}

export async function POST(request: Request) {
  try {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const data = appointmentSchema.parse(await request.json());
    if (data.status !== AppointmentStatus.SCHEDULED) {
      return NextResponse.json({ message: "Novo agendamento deve iniciar como Agendado." }, { status: 400 });
    }
    const [service, client] = await Promise.all([
      prisma.service.findFirst({ where: { id: data.serviceId, studioId: auth.user!.studioId } }),
      prisma.client.findFirst({ where: { id: data.clientId, studioId: auth.user!.studioId } })
    ]);
    if (!service) return NextResponse.json({ message: "Servico nao encontrado." }, { status: 404 });
    if (!client) return NextResponse.json({ message: "Cliente nao encontrada." }, { status: 404 });

    const startsAt = parseBrazilDateTime(data.startsAt);
    const endsAt = addMinutes(startsAt, service.durationMinutes);
    if (await hasConflict(auth.user!.studioId, startsAt, endsAt)) {
      return NextResponse.json({ message: "Ja existe um atendimento nesse horario." }, { status: 409 });
    }

    const appointment = await prisma.appointment.create({
      data: { studioId: auth.user!.studioId, clientId: data.clientId, serviceId: data.serviceId, startsAt, endsAt, status: AppointmentStatus.SCHEDULED, notes: data.notes },
      include: { client: true, service: true }
    });
    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
