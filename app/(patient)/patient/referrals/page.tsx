import { getPatientContext } from "@/lib/auth/patientContext";
import { prisma } from "@/lib/db/prisma";
import { nearbyFacilities, referralMatchOptions } from "@/lib/ai/runAssessment";
import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { NearbyFacilities } from "@/components/patient/Referrals";
import { ReferralLetter } from "@/components/shared/ReferralLetter";
import { formatDateTime } from "@/lib/utils/formatters";
import { fromJsonString } from "@/lib/utils/json";
import type { RiskLevel, RiskRecommendation } from "@/types";

export default async function ReferralsPage() {
  const { patient } = await getPatientContext();
  const hasLocation = patient.locationLat != null && patient.locationLng != null;
  const latest = await prisma.riskAssessment.findFirst({
    where: { patientId: patient.id },
    orderBy: { assessedAt: "desc" },
  });
  const rec = fromJsonString<RiskRecommendation>(latest?.recommendations, {
    tests: [],
    actions: [],
    carePlan: "",
    urgency: "monitor",
  });
  const match = referralMatchOptions(latest?.riskLevel as RiskLevel | undefined, rec.urgency);
  const [referrals, nearby] = await Promise.all([
    prisma.referral.findMany({
      where: { patientId: patient.id },
      include: { facility: true },
      orderBy: { referredAt: "desc" },
    }),
    hasLocation
      ? nearbyFacilities(patient.locationLat!, patient.locationLng!, { limit: 8, ...match })
      : Promise.resolve([]),
  ]);
  const rankedNote = !hasLocation
    ? "Save your location on your profile so we can rank nearby facilities by distance."
    : match.emergencyFirst
      ? "Ranked for your current high-risk assessment: emergency-capable facilities first, then CEmONC services, then distance."
      : match.services.length
        ? "Ranked for your current risk: facilities with matching antenatal services, then distance."
        : "Nearby facilities use the Haversine formula from your saved location.";
  const latestReferral = referrals[0];
  const factors = fromJsonString<string[]>(latest?.riskFactors, []);

  return (
    <PageTransition>
      <PageHeader eyebrow="Facilities" title="Referrals" description={rankedNote} />
      <Card className="mt-6">
        <CardTitle className="text-xl">Your referrals</CardTitle>
        {referrals.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">None yet. Request one from a nearby facility below.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {referrals.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-semibold text-navy">{r.facility.name}</p>
                  <p className="text-ink-muted">
                    {r.reason} · {formatDateTime(r.referredAt)}
                  </p>
                  {r.transportNotes && <p className="text-caption">{r.transportNotes}</p>}
                </div>
                <StatusBadge value={r.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
      {latestReferral && (
        <div className="mt-8">
          <ReferralLetter
            data={{
              patientName: patient.user.name,
              phone: patient.phone,
              address: patient.address,
              lmp: patient.lmp,
              edd: patient.edd,
              riskLevel: latest?.riskLevel,
              riskScore: latest?.riskScore,
              factors,
              facilityName: latestReferral.facility.name,
              facilityAddress: latestReferral.facility.address,
              facilityPhone: latestReferral.facility.contactPhone,
              reason: latestReferral.reason,
              transportNotes: latestReferral.transportNotes,
              referredAt: latestReferral.referredAt,
            }}
          />
        </div>
      )}
      <h2 className="mt-10 font-heading text-h3 text-navy">Nearby facilities</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Map pins use your saved location. Red is emergency-capable; open Directions for turn-by-turn.
      </p>
      <div className="mt-4">
        <NearbyFacilities
          facilities={nearby.map((f) => ({
            ...f,
            servicesOffered: f.servicesOffered,
          }))}
          rankedForRisk={match.emergencyFirst || match.services.length > 0}
          origin={
            hasLocation ? { lat: patient.locationLat!, lng: patient.locationLng! } : null
          }
        />
      </div>
    </PageTransition>
  );
}
