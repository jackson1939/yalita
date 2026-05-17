import { motion } from "framer-motion";

type ScoreBreakdownProps = {
  monthlyVolumeBs?: number;
  monthlyTxs?: number;
  monthsHistory?: number;
  weeklyConsistencyPct?: number;
};

type Factor = {
  emoji: string;
  label: string;
  weight: number;
  targetLabel: string;
  currentLabel: string;
  progress: number;
};

function getProgressColor(progress: number) {
  if (progress > 70) return "bg-quipu-accent";
  if (progress >= 40) return "bg-quipu-secondary";
  return "bg-quipu-primary";
}

export function ScoreBreakdown({
  monthlyVolumeBs = 34_500,
  monthlyTxs = 24,
  monthsHistory = 8,
  weeklyConsistencyPct = 72,
}: ScoreBreakdownProps) {
  const factors: Factor[] = [
    {
      emoji: "💰",
      label: "Volumen de cobros",
      weight: 35,
      targetLabel: "Meta: Bs 50,000/mes",
      currentLabel: `Actual: Bs ${monthlyVolumeBs.toLocaleString("es-BO")}/mes`,
      progress: Math.min(100, (monthlyVolumeBs / 50_000) * 100),
    },
    {
      emoji: "📊",
      label: "Frecuencia de pagos",
      weight: 25,
      targetLabel: "Meta: 30 transacciones/mes",
      currentLabel: `Actual: ${monthlyTxs.toLocaleString("es-BO")} transacciones/mes`,
      progress: Math.min(100, (monthlyTxs / 30) * 100),
    },
    {
      emoji: "📅",
      label: "Antigüedad",
      weight: 20,
      targetLabel: "Meta: 12 meses de historial",
      currentLabel: `Actual: ${monthsHistory.toLocaleString("es-BO")} meses`,
      progress: Math.min(100, (monthsHistory / 12) * 100),
    },
    {
      emoji: "🔄",
      label: "Consistencia",
      weight: 15,
      targetLabel: "Meta: cobros regulares cada semana",
      currentLabel: `Actual: ${Math.round(weeklyConsistencyPct)}% de regularidad`,
      progress: Math.max(0, Math.min(100, weeklyConsistencyPct)),
    },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl divide-y divide-white/5">
      {factors.map((item, idx) => (
        <div key={item.label} className="px-4 py-3.5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-white font-medium">
              <span className="mr-2">{item.emoji}</span>
              {item.label}
            </p>
            <span className="text-xs text-neutral-500">{item.weight}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${getProgressColor(item.progress)}`}
              initial={{ width: 0 }}
              animate={{ width: `${item.progress}%` }}
              transition={{ duration: 0.6, delay: idx * 0.08, ease: "easeOut" }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-neutral-500">
            <span>{item.currentLabel}</span>
            <span>{item.targetLabel}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
