import { addMinutes, endOfDay, endOfWeek, startOfDay, startOfWeek } from "date-fns";
import { NextResponse } from "next/server";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/schemas";
import { handleApiError, requireUser } from "@/lib/api";

async function hasConflict(startsAt: Date, endsAt: Date, ignoreId?: string) {
  const conflict = await prisma.appointment.findFirst({
    where: {
      id: ignoreId ? { not: ignoreId } : undefined,
      status: { not: AppointmentStatus.CANCELED },
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
  const base = searchParams.get("date") ? new Date(searchParams.get("date") as string) : new Date();
  const from = view === "week" ? startOfWeek(base, { weekStartsOn: 1 }) : startOfDay(base);
  const to = view === "week" ? endOfWeek(base, { weekStartsOn: 1 }) : endOfDay(base);

  const appointments = await prisma.appointment.findMany({
    where: { startsAt: { gte: from, lte: to } },
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
    const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
    if (!service) return NextResponse.json({ message: "Servico nao encontrado." }, { status: 404 });

    const startsAt = new Date(data.startsAt);
    const endsAt = addMinutes(startsAt, service.durationMinutes);
    if (await hasConflict(startsAt, endsAt)) {
      return NextResponse.json({ message: "Ja existe um atendimento nesse horario." }, { status: 409 });
    }

    const appointment = await prisma.appointment.create({
      data: { clientId: data.clientId, serviceId: data.serviceId, startsAt, endsAt, status: data.status, notes: data.notes },
      include: { client: true, service: true }
    });
    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
