"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { safeInternalPath } from "@/lib/utils/helpers";
import { DEMO_ACCOUNTS } from "@/lib/auth/demoAccounts";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoRole, setDemoRole] = useState<string | null>(null);

  async function signInWith(nextEmail: string, nextPassword: string) {
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: nextEmail,
        password: nextPassword,
        redirect: false,
      });
      if (!res?.ok) {
        setError("Email or password is incorrect.");
        return;
      }
      const callback = safeInternalPath(params.get("callbackUrl"));
      if (callback) {
        router.push(callback);
        router.refresh();
        return;
      }
      try {
        const meRes = await fetch("/api/auth/me");
        const me = await meRes.json().catch(() => ({}));
        const role = me.user?.role;
        if (role === "PROVIDER" || role === "ADMIN") {
          router.push("/provider/dashboard");
        } else if (role === "PATIENT") {
          router.push("/patient/dashboard");
        } else {
          router.push("/");
        }
      } catch {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Could not sign in. Try again.");
    } finally {
      setLoading(false);
      setDemoRole(null);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await signInWith(email, password);
  }

  async function onDemo(account: (typeof DEMO_ACCOUNTS)[number]) {
    setEmail(account.email);
    setPassword(account.password);
    setDemoRole(account.role);
    await signInWith(account.email, account.password);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {params.get("registered") === "1" && !error && (
        <p className="rounded-xl bg-success-soft px-3 py-2 text-sm text-success-ink" role="status">
          Account created. Sign in to continue.
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger-ink" role="alert">
          {error}
        </p>
      )}
      <Input
        name="email"
        type="email"
        label="Email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        name="password"
        type="password"
        label="Password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" className="w-full" loading={loading && !demoRole}>
        Log in
      </Button>
      <div className="rounded-2xl border border-line bg-canvas px-4 py-3">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-sage">
          Supervisor demo
        </p>
        <p className="mt-1 text-caption text-ink-muted">
          Seeded walkthrough accounts. One tap signs in.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {DEMO_ACCOUNTS.map((account) => (
            <Button
              key={account.email}
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              loading={loading && demoRole === account.role}
              disabled={loading}
              onClick={() => onDemo(account)}
            >
              {account.label}
            </Button>
          ))}
        </div>
      </div>
      <p className="text-center text-sm text-ink-muted">
        <Link href="/forgot-password" className="text-primary font-semibold">
          Forgot password?
        </Link>
      </p>
      <p className="text-center text-sm text-ink-muted">
        No account?{" "}
        <Link href="/register" className="font-semibold text-primary">
          Register
        </Link>
      </p>
    </form>
  );
}
