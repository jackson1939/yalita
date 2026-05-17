"use client";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
  minLabel?: string;
  maxLabel?: string;
}

export function Slider({
  label, value, min, max, step = 1, format, onChange, minLabel, maxLabel,
}: SliderProps) {
  const display = format ? format(value) : String(value);
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-400">{label}</span>
        <span className="text-sm font-bold text-white">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-quipu-500 bg-white/10"
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-xs text-neutral-600">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
