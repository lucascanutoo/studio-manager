import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { registerSchema } from "@/lib/schemas";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: Request) {
  try {
    const data = registerSchema.parse(await request.json());
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return NextResponse.json({ message: "Este email ja esta cadastrado." }, { status: 409 });

    const baseSlug = slugify(data.studioName) || "studio";
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    const studio = await prisma.studio.create({
      data: {
        name: data.studioName,
        slug,
        primaryColor: "#9f5366",
        secondaryColor: "#f8dfe7",
        theme: "light"
      }
    });

    const user = await prisma.user.create({
      data: { name: data.name, email: data.email.toLowerCase(), passwordHash: await bcrypt.hash(data.password, 10), studioId: studio.id, role: "ADMIN" },
      select: { id: true, name: true, email: true, role: true, studio: true }
    });
    await createSession(user.id, studio.id);
    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
