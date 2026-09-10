import { Logo } from "@/components/shared/Logo";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthHero } from "@/components/shared/AuthHero";
import { photos } from "@/lib/media";

export default function RegisterPage() {
  return (
    <div className="grid min-h-dvh overflow-x-hidden bg-canvas bg-mesh-warm lg:h-dvh lg:grid-cols-2">
      <div className="relative isolate h-36 overflow-hidden sm:h-44 lg:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos.baby.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-navy/30" />
        <div className="relative flex h-full flex-col justify-between p-5 pb-12 text-white">
          <Logo dark />
          <div>
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              Join WMHS
            </p>
            <p className="mt-1 font-heading text-xl leading-tight text-balance">
              A record that travels with her.
            </p>
          </div>
        </div>
      </div>

      <AuthHero
        image={photos.baby.src}
        title="A record that travels with her."
        body="Patients and providers share one timeline of symptoms, tests and risk."
      />

      <div className="relative z-10 -mt-8 flex min-h-0 flex-col bg-transparent lg:mt-0 lg:h-dvh lg:overflow-y-auto lg:bg-canvas lg:bg-mesh-warm">
        <div className="mx-auto flex w-full min-w-0 max-w-lg flex-1 flex-col justify-center px-4 pb-6 sm:px-6 sm:pb-8 lg:px-10 lg:py-8">
          <div className="w-full min-w-0 rounded-[1.75rem] border border-white/80 bg-white/90 p-4 shadow-card backdrop-blur-xl sm:p-7">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              New to WMHS
            </p>
            <h1 className="mt-2 font-heading text-h3 text-navy text-balance sm:text-h2">
              Create your account
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Mothers and clinicians register here — two short steps.
            </p>
            <div className="mt-6 sm:mt-7">
              <RegisterForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
