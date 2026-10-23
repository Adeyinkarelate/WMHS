import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Terms of use",
};

export default function TermsPage() {
  return (
    <div className="bg-canvas bg-mesh-warm">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-sage">Legal</p>
        <h1 className="mt-3 font-heading text-h2 text-navy text-balance">Terms of use</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
          Last updated 23 October 2026. These terms govern use of the Web Maternal Health System (WMHS).
        </p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink">
          <section>
            <h2 className="font-heading text-xl text-navy">Decision support, not a diagnosis</h2>
            <p className="mt-2 text-ink-muted">
              WMHS helps mothers and clinicians share an antenatal record and flag danger signs. It does not
              replace a qualified health worker, diagnose disease, or dispatch an ambulance. For danger signs
              call 112 or go to the nearest emergency-capable facility.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-xl text-navy">Accounts</h2>
            <p className="mt-2 text-ink-muted">
              Mothers register their own pregnancy record. Clinicians register only with a facility invite on
              production systems, and may only see mothers they have claimed onto their caseload. You are
              responsible for keeping your login private.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-xl text-navy">Acceptable use</h2>
            <p className="mt-2 text-ink-muted">
              Do not enter another person’s health data without their consent. Do not attempt to access
              records outside your role. Demo accounts are for evaluation only.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-xl text-navy">Related</h2>
            <p className="mt-2 text-ink-muted">
              How we handle personal data is described in the{" "}
              <Link href="/privacy" className="font-semibold text-primary">
                privacy notice
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
