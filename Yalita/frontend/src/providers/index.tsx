"use client";

import { QueryProvider } from "./QueryProvider";
import { PrivyProvider } from "./PrivyProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider>
      <QueryProvider>
        {children}
      </QueryProvider>
    </PrivyProvider>
  );
}
