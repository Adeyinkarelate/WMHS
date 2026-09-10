import Link from "next/link";
import { getPatientContext } from "@/lib/auth/patientContext";
import { prisma } from "@/lib/db/prisma";
import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDateTime } from "@/lib/utils/formatters";
import { QueryNotice } from "@/components/shared/QueryNotice";

export default async function SymptomsPage({
  searchParams,
}: {
  searchParams?: { notice?: string };
}) {
  const { patient } = await getPatientContext();
  const symptoms = await prisma.symptom.findMany({
    where: { patientId: patient.id },
    orderBy: { submissionDate: "desc" },
  });

  return (
    <PageTransition>
      <PageHeader
        eyebrow="How you feel"
        title="Symptoms"
        description="Log danger signs as they happen so your risk stays current."
        action={
          <Link href="/patient/symptoms/new">
            <Button size="sm">Log symptom</Button>
          </Link>
        }
      />
      <QueryNotice notice={searchParams?.notice} />
      {symptoms.length === 0 ? (
        <EmptyState
          title="Nothing logged yet"
          description="Start with how you feel today."
          actionLabel="Log a symptom"
          actionHref="/patient/symptoms/new"
        />
      ) : (
        <div className="space-y-3">
          {symptoms.map((s) => (
            <Card key={s.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-navy">{s.symptomType}</p>
                  <p className="text-caption text-ink-muted">{formatDateTime(s.submissionDate)}</p>
                </div>
                <p className="text-sm font-semibold">Severity {s.severity}/5</p>
              </div>
              {s.notes && <p className="mt-3 text-sm text-ink-muted">{s.notes}</p>}
            </Card>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
