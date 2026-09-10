import { getPatientContext } from "@/lib/auth/patientContext";
import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProfileForms } from "@/components/patient/ProfileForms";
import { fromJsonString } from "@/lib/utils/json";

export default async function ProfilePage() {
  const { patient } = await getPatientContext();
  return (
    <PageTransition>
      <PageHeader
        eyebrow="Your record"
        title="Profile"
        description="Keep your contact details and dates current."
      />
      <div className="mt-6">
        <ProfileForms
          patient={{
            id: patient.id,
            phone: patient.phone,
            address: patient.address,
            lmp: patient.lmp,
            parity: patient.parity,
            heightCm: patient.heightCm,
            weightKg: patient.weightKg,
            locationLat: patient.locationLat,
            locationLng: patient.locationLng,
            preExistingConditions: fromJsonString<string[]>(patient.preExistingConditions, []),
            notifyAlerts: patient.notifyAlerts,
            user: { name: patient.user.name, email: patient.user.email },
          }}
        />
      </div>
    </PageTransition>
  );
}
