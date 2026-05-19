import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSessionUser } from "@/lib/auth";

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ message: "Sessao expirada. Faca login novamente." }, { status: 401 }) };
  }
  return { user, response: null };
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ message: "Confira os campos informados.", errors: error.flatten().fieldErrors }, { status: 400 });
  }

  console.error(error);
  return NextResponse.json({ message: "Nao foi possivel concluir a solicitacao." }, { status: 500 });
}
