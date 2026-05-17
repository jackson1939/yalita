// Re-export desde shared para conveniencia
export type * from "@yalita/shared";

// Tipos exclusivos de UI
import type { ReactNode } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon?: ReactNode;
  badge?: string;
  isActive?: boolean;
}

export interface ComparisonRow {
  label: string;
  rate: string;
  totalDue: bigint;
  highlight: "red" | "yellow" | "green" | "neutral";
}
