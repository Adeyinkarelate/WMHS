"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/shared/Icons";
import { cn } from "@/lib/utils/helpers";

type Role = "PATIENT" | "PROVIDER";

const roles: { value: Role; label: string; hint: string; icon: typeof Icons.heart }[] = [
  { value: "PATIENT", label: "Mother", hint: "Track pregnancy and visits", icon: Icons.heart },
  {
    value: "PROVIDER",
    label: "Clinician",
    hint: "Doctor, nurse or midwife",
    icon: Icons.shield,
  },
];

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>("PATIENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function goNext(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const password = String(new FormData(form).get("password") ?? "");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setStep(2);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step === 1) {
      goNext(e);
      return;
    }
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(form.entries());
    payload.role = role;
    payload.terms = true;
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Registration failed");
        return;
      }
      try {
        const signedIn = await signIn("credentials", {
          email: String(payload.email),
          password: String(payload.password),
          redirect: false,
        });
        if (!signedIn?.ok) {
          router.push("/login?registered=1");
          return;
        }
      } catch {
        router.push("/login?registered=1");
        return;
      }
      router.push(role === "PROVIDER" ? "/provider/dashboard" : "/patient/dashboard");
      router.refresh();
    } catch {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-navy">
            {step === 1 ? "Your account" : role === "PATIENT" ? "Pregnancy details" : "Clinician details"}
          </p>
          <p className="shrink-0 text-caption text-ink-muted">Step {step} of 2</p>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={2}
          aria-valuenow={step}
          aria-label={`Step ${step} of 2`}
        >
          <div
            className={cn(
              "h-full rounded-full bg-primary transition-all duration-300",
              step === 1 ? "w-1/2" : "w-full"
            )}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger-ink" role="alert">
          {error}
        </p>
      )}

      <div hidden={step !== 1} className={step === 1 ? "space-y-3 sm:space-y-4" : undefined}>
        <fieldset className="relative z-10 min-w-0">
          <legend className="mb-2 text-label text-navy">I am a</legend>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((opt) => {
              const selected = role === opt.value;
              return (
                <label
                  key={opt.value}
                  className={cn(
                    "relative z-10 min-w-0 cursor-pointer rounded-2xl border px-2.5 py-2.5 text-left transition-all sm:px-3 sm:py-3",
                    "border-line bg-white hover:border-primary/40",
                    "has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:shadow-sm has-[:checked]:ring-1 has-[:checked]:ring-primary"
                  )}
                  onClick={() => setRole(opt.value)}
                >
                  <input
                    type="radio"
                    name="roleSelect"
                    value={opt.value}
                    checked={selected}
                    onChange={() => setRole(opt.value)}
                    className="sr-only"
                  />
                  <span className="flex items-center gap-1.5">
                    <opt.icon
                      size={16}
                      className={cn("shrink-0", selected ? "text-primary" : "text-ink-muted")}
                    />
                    <span
                      className={cn(
                        "truncate font-heading text-sm font-semibold",
                        selected ? "text-primary" : "text-navy"
                      )}
                    >
                      {opt.label}
                    </span>
                  </span>
                  <span className="mt-1 block text-[12px] leading-snug text-ink-muted sm:text-caption">
                    {opt.hint}
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {role === "PROVIDER"
              ? "You are registering as a health worker. After this step you will add your specialisation."
              : "You are registering as a mother. After this step you will add pregnancy details."}
          </p>
          <input type="hidden" name="role" value={role} />
        </fieldset>

        <Input name="name" label="Full name" required={step === 1} autoComplete="name" />
        <Input name="email" type="email" label="Email" required={step === 1} autoComplete="email" />
        <Input
          name="password"
          type="password"
          label="Password"
          required={step === 1}
          minLength={step === 1 ? 8 : undefined}
          autoComplete="new-password"
          hint="At least 8 characters"
        />
      </div>

      <div hidden={step !== 2} className={step === 2 ? "space-y-3 sm:space-y-4" : undefined}>
        {role === "PATIENT" ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <Input name="dateOfBirth" type="date" label="Date of birth" required={step === 2} />
              <Input name="phone" type="tel" label="Phone" required={step === 2} autoComplete="tel" />
            </div>
            <Input name="address" label="Residential address" required={step === 2} autoComplete="street-address" />
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <Input
                name="lmp"
                type="date"
                label="Last menstrual period"
                hint="Used to estimate your due date"
              />
              <Input name="parity" type="number" min={0} label="Previous births (parity)" defaultValue={0} />
            </div>
          </>
        ) : (
          <Input
            name="specialization"
            label="Specialisation"
            required={step === 2}
            placeholder="e.g. Obstetrics"
          />
        )}
        <label className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted">
          <input
            type="checkbox"
            name="terms"
            required={step === 2}
            className="mt-1 h-4 w-4 shrink-0 rounded border-line"
          />
          I agree to the terms of use and consent to WMHS processing my health data under NDPR.
        </label>
      </div>

      {step === 1 ? (
        <Button type="submit" className="w-full">
          Continue
        </Button>
      ) : (
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              setError("");
              setStep(1);
            }}
          >
            Back
          </Button>
          <Button type="submit" className="w-full sm:flex-1" loading={loading}>
            Create account
          </Button>
        </div>
      )}

      <p className="text-center text-sm text-ink-muted">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Log in
        </Link>
      </p>
    </form>
  );
}
