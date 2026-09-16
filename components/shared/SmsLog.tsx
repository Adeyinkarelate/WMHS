import { Card, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime } from "@/lib/utils/formatters";

type Message = {
  id: string;
  toPhone: string;
  body: string;
  status: string;
  channel: string;
  provider: string;
  createdAt: Date | string;
};

export function SmsLog({ messages }: { messages: Message[] }) {
  return (
    <Card>
      <CardTitle className="text-xl">Notification pathway</CardTitle>
      <p className="mt-1 text-sm text-ink-muted">
        Critical alerts queue an outbound SMS. Without a live vendor the row is stored as a stub so
        the pathway can be demonstrated.
      </p>
      {messages.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">No outbound messages on this chart yet.</p>
      ) : (
        <ul className="mt-3 space-y-3 text-sm">
          {messages.map((m) => (
            <li key={m.id} className="rounded-xl bg-canvas px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-navy">{m.toPhone}</span>
                <span className="flex items-center gap-2">
                  <span className="text-caption uppercase tracking-wide text-ink-muted">
                    {m.channel} · {m.provider}
                  </span>
                  <StatusBadge value={m.status} />
                </span>
              </div>
              <p className="mt-1 text-ink-muted">{m.body}</p>
              <p className="mt-1 text-caption text-ink-muted">{formatDateTime(m.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
