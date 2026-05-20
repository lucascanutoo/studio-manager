import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { loginSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const data = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() }, include: { studio: true } });
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return NextResponse.json({ message: "Email ou senha invalidos." }, { status: 401 });
    }
    await createSession(user.id, user.studioId);
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studio: user.studio
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
