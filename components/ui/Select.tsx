import { cn } from "@/lib/utils/helpers";
import { SelectHTMLAttributes, forwardRef } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { className, label, error, id, options, placeholder, ...props },
  ref
) {
  const selectId = id ?? props.name;
  return (
    <label className="block space-y-1.5" htmlFor={selectId}>
      {label && <span className="text-label text-navy">{label}</span>}
      <select
        id={selectId}
        ref={ref}
        className={cn(
          "h-12 w-full rounded-xl border bg-white px-4 text-body text-ink shadow-sm transition-all duration-200",
          error ? "border-danger" : "border-line focus:border-primary focus:shadow-glow",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-caption text-danger">{error}</span>}
    </label>
  );
});
