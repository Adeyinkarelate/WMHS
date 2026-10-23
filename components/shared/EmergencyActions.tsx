import { ButtonLink } from "@/components/ui/Button";
import { Icons } from "@/components/shared/Icons";
import {
  NATIONAL_EMERGENCY_NUMBER,
  emergencyLinks,
  type EmergencyContacts,
} from "@/lib/clinical/emergency";

export function EmergencyActions({
  contacts,
  tone = "full",
}: {
  contacts: EmergencyContacts;
  tone?: "full" | "compact";
}) {
  const links = emergencyLinks(contacts);
  const clinicLabel = contacts.facilityName
    ? `Call ${contacts.facilityName}`
    : "Call your clinic";

  return (
    <div
      className={
        tone === "full"
          ? "rounded-2xl border border-danger/30 bg-danger-soft/60 px-4 py-4"
          : "rounded-2xl border border-line bg-white px-4 py-3"
      }
      role="group"
      aria-label="Emergency actions"
    >
      {tone === "full" && (
        <p className="font-heading text-sm font-semibold text-danger-ink">
          If you have danger signs, do not wait in this app.
        </p>
      )}
      <p className={tone === "full" ? "mt-1 text-sm text-danger-ink/90" : "text-sm text-ink-muted"}>
        {contacts.clinicianName
          ? `Your named clinician is ${contacts.clinicianName}. WMHS is not an emergency line.`
          : "WMHS is not an emergency line. Go to a facility or call 112."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.facilityTel && (
          <ButtonLink href={links.facilityTel} size="sm" variant={tone === "full" ? "danger" : "secondary"}>
            <Icons.phone size={16} />
            {clinicLabel}
          </ButtonLink>
        )}
        {links.directions && (
          <ButtonLink href={links.directions} size="sm" variant="outline" external>
            <Icons.pin size={16} />
            Directions
          </ButtonLink>
        )}
        <ButtonLink href={links.nationalTel ?? `tel:${NATIONAL_EMERGENCY_NUMBER}`} size="sm" variant="outline">
          <Icons.phone size={16} />
          Call {NATIONAL_EMERGENCY_NUMBER}
        </ButtonLink>
        <ButtonLink href="/patient/referrals" size="sm" variant="ghost">
          Nearby facilities
        </ButtonLink>
      </div>
    </div>
  );
}
