import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function getPatientContext() {
  const session = await getSession();
  if (!session?.user?.patientId) redirect("/login");
  const patient = await prisma.patient.findUnique({
    where: { id: session.user.patientId },
    include: { user: true },
  });
  if (!patient) redirect("/login");
  return { session, patient };
}
