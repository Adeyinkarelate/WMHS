import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/shared/Icons";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-gradient-to-b from-white to-canvas px-6 py-14 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-light text-sage">
        <Icons.spark />
      </span>
      <p className="mt-4 font-heading text-xl text-navy">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-5 inline-block">
          <Button size="sm">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
