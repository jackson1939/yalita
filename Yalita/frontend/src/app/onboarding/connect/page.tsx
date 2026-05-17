"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProviderCard } from "@/components/ui/ProviderCard";
import { mockProviders } from "@/lib/mock-data";

type ConnectionStatus = "disconnected" | "pending" | "connected";
type OnboardingProvider = {
  id: string;
  name: string;
  type: string;
  status: ConnectionStatus;
};

export default function OnboardingConnect() {
  const router = useRouter();
  const [providers, setProviders] = useState<OnboardingProvider[]>(
    mockProviders.map((p) => ({ ...p, status: "disconnected" })),
  );

  const hasConnected = providers.some(p => p.status === "connected");

  const handleConnect = (id: string) => {
    setProviders(prev => prev.map(p => {
      if (p.id === id) {
        if (p.status === "disconnected") return { ...p, status: "pending" };
        return p;
      }
      return p;
    }));

    setTimeout(() => {
      setProviders(prev => prev.map(p => p.id === id ? { ...p, status: "connected" } : p));
    }, 2000);
  };

  const handleFinish = () => {
    router.push("/onboarding/analyzing");
  };

  return (
    <main style={{ background: "var(--y-bg)" }} className="min-h-screen flex flex-col p-6">
      <header className="mb-8 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--y-text-tertiary)" }}>Paso 4 de 4</span>
          <Link href="/onboarding/profile" className="text-sm" style={{ color: "var(--y-text-tertiary)" }}>Atrás</Link>
        </div>
        <ProgressBar progress={100} />
      </header>

      <div className="flex-1 animate-fade-in flex flex-col">
        <h1 className="font-serif text-3xl mb-2" style={{ color: "var(--y-text-primary)" }}>Conecta tu historial de pagos</h1>
        <p className="mb-6 leading-relaxed" style={{ color: "var(--y-text-secondary)" }}>
          Así calculamos tu puntaje. Tus datos no se guardan en nuestros servidores.
        </p>

        <div className="space-y-3 mb-6">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              name={provider.name}
              icon={<span className="font-serif text-xl" style={{ color: "var(--y-primary)" }}>{provider.name.charAt(0)}</span>}
              status={provider.status}
              onClick={() => handleConnect(provider.id)}
            />
          ))}
        </div>

        <p className="text-center text-sm font-medium mb-8" style={{ color: "var(--y-text-tertiary)" }}>
          Puedes conectar más tarde desde tu perfil
        </p>

        <div className="mt-auto pb-4">
          <button
            onClick={handleFinish}
            disabled={!hasConnected}
            className="w-full font-semibold py-4 px-6 rounded-xl text-center transition-all flex justify-center items-center space-x-2"
            style={{
              background: hasConnected ? "var(--y-primary)" : "var(--y-surface-alt)",
              color: hasConnected ? "var(--y-text-on-dark)" : "var(--y-text-tertiary)",
            }}
          >
            <span>Calcular mi puntaje</span>
            <span className="text-xl">→</span>
          </button>
        </div>
      </div>
    </main>
  );
}
