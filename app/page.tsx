"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/shared/Icons";
import { Reveal, Stagger, StaggerItem, FadeIn } from "@/components/shared/Reveal";
import { photos } from "@/lib/media";

const featured = [
  {
    title: "Antenatal check",
    body: "Log how you feel in two minutes — headache, bleeding, movement.",
    photo: photos.pregnant,
  },
  {
    title: "ANC contacts",
    body: "WHO eight-visit plan from your last period, on the same record as symptoms.",
    photo: photos.baby,
  },
  {
    title: "Labs & files",
    body: "BP, glucose and lab PDFs in one timeline your midwife can open.",
    photo: photos.ultrasound,
  },
];

const services = [
  {
    n: "01",
    title: "Symptom logging",
    body: "Danger signs captured on a phone, not a paper booklet.",
    icon: Icons.pulse,
  },
  {
    n: "02",
    title: "Test results",
    body: "Haemoglobin, glucose and files stay with the mother.",
    icon: Icons.flask,
  },
  {
    n: "03",
    title: "Clinical triage",
    body: "Fourteen features. Low, medium or high — with the why.",
    icon: Icons.shield,
  },
  {
    n: "04",
    title: "Smart referral",
    body: "Nearest ward by distance, emergency capability and risk.",
    icon: Icons.pin,
  },
];

const steps = [
  { n: "01", title: "Create your record", body: "Register as a mother or a clinician. LMP sets your due date with Naegele’s rule." },
  { n: "02", title: "Log what you feel", body: "Symptoms and vitals land in one timeline. No paper booklet to lose." },
  { n: "03", title: "See the risk clearly", body: "The engine flags pre-eclampsia, diabetes and preterm labour patterns." },
  { n: "04", title: "Reach the right ward", body: "Referral cards show distance, phone and whether emergency care is on site." },
];

const stats = [
  {
    value: "1 in 21",
    kicker: "Maternal risk",
    label: "Lifetime maternal risk in parts of Nigeria — early detection matters",
    icon: Icons.heart,
    featured: true,
  },
  {
    value: "< 1s",
    kicker: "Inference",
    label: "Risk scored on the server, not a distant lab queue",
    icon: Icons.spark,
    featured: false,
  },
  {
    value: "8+",
    kicker: "ANC contacts",
    label: "WHO antenatal contacts we help you actually complete",
    icon: Icons.shield,
    featured: false,
  },
  {
    value: "24/7",
    kicker: "On the ward",
    label: "A record your provider can open between theatre cases",
    icon: Icons.clock,
    featured: false,
  },
];

const testimonials = [
  {
    quote:
      "I used to wait until the next ANC day. Now I log a headache at night and my midwife sees the alert before morning ward round.",
    name: "Amina Bello",
    role: "Mother, 32 weeks · Kano",
    photo: photos.portraitA,
  },
  {
    quote:
      "The colour on the list is honest. Green I leave. Amber I call. Red I make space. That is how you run a full antenatal clinic.",
    name: "Dr. Chioma Okeke",
    role: "Obstetrician · Lagos",
    photo: photos.portraitB,
  },
  {
    quote:
      "Distance to the nearest CEmONC used to live in someone’s head. WMHS puts kilometres and a phone number on the same card.",
    name: "Nurse Tunde Adeyemi",
    role: "PHC · Ibadan",
    photo: photos.portraitC,
  },
];

