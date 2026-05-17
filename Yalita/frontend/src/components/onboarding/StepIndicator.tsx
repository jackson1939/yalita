import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: { label: string; description?: string }[];
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-px bg-white/10" />
        <div
          className="absolute top-4 left-0 h-px bg-quipu-500 transition-all duration-500"
          style={{ width: `${(current / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={step.label} className="relative flex flex-col items-center gap-2 z-10">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                  done ? "bg-quipu-500 border-quipu-500 text-white"
                    : active ? "bg-neutral-950 border-quipu-500 text-quipu-500"
                    : "bg-neutral-950 border-white/20 text-neutral-600"
                )}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : i + 1}
              </div>
              <p className={cn("hidden sm:block text-xs font-medium text-center",
                active ? "text-white" : done ? "text-neutral-400" : "text-neutral-600"
              )}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
