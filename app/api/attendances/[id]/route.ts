import { PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { handleApiError, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { paymentUpdateSchema } from "@/lib/schemas";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const { id } = await params;
    const data = paymentUpdateSchema.parse(await request.json());

    const attendance = await prisma.attendance.findFirst({ where: { id, studioId: auth.user!.studioId } });
    if (!attendance) return NextResponse.json({ message: "Atendimento nao encontrado." }, { status: 404 });
    if (attendance.paymentStatus !== PaymentStatus.PENDING) {
      return NextResponse.json({ message: "Este pagamento ja esta marcado como pago." }, { status: 409 });
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        finalValueCents: data.finalValue,
        paymentMethod: data.paymentMethod,
        paymentStatus: PaymentStatus.PAID,
        notes: attendance.notes === "Pagamento pendente" ? null : attendance.notes
      },
      include: { client: true, service: true, appointment: true }
    });

    return NextResponse.json({ attendance: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
