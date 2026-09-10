import Link from "next/link";
import { getPatientContext } from "@/lib/auth/patientContext";
import { prisma } from "@/lib/db/prisma";
import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/utils/formatters";
import { LabFileLink } from "@/components/shared/LabFileLink";
import { QueryNotice } from "@/components/shared/QueryNotice";

export default async function TestsPage({
  searchParams,
}: {
  searchParams?: { notice?: string };
}) {
  const { patient } = await getPatientContext();
  const tests = await prisma.testResult.findMany({
    where: { patientId: patient.id },
    orderBy: { testDate: "desc" },
  });

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Labs & vitals"
        title="Test results"
        description="Blood pressure, glucose, haemoglobin and lab files in one timeline."
        action={
          <Link href="/patient/tests/upload">
            <Button size="sm">Upload test</Button>
          </Link>
        }
      />
      <QueryNotice notice={searchParams?.notice} />
      {tests.length === 0 ? (
        <EmptyState
          title="No results yet"
          description="Add blood pressure, glucose, haemoglobin or a lab file."
          actionLabel="Upload a test"
          actionHref="/patient/tests/upload"
        />
      ) : (
        <div className="space-y-3">
          {tests.map((t) => (
            <Card key={t.id}>
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-semibold text-navy">{t.testType}</p>
                  <p className="text-caption text-ink-muted">{formatDate(t.testDate)}</p>
                </div>
                <p className="font-heading text-xl text-navy">
                  {t.resultValue} {t.resultUnit}
                </p>
              </div>
              {t.notes && <p className="mt-2 text-sm text-ink-muted">{t.notes}</p>}
              <LabFileLink fileUrl={t.fileUrl} fileName={t.fileReference} />
            </Card>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
