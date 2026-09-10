"use client";

import { Button } from "@/components/ui/Button";

export function PrintShare({ title = "WMHS" }: { title?: string }) {
  return (
    <div className="flex gap-2 no-print">
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        Print / export
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={async () => {
          const url = window.location.href;
          if (navigator.share) {
            await navigator.share({ title, url });
          } else {
            await navigator.clipboard.writeText(url);
            alert("Link copied");
          }
        }}
      >
        Share
      </Button>
    </div>
  );
}
