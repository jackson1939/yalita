"use client";

import { useEffect, useState } from "react";
import { getScoreTier } from "@yalita/shared";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const CONFIGS = {
  sm: { width: 120, radius: 44, stroke: 8, font: "text-2xl" },
  md: { width: 180, radius: 68, stroke: 10, font: "text-4xl" },
  lg: { width: 240, radius: 92, stroke: 12, font: "text-6xl" },
};

export function ScoreGauge({ score, size = "md", animated = true }: ScoreGaugeProps) {
  const [display, setDisplay] = useState(animated ? 300 : score);
  const cfg = CONFIGS[size];
  const tier = getScoreTier(score);

  const circumference = 2 * Math.PI * cfg.radius;
  const arcFraction = 240 / 360;
  const dashArray = circumference * arcFraction;
  const progress = animated ? (display - 300) / 550 : (score - 300) / 550;
  const dashOffset = dashArray * (1 - progress);

  useEffect(() => {
    if (!animated) return;
    const start = 300;
    const duration = 1200;
    const startTime = performance.now();
    function update(now: number) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + (score - start) * eased));
      if (t < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }, [score, animated]);

  const half = cfg.width / 2;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: cfg.width, height: cfg.width * 0.7 }}>
        <svg width={cfg.width} height={cfg.width * 0.75} viewBox={`0 0 ${cfg.width} ${cfg.width * 0.75}`} className="overflow-visible">
          <circle cx={half} cy={cfg.width * 0.55} r={cfg.radius} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth={cfg.stroke}
            strokeDasharray={`${dashArray} ${circumference}`} strokeLinecap="round"
            transform={`rotate(150 ${half} ${cfg.width * 0.55})`} />
          <circle cx={half} cy={cfg.width * 0.55} r={cfg.radius} fill="none"
            stroke={tier.color} strokeWidth={cfg.stroke}
            strokeDasharray={`${dashArray} ${circumference}`} strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(150 ${half} ${cfg.width * 0.55})`}
            style={{ transition: "stroke-dashoffset 0.1s ease-out, stroke 0.3s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className={`font-black leading-none ${cfg.font}`} style={{ color: tier.color }}>
            {display}
          </span>
          <span className="text-neutral-500 text-xs mt-0.5">/ 850</span>
        </div>
      </div>
      <div className="px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: `${tier.color}1A`, color: tier.color }}>
        {tier.label}
      </div>
    </div>
  );
}
