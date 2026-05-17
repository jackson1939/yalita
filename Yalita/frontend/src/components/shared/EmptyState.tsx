import { Button } from "@/components/ui";
import Link from "next/link";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  children?: ReactNode;
}

export function EmptyState({ icon = "📭", title, description, action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 space-y-4">
      <div className="text-5xl">{icon}</div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {description && <p className="text-sm text-neutral-400 max-w-sm">{description}</p>}
      </div>
      {action && (
        action.href ? (
          <Link href={action.href}><Button variant="primary" size="md">{action.label}</Button></Link>
        ) : (
          <Button variant="primary" size="md" onClick={action.onClick}>{action.label}</Button>
        )
      )}
      {children}
    </div>
  );
}