export default function LandingPage() {
  return (
    <div className="bg-canvas bg-mesh-warm">
      <Navbar />
      <main>
        <section className="px-4 pb-8 pt-6 sm:px-6 lg:pt-10">
          <div className="relative isolate mx-auto grid min-h-[520px] max-w-6xl overflow-hidden rounded-[2.5rem] shadow-lift lg:grid-cols-[1.05fr_1fr]">
            <div className="pointer-events-none absolute inset-0 z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos.hero.src}
                alt={photos.hero.alt}
                className="h-full w-full object-cover object-[center_18%]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/25" />
            </div>
            <FadeIn className="relative z-10 flex flex-col justify-center px-8 py-12 text-white sm:px-12 lg:py-16">
              <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 font-heading text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                <Icons.heart size={14} />
                Built for Nigerian maternal care
              </p>
              <h1 className="mt-6 font-heading text-4xl font-bold uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">
                Closer
                <br />
                Smart Care
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-white/85">
                WMHS helps mothers and clinicians share one antenatal record — symptom logging,
                guideline-backed triage, and referral when minutes matter.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/#features">
                  <Button size="lg" variant="ghostDark" className="w-full sm:w-auto">
                    Explore More
                    <Icons.arrowUp size={16} />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="inverse" className="w-full sm:w-auto">
                    Start as a patient
                  </Button>
                </Link>
              </div>
              {process.env.NODE_ENV !== "production" && (
                <p className="mt-5 text-caption text-white/70">
                  Demo: patient@wmhs.ng · provider@wmhs.ng · Password123!
                </p>
              )}
            </FadeIn>
            <FadeIn delay={0.1} className="relative z-10 min-h-[280px] lg:min-h-[560px]">
              <motion.div
                className="absolute left-5 top-8 glass hidden rounded-2xl px-4 py-3 sm:block"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Excellence</p>
                <p className="font-semibold text-navy">22 years · maternal care</p>
              </motion.div>
              <motion.div
                className="absolute bottom-6 right-5 glass max-w-[220px] rounded-2xl p-4"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <p className="text-caption font-semibold uppercase tracking-wide text-ink-muted">Live triage</p>
                <p className="mt-1 text-lg font-semibold text-navy">Low · Medium · High</p>
                <p className="mt-1 text-caption text-ink-muted">Colour a labour ward can read.</p>
              </motion.div>
            </FadeIn>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <Stagger className="grid gap-4 md:grid-cols-3">
            {featured.map((card) => (
              <StaggerItem key={card.title}>
                <article className="group relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/70 p-3 shadow-card backdrop-blur-xl surface-hover">
                  <div className="relative h-44 overflow-hidden rounded-[1.35rem] sm:h-52">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.photo.src}
                      alt={card.photo.alt}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-end justify-between gap-3 px-2 pb-2 pt-4">
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-navy">{card.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-muted">{card.body}</p>
                    </div>
                    <Link
                      href="/register"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-white transition-transform group-hover:scale-105"
                      aria-label={`Open ${card.title}`}
                    >
                      <Icons.arrowUp size={16} />
                    </Link>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section id="stakes" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
          <Reveal>
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-sage">The stakes</p>
            <h2 className="mt-3 max-w-xl font-heading text-3xl font-bold text-navy sm:text-4xl">
              Numbers a ward already lives with
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ink">
              Early detection, a second of inference, and a record that stays open — not another paper booklet.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5">
            {stats
              .filter((s) => s.featured)
              .map((s) => (
                <Reveal key={s.value}>
                  <article className="relative overflow-hidden rounded-[2rem] bg-navy px-6 py-7 text-white shadow-lift sm:px-8 sm:py-8">
                    <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
                    <div className="pointer-events-none absolute -bottom-24 right-24 h-44 w-44 rounded-full bg-primary/25" />
                    <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                        <s.icon size={22} />
                      </span>
                      <div className="min-w-0 lg:w-56">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">{s.kicker}</p>
                        <p className="mt-2 font-heading text-4xl font-bold leading-none tracking-tight sm:text-5xl">{s.value}</p>
                      </div>
                      <p className="max-w-md text-sm leading-relaxed text-white/75 sm:text-base">{s.label}</p>
                    </div>
                    <span className="absolute inset-x-0 bottom-0 h-1 bg-white/25" aria-hidden />
                  </article>
                </Reveal>
              ))}
            <Stagger className="grid gap-4 sm:grid-cols-3">
              {stats
                .filter((s) => !s.featured)
                .map((s) => (
                  <StaggerItem key={s.value} className="h-full">
                    <article className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-card backdrop-blur-xl surface-hover">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-light text-sage">
                        <s.icon size={20} />
                      </span>
                      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sage">{s.kicker}</p>
                      <p className="mt-2 font-heading text-[2rem] font-bold leading-none tracking-tight text-navy">{s.value}</p>
                      <p className="mt-3 text-sm leading-relaxed text-ink">{s.label}</p>
                    </article>
                  </StaggerItem>
                ))}
            </Stagger>
          </div>
        </section>

        <section id="about" className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-8 sm:px-6 lg:grid-cols-2 lg:pb-16">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.25rem] shadow-lift">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos.baby.src}
                alt={photos.baby.alt}
                className="h-80 w-full object-cover lg:h-[460px]"
              />
              <div className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-navy">
                About us
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-sage">Your WMHS hospital</p>
            <h2 className="mt-3 font-heading text-3xl font-bold uppercase leading-tight text-navy sm:text-4xl">
              Care that stays on the record
            </h2>
            <p className="mt-4 text-ink-muted">
              WMHS is built for antenatal clinics and labour wards across Nigeria. Mothers log
              symptoms at home. Clinicians see risk before the next ANC day. Referral letters
              carry gestational age, vitals and the nearest CEmONC.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/register">
                <Button size="lg" variant="secondary">
                  Create an account
                  <Icons.arrow size={16} />
                </Button>
              </Link>
              <a href="tel:+2348000000000" className="inline-flex items-center gap-3 text-sm font-semibold text-navy">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sage-light text-sage">
                  <Icons.phone size={16} />
                </span>
                +234 800 000 0000
              </a>
            </div>
          </Reveal>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-sage">Offerings</p>
            <h2 className="mt-3 max-w-2xl font-heading text-3xl font-bold text-navy sm:text-4xl">
              Catch problems early. Keep the antenatal record in one place.
            </h2>
          </Reveal>
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2">
            {services.map((f) => (
              <StaggerItem key={f.title}>
                <article className="flex h-full gap-4 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-card backdrop-blur-xl">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sage-light text-sage">
                    <f.icon />
                  </span>
                  <div>
                    <p className="text-caption font-semibold text-primary">{f.n}</p>
                    <h3 className="mt-1 font-heading text-xl font-semibold text-navy">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.body}</p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section id="how-it-works" className="border-y border-line/70 bg-white/70">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <Reveal>
              <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-sage">Simple path</p>
              <h2 className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl">How it works</h2>
              <p className="mt-3 max-w-xl text-ink-muted">
                Four steps. No extra hardware. A browser on the ward or at home.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-8 md:grid-cols-4">
              {steps.map((s) => (
                <div key={s.n} className="border-t border-primary/20 pt-6">
                  <p className="text-sm font-semibold text-primary">{s.n}</p>
                  <h3 className="mt-3 font-heading text-xl font-semibold text-navy">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <div className="overflow-hidden rounded-[2.25rem] shadow-lift">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos.motherBaby.src}
                alt={photos.motherBaby.alt}
                className="h-80 w-full object-cover lg:h-[440px]"
              />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-sage">Risk, not noise</p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl">A triage a labour ward can trust</h2>
            <p className="mt-4 text-ink-muted">
              The clinical engine looks at age, blood pressure, glucose, heart rate, temperature and eight
              danger-sign symptoms. Missing vitals are skipped, not treated as normal. High risk opens
              complication screens for pre-eclampsia, gestational diabetes and preterm labour — then
              recommends tests, actions, and a nearby facility.
            </p>
            <div className="mt-8 grid gap-3">
              {[
                { c: "bg-success", t: "Low", d: "Routine ANC. Keep logging." },
                { c: "bg-warning", t: "Medium", d: "Clinic review within 48 hours." },
                { c: "bg-danger", t: "High", d: "Same-day review or emergency referral." },
              ].map((row) => (
                <div key={row.t} className="flex items-center gap-4 rounded-2xl bg-white/80 p-4 shadow-card backdrop-blur-xl">
                  <span className={`h-3 w-3 rounded-full ${row.c}`} />
                  <div>
                    <p className="font-semibold text-navy">{row.t}</p>
                    <p className="text-caption text-ink-muted">{row.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <section id="providers" className="border-y border-line/70 bg-white/70">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <Reveal>
              <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-sage">Specialized</p>
              <h2 className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl">Heard from the people who would use it</h2>
            </Reveal>
            <Stagger className="mt-10 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <StaggerItem key={t.name}>
                  <blockquote className="h-full rounded-[1.75rem] border border-white bg-white/90 p-6 shadow-card">
                    <p className="text-sm leading-relaxed text-ink">“{t.quote}”</p>
                    <footer className="mt-6 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={t.photo.src}
                        alt=""
                        className="h-12 w-12 rounded-2xl object-cover"
                      />
                      <div>
                        <p className="font-semibold text-navy">{t.name}</p>
                        <p className="text-caption text-ink-muted">{t.role}</p>
                      </div>
                    </footer>
                  </blockquote>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="relative overflow-hidden rounded-[2.5rem] px-8 py-16 text-white sm:px-14 lg:py-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos.pregnant.src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy/92 via-navy/78 to-navy/40" />
            <div className="relative max-w-xl">
              <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                Ready when you are
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-[2.75rem]">
                See WMHS in your ward, your PHC, your home.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/88">
                Register as a patient or a provider. The demo accounts are ready if you want to walk
                the product before you invite a clinic.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/register">
                  <Button size="lg" variant="inverse" className="w-full sm:w-auto">
                    Create an account
                    <Icons.arrowUp size={16} />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="ghostDark" className="w-full sm:w-auto">
                    Open the demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
