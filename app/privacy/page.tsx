import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Privacy notice",
};

export default function PrivacyPage() {
  return (
    <div className="bg-canvas bg-mesh-warm">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-sage">Legal</p>
        <h1 className="mt-3 font-heading text-h2 text-navy text-balance">Privacy notice</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
          Last updated 23 October 2026. WMHS processes health data under the Nigeria Data Protection
          Regulation (NDPR). This notice explains what we collect and why.
        </p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink">
          <section>
            <h2 className="font-heading text-xl text-navy">What we collect</h2>
            <p className="mt-2 text-ink-muted">
              Account details (name, email, phone, facility), pregnancy dates, symptoms, test values,
              uploaded lab files, risk assessments, alerts, referrals, and antenatal attendance. Location
              is optional and used only to rank nearby facilities.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-xl text-navy">Why we process it</h2>
            <p className="mt-2 text-ink-muted">
              To keep one antenatal record, run guideline-backed triage, notify the named clinician, and
              produce a referral letter. We do not sell health data. SMS to a live vendor is off unless an
              administrator configures it.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-xl text-navy">Who can see a record</h2>
            <p className="mt-2 text-ink-muted">
              A mother sees her own record. A clinician sees only mothers on an active caseload assignment
              at their facility. Lab files are stored with the patient record, not on a shared clinician
              folder.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-xl text-navy">Your choices</h2>
            <p className="mt-2 text-ink-muted">
              You can update profile details, turn off alert notifications, and request deletion of an
              account through your clinic administrator. See also the{" "}
              <Link href="/terms" className="font-semibold text-primary">
                terms of use
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
