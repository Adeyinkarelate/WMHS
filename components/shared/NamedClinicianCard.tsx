import { Card } from "@/components/ui/Card";
import { Icons } from "@/components/shared/Icons";

export function NamedClinicianCard({
  clinicianName,
  clinicianFacility,
  bookedFacility,
}: {
  clinicianName: string | null;
  clinicianFacility: string | null;
  bookedFacility: string | null;
}) {
  return (
    <Card className="bg-gradient-to-br from-white to-sage-light/40">
      <p className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-sage">
        Your clinician
      </p>
      {clinicianName ? (
        <>
          <h3 className="mt-2 font-heading text-h3 text-navy">{clinicianName}</h3>
          <p className="mt-1 text-sm text-ink-muted">
            {Array.from(new Set([clinicianFacility, bookedFacility].filter(Boolean))).join(" · ") ||
              "Named antenatal clinician"}
          </p>
        </>
      ) : (
        <>
          <h3 className="mt-2 flex items-center gap-2 font-heading text-h3 text-navy">
            <Icons.clock size={22} />
            Waiting
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            {bookedFacility
              ? `Booked at ${bookedFacility}. A clinician there will take you onto their caseload.`
              : "Choose an antenatal clinic on your profile so a clinician can find you."}
          </p>
        </>
      )}
    </Card>
  );
}
