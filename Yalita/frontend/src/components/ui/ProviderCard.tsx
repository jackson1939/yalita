import { CheckCircle2, ChevronRight, Clock } from "lucide-react";

interface ProviderCardProps {
  name: string;
  icon: React.ReactNode;
  status: "connected" | "pending" | "disconnected";
  onClick?: () => void;
}

export function ProviderCard({ name, icon, status, onClick }: ProviderCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={status === "connected"}
      className="w-full flex items-center justify-between p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow disabled:cursor-not-allowed"
      style={{
        background: "var(--y-surface)",
        border: "1px solid var(--y-border)",
      }}
    >
      <div className="flex items-center space-x-4">
        <div
          className="w-10 h-10 flex items-center justify-center rounded-full"
          style={{ background: "var(--y-surface-alt)" }}
        >
          {icon}
        </div>
        <span className="font-semibold" style={{ color: "var(--y-text-primary)" }}>{name}</span>
      </div>
      
      <div>
        {status === "connected" && (
          <div
            className="flex items-center space-x-1 px-3 py-1 rounded-full"
            style={{ background: "var(--y-green-light)", border: "1px solid var(--y-green)" }}
          >
            <CheckCircle2 size={14} style={{ color: "var(--y-green)" }} />
            <span className="text-xs font-bold" style={{ color: "var(--y-green)" }}>Conectado</span>
          </div>
        )}
        {status === "pending" && (
          <div
            className="flex items-center space-x-1 px-3 py-1 rounded-full"
            style={{ background: "rgba(245,158,11,0.12)", border: "1px solid var(--y-amber)" }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--y-amber)" }} />
            <span className="text-xs font-bold" style={{ color: "var(--y-amber)" }}>Pendiente</span>
          </div>
        )}
        {status === "disconnected" && (
          <div className="flex items-center space-x-1" style={{ color: "var(--y-primary)" }}>
            <span className="text-sm font-medium">Conectar</span>
            <ChevronRight size={16} />
          </div>
        )}
      </div>
    </button>
  );
}
