import { NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError, requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const studioSchema = z.object({
  name: z.string().min(2).optional(),
  logoUrl: z.string().max(500_000).optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
  theme: z.string().max(40).optional().nullable()
});

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const studio = await prisma.studio.findUnique({ where: { id: auth.user!.studioId } });
  return NextResponse.json({ studio });
}

export async function PUT(request: Request) {
  try {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const data = studioSchema.parse(await request.json());
    const studio = await prisma.studio.update({
      where: { id: auth.user!.studioId },
      data
    });
    return NextResponse.json({ studio });
  } catch (error) {
    return handleApiError(error);
  }
}
