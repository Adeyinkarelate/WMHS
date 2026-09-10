import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import type { Role } from "@/types";

export async function getAuthContext() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireUser(roles?: Role[]) {
  const user = await getAuthContext();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorised" }, { status: 401 }), user: null };
  }
  if (roles && !roles.includes(user.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null };
  }
  return { error: null, user };
}

export type AuthUser = NonNullable<Awaited<ReturnType<typeof getAuthContext>>>;

export async function assertPatientAccess(patientId: string, user: AuthUser) {
  if (user.role === "ADMIN") return true;
  if (user.role === "PATIENT") return user.patientId === patientId;
  if (user.role === "PROVIDER" && user.providerId) {
    const assignment = await prisma.patientAssignment.findUnique({
      where: {
        patientId_providerId: { patientId, providerId: user.providerId },
      },
    });
    return Boolean(assignment);
  }
  return false;
}

/** Assigned patients only. Missing providerId must not fall through to “all rows”. */
export function assignedPatientsWhere(user: { role: string; providerId?: string | null }) {
  if (user.role === "ADMIN") return {};
  if (user.providerId) return { assignments: { some: { providerId: user.providerId } } };
  return { id: "__none__" };
}

/** Alerts / referrals belonging to assigned patients. */
export function assignedCaseloadWhere(user: { role: string; providerId?: string | null }) {
  if (user.role === "ADMIN") return {};
  if (user.providerId) return { patient: { assignments: { some: { providerId: user.providerId } } } };
  return { id: "__none__" };
}
