import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export function Footer() {
  return (
    <footer className="border-t border-line/80 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
            WMHS helps Nigerian mothers monitor pregnancy health, understand risk early, and
            reach the right facility — with clinicians beside them, not behind a waiting room.
          </p>
        </div>
        <div>
          <p className="font-heading text-sm font-semibold text-navy">Product</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li>
              <Link href="/#features" className="transition-colors hover:text-navy">
                Features
              </Link>
            </li>
            <li>
              <Link href="/register" className="transition-colors hover:text-navy">
                Create an account
              </Link>
            </li>
            <li>
              <Link href="/login" className="transition-colors hover:text-navy">
                Patient login
              </Link>
            </li>
            <li>
              <Link href="/login" className="transition-colors hover:text-navy">
                Provider login
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-heading text-sm font-semibold text-navy">Trust</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li>NDPR-aligned data handling</li>
            <li>Role-based access</li>
            <li>Clinical decision support — not a diagnosis</li>
            <li>Built for low-bandwidth clinics</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-ink-muted sm:flex-row sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} WMHS. Web Maternal Health System.</p>
          <p>Not a medical emergency service. Call your nearest facility for danger signs.</p>
        </div>
      </div>
    </footer>
  );
}
