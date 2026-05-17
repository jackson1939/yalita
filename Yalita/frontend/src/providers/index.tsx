"use client";

import { QueryProvider } from "./QueryProvider";
import { PrivyProvider } from "./PrivyProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <PrivyProvider>
        {children}
      </PrivyProvider>
    </QueryProvider>
  );
}
