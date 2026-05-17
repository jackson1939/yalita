"use client";

import { useState, useEffect } from "react";

export function useAnimatedNumber(target: number, duration: number = 400) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = value;
    const difference = target - startValue;

    if (difference === 0) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      setValue(Math.round(startValue + difference * progress));
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [target, duration]);

  return value;
}
