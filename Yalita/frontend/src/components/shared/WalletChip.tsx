import { shortenAddress, cn } from "@/lib/utils";

interface WalletChipProps {
  address: string;
  connected?: boolean;
  className?: string;
}

export function WalletChip({ address, connected = true, className }: WalletChipProps) {
  return (
    <div className={cn("inline-flex items-center gap-2 bg-white/5 border border-white/8 rounded-lg px-3 py-1.5", className)}>
      <span className={cn("w-2 h-2 rounded-full", connected ? "bg-quipu-500" : "bg-neutral-500")} />
      <span className="text-xs text-neutral-400 font-mono">{shortenAddress(address)}</span>
    </div>
  );
}
