"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/utils/formatters";
import { StatusBadge } from "@/components/shared/StatusBadge";

type Notice = {
  id: string;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
  type?: string;
  severity?: string | null;
  link?: string | null;
};

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notice[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = (await res.json()) as Notice[] | { error?: string };
    if (!Array.isArray(data)) return;
    setItems(data);
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = items.filter((n) => !n.read).length;

  async function mark(id?: string) {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : { all: true }),
    });
    await load();
  }

  async function openNotice(n: Notice) {
    if (!n.read) await mark(n.id);
    if (n.link) {
      setOpen(false);
      router.push(n.link);
    }
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        aria-label={unread ? `${unread} unread notifications` : "Notifications"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-navy hover:bg-sage-light"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M15 17H9c-2.8 0-4.2 0-4.9-.8-.4-.5-.6-1.1-.4-1.8.1-.4.8-1 2.1-2.2.7-.6 1.1-1.7 1.1-3.2C6.9 5.8 9.1 4 12 4s5.1 1.8 5.1 5c0 1.5.4 2.6 1.1 3.2 1.3 1.2 2 1.8 2.1 2.2.2.7 0 1.3-.4 1.8-.7.8-2.1.8-4.9.8Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M10 17a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        {unread > 0 && (
          <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-line bg-white p-3 shadow-lift">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-navy">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                className="text-caption font-semibold text-primary"
                onClick={() => void mark()}
              >
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="px-1 py-4 text-sm text-ink-muted">No messages yet.</p>
          ) : (
            <ul className="max-h-80 space-y-2 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={`w-full rounded-xl px-3 py-2 text-left ${n.read ? "bg-canvas" : "bg-sage-light"}`}
                    onClick={() => void openNotice(n)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-navy">{n.title}</p>
                      {n.severity && <StatusBadge value={n.severity} />}
                    </div>
                    <p className="mt-0.5 text-caption text-ink">{n.content}</p>
                    <p className="mt-1 text-caption text-ink-muted">{formatDateTime(n.createdAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
