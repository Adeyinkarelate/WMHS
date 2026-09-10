import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas bg-mesh-warm px-6 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-3 font-heading text-3xl text-navy">This page is not on the ward map</h1>
      <p className="mt-2 max-w-md text-sm text-ink-muted">
        The record you asked for does not exist, or the link is incomplete.
      </p>
      <Link href="/" className="mt-6">
        <Button>Back to WMHS</Button>
      </Link>
    </div>
  );
}
