import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "beauty_session";

const protectedPaths = ["/dashboard", "/clientes", "/servicos", "/agenda", "/financeiro", "/onboarding"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret-change-me"));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/clientes/:path*", "/servicos/:path*", "/agenda/:path*", "/financeiro/:path*", "/onboarding/:path*"]
};
