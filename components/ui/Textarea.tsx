import { cn } from "@/lib/utils/helpers";
import { TextareaHTMLAttributes, forwardRef } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { className, label, error, id, ...props },
  ref
) {
  const areaId = id ?? props.name;
  return (
    <label className="block space-y-1.5" htmlFor={areaId}>
      {label && <span className="text-label text-navy">{label}</span>}
      <textarea
        id={areaId}
        ref={ref}
        className={cn(
          "min-h-[120px] w-full rounded-xl border bg-white px-4 py-3 text-body text-ink shadow-sm transition-all duration-200",
          error ? "border-danger" : "border-line focus:border-primary focus:shadow-glow",
          className
        )}
        {...props}
      />
      {error && <span className="text-caption text-danger">{error}</span>}
    </label>
  );
});
