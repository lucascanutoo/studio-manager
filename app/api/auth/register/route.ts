import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { registerSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const data = registerSchema.parse(await request.json());
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return NextResponse.json({ message: "Este email ja esta cadastrado." }, { status: 409 });

    const user = await prisma.user.create({
      data: { name: data.name, email: data.email.toLowerCase(), passwordHash: await bcrypt.hash(data.password, 10) },
      select: { id: true, name: true, email: true }
    });
    await createSession(user.id);
    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
