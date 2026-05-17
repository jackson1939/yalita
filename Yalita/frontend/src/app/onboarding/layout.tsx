"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative overflow-hidden w-full min-h-screen">
      <div 
        key={pathname}
        className={`w-full min-h-screen ${mounted ? "animate-slideLeft" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
