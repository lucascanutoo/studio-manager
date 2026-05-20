import { AppointmentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { attendanceSchema } from "@/lib/schemas";
import { handleApiError, requireUser } from "@/lib/api";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const { id } = await params;
    const data = attendanceSchema.parse(await request.json());
    const appointment = await prisma.appointment.findFirst({ where: { id, studioId: auth.user!.studioId } });
    if (!appointment) return NextResponse.json({ message: "Agendamento nao encontrado." }, { status: 404 });

    const result = await prisma.$transaction(async (tx) => {
      const attendance = await tx.attendance.upsert({
        where: { appointmentId: id },
        update: { finalValueCents: data.finalValue, paymentMethod: data.paymentMethod, paymentStatus: data.paymentStatus, notes: data.notes },
        create: {
          appointmentId: id,
          studioId: appointment.studioId,
          clientId: appointment.clientId,
          serviceId: appointment.serviceId,
          finalValueCents: data.finalValue,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus,
          notes: data.notes,
          attendedAt: appointment.startsAt
        }
      });
      await tx.appointment.update({ where: { id }, data: { status: AppointmentStatus.COMPLETED } });
      return attendance;
    });

    return NextResponse.json({ attendance: result });
  } catch (error) {
    return handleApiError(error);
  }
}
