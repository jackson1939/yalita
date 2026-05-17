"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui";

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[40vh] flex items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-sm">
            <p className="text-4xl">⚠️</p>
            <h3 className="text-lg font-bold text-white">Algo salió mal</h3>
            <p className="text-sm text-neutral-400">{this.state.error?.message}</p>
            <Button variant="outline" onClick={() => this.setState({ hasError: false })}>
              Intentar de nuevo
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
