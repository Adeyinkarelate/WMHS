import { getPatientContext } from "@/lib/auth/patientContext";
import { prisma } from "@/lib/db/prisma";
import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProfileForms } from "@/components/patient/ProfileForms";
import { NamedClinicianCard } from "@/components/shared/NamedClinicianCard";
import { fromJsonString } from "@/lib/utils/json";

export default async function ProfilePage() {
  const { patient } = await getPatientContext();
  const facilities = await prisma.facility.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, address: true },
  });
  const named = patient.assignments.find((row) => row.role === "PRIMARY") ?? patient.assignments[0];
  return (
    <PageTransition>
      <PageHeader
        eyebrow="Your record"
        title="Profile"
        description="Keep your contact details, clinic and dates current."
      />
      <div className="mt-6 space-y-6">
        <NamedClinicianCard
          clinicianName={named?.provider.user.name ?? null}
          clinicianFacility={named?.provider.facility?.name ?? null}
          bookedFacility={patient.bookedFacility?.name ?? null}
        />
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
            bookedFacilityId: patient.bookedFacilityId,
            user: { name: patient.user.name, email: patient.user.email },
          }}
          facilities={facilities}
        />
      </div>
    </PageTransition>
  );
}
