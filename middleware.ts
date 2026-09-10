import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const patient = ["/patient"];
const provider = ["/provider"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPatient = patient.some((p) => pathname.startsWith(p));
  const isProvider = provider.some((p) => pathname.startsWith(p));
  if (!isPatient && !isProvider) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }
  if (isPatient && token.role !== "PATIENT" && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/provider/dashboard", req.url));
  }
  if (isProvider && token.role !== "PROVIDER" && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/patient/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/patient/:path*", "/provider/:path*"],
};
