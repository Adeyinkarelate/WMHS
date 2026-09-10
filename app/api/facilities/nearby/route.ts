import { requireUser } from "@/lib/auth/guards";
import { jsonError } from "@/lib/utils/helpers";
import { nearbyFacilities, referralMatchOptions } from "@/lib/ai/runAssessment";
import { prisma } from "@/lib/db/prisma";
import type { RiskLevel } from "@/types";

export async function GET(req: Request) {
  const { error, user } = await requireUser();
  if (error || !user) return error!;
  const url = new URL(req.url);
  let lat = Number(url.searchParams.get("lat"));
  let lng = Number(url.searchParams.get("lng"));
  const emergency = url.searchParams.get("emergency") === "true";
  const risk = url.searchParams.get("risk") as RiskLevel | null;

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    if (user.patientId) {
      const patient = await prisma.patient.findUnique({ where: { id: user.patientId } });
      if (patient?.locationLat == null || patient?.locationLng == null) {
        return Response.json([]);
      }
      lat = patient.locationLat;
      lng = patient.locationLng;
    } else {
      return Response.json([]);
    }
  }

  const match = referralMatchOptions(risk ?? undefined, emergency ? "emergency" : undefined);
  let list = await nearbyFacilities(lat, lng, { limit: 12, ...match, emergencyFirst: emergency || match.emergencyFirst });
  if (emergency) list = list.filter((f) => f.emergencyAvailable);
  return Response.json(list);
}
