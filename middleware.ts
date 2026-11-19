import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const patient = ["/patient"];
const provider = ["/provider"];
const admin = ["/admin"];

function isPublicApi(pathname: string) {
  if (pathname.startsWith("/api/auth")) return true;
  return pathname === "/api/facilities";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPatient = patient.some((p) => pathname.startsWith(p));
  const isProvider = provider.some((p) => pathname.startsWith(p));
  const isAdmin = admin.some((p) => pathname.startsWith(p));
  const isApi = pathname.startsWith("/api/");

  if (!isPatient && !isProvider && !isAdmin && !isApi) return NextResponse.next();
  if (isApi && isPublicApi(pathname)) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }
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
  // Mothers can never be administrators. Provider<->admin changes are applied from the live
  // database role in the admin layout and API guards, so a stale token cannot widen access.
  if (isAdmin && token.role === "PATIENT") {
    return NextResponse.redirect(new URL("/patient/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/patient/:path*", "/provider/:path*", "/admin/:path*", "/api/:path*"],
};
