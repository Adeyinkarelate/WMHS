import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { jsonError } from "@/lib/utils/helpers";

export async function GET() {
  const { error, user } = await requireUser(["PROVIDER", "ADMIN"]);
  if (error || !user) return error!;
  if (!user.providerId && user.role !== "ADMIN") return jsonError("Provider profile missing", 400);

  const patients = await prisma.patient.findMany({
    where:
      user.role === "ADMIN"
        ? {}
        : { assignments: { some: { providerId: user.providerId } } },
    include: {
      user: { select: { name: true, email: true } },
      riskAssessments: { orderBy: { assessedAt: "desc" }, take: 1 },
      alerts: { where: { status: "ACTIVE" } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return Response.json(patients);
}
