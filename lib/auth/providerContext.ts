import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { escalateStaleCriticalAlerts } from "@/lib/alerts/escalate";

export async function getProviderContext() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (session.user.role === "PATIENT") redirect("/patient/dashboard");
  try {
    await escalateStaleCriticalAlerts();
  } catch (err) {
    console.error("Alert escalation failed", err);
  }
  const provider = session.user.providerId
    ? await prisma.provider.findUnique({
        where: { id: session.user.providerId },
        include: { facility: true, user: true },
      })
    : null;
  return { session, provider };
}
