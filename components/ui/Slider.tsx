"use client";

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

const labels = ["", "Mild", "Noticeable", "Moderate", "Severe", "Unbearable"];

export function Slider({ label, value, onChange, min = 1, max = 5 }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-label text-navy">{label}</span>
        <span className="text-caption font-semibold text-primary">
          {value} — {labels[value] ?? ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-line accent-primary"
        aria-label={label}
      />
      <div className="flex justify-between text-caption text-ink-muted">
        <span>Mild</span>
        <span>Severe</span>
      </div>
    </div>
  );
}
