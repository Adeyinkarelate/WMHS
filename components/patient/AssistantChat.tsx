"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { SUGGESTED_PROMPTS } from "@/lib/ai/assistant";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { AlertBanner } from "@/components/shared/AlertBanner";

type Msg = { role: "user" | "assistant"; text: string; escalate?: boolean };

export function AssistantChat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "I can explain danger signs, due dates, nutrition and what your WMHS risk result means. I am not a replacement for a clinician.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function ask(question: string) {
    if (loading) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json().catch(() => ({}));
      const text =
        res.status === 401
          ? "Your session expired. Please log in again."
          : !res.ok
            ? typeof data.error === "string"
              ? data.error
              : "I could not answer that just now. Try again."
            : (data.answer ?? "I could not answer that.");
      setMessages((m) => [
        ...m,
        { role: "assistant", text, escalate: Boolean(data.escalate) },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "I could not answer that just now. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const q = String(form.get("question") ?? "").trim();
    if (!q) return;
    e.currentTarget.reset();
    void ask(q);
  }

  return (
    <div className="space-y-4 rounded-3xl border border-line bg-white/80 p-4 shadow-card sm:p-6">
      <div className="space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === "user"
                ? "ml-auto bg-gradient-to-r from-primary to-primary-dark text-white"
                : "bg-canvas shadow-sm"
            }`}
          >
            {m.text}
            {m.escalate && (
              <div className="mt-3">
                <AlertBanner title="Talk to a clinician" tone="warning">
                  This topic should be confirmed by your provider.{" "}
                  <Link href="/patient/referrals" className="font-semibold underline-offset-2 hover:underline">
                    Open referrals
                  </Link>{" "}
                  if you need a facility.
                </AlertBanner>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((p) => (
          <Button
            key={p}
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => ask(p)}
          >
            {p}
          </Button>
        ))}
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <Textarea name="question" label="Your question" disabled={loading} />
        <Button type="submit" loading={loading}>
          Ask
        </Button>
      </form>
    </div>
  );
}
