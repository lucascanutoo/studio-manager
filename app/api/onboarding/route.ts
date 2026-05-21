import { NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError, requireUser } from "@/lib/api";
import { currencyToCents } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const serviceSchema = z.object({
  name: z.string().min(2, "Informe o nome do servico."),
  price: z.union([z.string(), z.number()]).transform(currencyToCents),
  durationMinutes: z.coerce.number().int().min(10, "Duracao minima de 10 minutos.")
});

const onboardingSchema = z.object({
  step: z.coerce.number().int().min(1).max(4).optional(),
  studio: z.object({
    name: z.string().min(2).optional(),
    logoUrl: z.string().max(500_000).optional().nullable(),
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
    secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable()
  }).optional(),
  services: z.array(serviceSchema).optional(),
  complete: z.boolean().optional()
});

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const [studio, services] = await Promise.all([
    prisma.studio.findUnique({ where: { id: auth.user!.studioId } }),
    prisma.service.findMany({ where: { studioId: auth.user!.studioId }, orderBy: { createdAt: "asc" } })
  ]);

  return NextResponse.json({ studio, services });
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const data = onboardingSchema.parse(await request.json());

    const result = await prisma.$transaction(async (tx) => {
      if (data.services) {
        await tx.service.deleteMany({ where: { studioId: auth.user!.studioId } });
        if (data.services.length) {
          await tx.service.createMany({
            data: data.services.map((service) => ({
              studioId: auth.user!.studioId,
              name: service.name,
              priceCents: service.price,
              durationMinutes: service.durationMinutes,
              active: true
            }))
          });
        }
      }

      const studio = await tx.studio.update({
        where: { id: auth.user!.studioId },
        data: {
          ...data.studio,
          onboardingStep: data.complete ? 4 : data.step,
          onboardingCompleted: data.complete ? true : undefined
        }
      });

      const services = await tx.service.findMany({ where: { studioId: auth.user!.studioId }, orderBy: { createdAt: "asc" } });
      return { studio, services };
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
