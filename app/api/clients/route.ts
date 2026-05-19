import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/schemas";
import { handleApiError, requireUser } from "@/lib/api";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const clients = await prisma.client.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] } : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { appointments: true, attendances: true } } }
  });
  return NextResponse.json({ clients });
}

export async function POST(request: Request) {
  try {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const data = clientSchema.parse(await request.json());
    const client = await prisma.client.create({ data });
    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
