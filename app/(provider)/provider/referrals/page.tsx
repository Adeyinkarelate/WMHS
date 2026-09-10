import { getProviderContext } from "@/lib/auth/providerContext";
import { assignedCaseloadWhere } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { ReferralTable } from "@/components/provider/ReferralTable";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function ProviderReferralsPage() {
  const { session } = await getProviderContext();
  const referrals = await prisma.referral.findMany({
    where: assignedCaseloadWhere(session.user),
    include: {
      facility: true,
      patient: { include: { user: { select: { name: true } } } },
    },
    orderBy: { referredAt: "desc" },
  });

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Pathways"
        title="Referrals"
        description="Approve, complete, or cancel. Transport notes stay on the record."
      />
      <div className="mt-6">
        {referrals.length === 0 ? (
          <EmptyState title="No referrals" description="When a patient requests a facility, it appears here." />
        ) : (
          <ReferralTable referrals={referrals} />
        )}
      </div>
    </PageTransition>
  );
}
