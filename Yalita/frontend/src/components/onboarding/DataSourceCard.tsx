import { cn } from "@/lib/utils";

interface DataSourceCardProps {
  source: { id: string; name: string; flag: string; description: string };
  selected: boolean;
  onSelect: () => void;
}

export function DataSourceCard({ source, selected, onSelect }: DataSourceCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
        selected
          ? "border-quipu-500 bg-quipu-500/10"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5"
      )}
    >
      <span className="text-2xl flex-shrink-0">{source.flag}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-white">{source.name}</p>
        <p className="text-xs text-neutral-500 truncate">{source.description}</p>
      </div>
      <div className={cn(
        "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors",
        selected ? "border-quipu-500 bg-quipu-500" : "border-white/20"
      )}>
        {selected && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  );
}
