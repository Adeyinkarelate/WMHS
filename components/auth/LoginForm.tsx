"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { safeInternalPath } from "@/lib/utils/helpers";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    try {
      const res = await signIn("credentials", {
        email,
        password,
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
    }
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
      <Input name="email" type="email" label="Email" required autoComplete="email" />
      <Input
        name="password"
        type="password"
        label="Password"
        required
        autoComplete="current-password"
      />
      <Button type="submit" className="w-full" loading={loading}>
        Log in
      </Button>
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
