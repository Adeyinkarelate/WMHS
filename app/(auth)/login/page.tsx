import { Suspense } from "react";
import { Logo } from "@/components/shared/Logo";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AuthHero } from "@/components/shared/AuthHero";
import { photos } from "@/lib/media";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthHero
        image={photos.hero.src}
        title="Welcome back to the ward record."
        body="Sign in to log symptoms, review risk, or open your caseload."
      />
      <div className="flex items-center justify-center bg-canvas bg-mesh-warm px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-line/70 bg-white/90 p-6 shadow-card sm:p-8">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="font-heading text-3xl text-navy">Log in</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Use your WMHS email, or the supervisor demo buttons below the form.
          </p>
          <div className="mt-8">
            <Suspense fallback={<LoadingSpinner label="Loading form" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
