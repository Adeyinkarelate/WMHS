"use client";

import { cn } from "@/lib/utils/helpers";
import { InputHTMLAttributes, MouseEvent, forwardRef, useState } from "react";
import { Icons } from "@/components/shared/Icons";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, label, error, hint, id, type = "text", ...props },
  ref
) {
  const inputId = id ?? props.name;
  const isPassword = type === "password";
  const [visible, setVisible] = useState(false);
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  function togglePassword(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    setVisible((v) => !v);
  }

  return (
    <div className="block space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="text-label text-navy">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "h-12 w-full rounded-xl border bg-white px-4 text-body text-ink shadow-sm placeholder:text-ink-muted/70 transition-all duration-200",
            isPassword && "pr-12 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden",
            error
              ? "border-danger"
              : "border-line focus:border-primary focus:shadow-glow",
            className
          )}
          {...props}
          type={inputType}
        />
        {isPassword && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={togglePassword}
            className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-sage-light hover:text-navy"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
          >
            {visible ? <Icons.eyeOff size={20} /> : <Icons.eye size={20} />}
          </button>
        )}
      </div>
      {error ? (
        <span className="text-caption text-danger">{error}</span>
      ) : hint ? (
        <span className="text-caption text-ink-muted">{hint}</span>
      ) : null}
    </div>
  );
});
