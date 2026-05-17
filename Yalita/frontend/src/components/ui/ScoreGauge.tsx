"use client";

import { useEffect, useState } from "react";

export function ScoreGauge({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  // Rango: 300 a 850
  const normalized = Math.min(Math.max(animatedScore, 300), 850);
  const percentage = animatedScore === 0 ? 0 : (normalized - 300) / (850 - 300);
  
  const strokeDasharray = 283; // Circumference of radius 45 (2 * pi * 45)
  const strokeDashoffset = strokeDasharray - percentage * strokeDasharray;

  useEffect(() => {
    let currentScore = 0;
    const targetScore = score;
    const steps = 60;
    const increment = targetScore / steps;
    let stepCount = 0;

    const animate = () => {
      stepCount++;
      currentScore += increment;
      if (stepCount >= steps || currentScore >= targetScore) {
        setAnimatedScore(targetScore);
      } else {
        setAnimatedScore(Math.round(currentScore));
        requestAnimationFrame(animate);
      }
    };

    const timeout = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 100);

    return () => clearTimeout(timeout);
  }, [score]);

  return (
    <div className="relative flex flex-col items-center justify-center w-48 h-48 mx-auto">
      <svg className="w-full h-full transform -rotate-90 score-glow" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          strokeWidth="8"
          fill="transparent"
          style={{ stroke: "var(--y-border)" }}
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          className="transition-all duration-75 ease-linear"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ stroke: "var(--y-aqua)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center animate-score-reveal">
        <span className="font-lora text-6xl tracking-tighter" style={{ color: "var(--y-aqua)" }}>
          {animatedScore === 0 ? "-" : animatedScore}
        </span>
        <span className="text-xs mt-1" style={{ color: "var(--y-text-on-dark-muted)" }}>Tu puntaje financiero</span>
      </div>
    </div>
  );
}
