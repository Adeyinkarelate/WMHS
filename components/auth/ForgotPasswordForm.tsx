"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthHero } from "@/components/shared/AuthHero";
import { photos } from "@/lib/media";

export function ForgotPasswordForm({ token }: { token?: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devToken, setDevToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function requestReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not start a password reset.");
        return;
      }
      setMessage(data.message ?? "If that email exists, a reset path was created.");
      if (data.token) setDevToken(data.token);
    } catch {
      setError("Could not start a password reset.");
    } finally {
      setLoading(false);
    }
  }

  async function setNewPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: form.get("password"),
          confirmPassword: form.get("confirmPassword"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not reset password.");
        return;
      }
      setDone(true);
      setMessage(data.message ?? "Password updated. You can sign in now.");
    } catch {
      setError("Could not reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthHero
        image={photos.clinic.src}
        title="A safer way back in."
        body="Reset your password and return to your record. Your care timeline stays intact."
      />
      <div className="flex items-center justify-center bg-canvas bg-mesh-warm px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-line/70 bg-white/90 p-6 shadow-card sm:p-8">
          <Logo />
          <h1 className="mt-8 font-heading text-3xl text-navy">
            {token ? "Choose a new password" : "Reset password"}
          </h1>
          {!token && (
            <p className="mt-2 text-sm text-ink-muted">
              Email delivery is not wired in this build. In development, a token is returned so you can
              complete the demo path.
            </p>
          )}
          {token ? (
            done ? (
              <p className="mt-8 text-sm text-success-ink">{message}</p>
            ) : (
              <form onSubmit={setNewPassword} className="mt-8 space-y-4">
                {error && <p className="text-sm text-danger">{error}</p>}
                <Input name="password" type="password" label="New password" required minLength={8} />
                <Input
                  name="confirmPassword"
                  type="password"
                  label="Confirm new password"
                  required
                  minLength={8}
                />
                <Button type="submit" className="w-full" loading={loading}>
                  Update password
                </Button>
              </form>
            )
          ) : (
            <form onSubmit={requestReset} className="mt-8 space-y-4">
              <Input name="email" type="email" label="Email" required />
              <Button type="submit" className="w-full" loading={loading}>
                Send reset
              </Button>
            </form>
          )}
          {message && !done && <p className="mt-4 text-sm text-success-ink">{message}</p>}
          {devToken && (
            <p className="mt-2 break-all text-caption text-ink-muted">
              Dev token: {devToken}. Open{" "}
              <Link className="text-primary" href={`/forgot-password?token=${devToken}`}>
                reset link
              </Link>
            </p>
          )}
          <p className="mt-6 text-sm">
            <Link href="/login" className="font-semibold text-primary">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
