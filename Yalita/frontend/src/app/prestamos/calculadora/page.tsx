"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { ImpactTable } from "@/components/ui/ImpactTable";
import { useQuipuStore } from "@/stores/quipu.store";

export default function CalculadoraPrestamos() {
  const [mounted, setMounted] = useState(false);
  const [monto, setMonto] = useState(1000);
  const [plazo, setPlazo] = useState(3);

  const activeLoan = useQuipuStore((s) => s.activeLoan);

  // Loan is locked if active and < 50% installments paid
  const isLoanLocked =
    activeLoan?.status === "active" &&
    activeLoan.paidInstallments < Math.ceil(activeLoan.termMonths / 2);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ background: "var(--y-bg)" }} className="min-h-screen" />;

  const plazos = [1, 2, 3, 6];

  return (
    <main style={{ background: "var(--y-bg)" }} className="min-h-screen flex flex-col">
      <header
        className="flex items-center p-6 backdrop-blur-md sticky top-0 z-10"
        style={{
          background: "color-mix(in srgb, var(--y-surface) 80%, transparent)",
          borderBottom: "1px solid var(--y-border)",
        }}
      >
        <Link href="/dashboard" className="mr-4 transition-colors" style={{ color: "var(--y-text-primary)" }}>
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-serif text-2xl" style={{ color: "var(--y-text-primary)" }}>Calculadora</h1>
      </header>

      <div className="flex-1 p-6 space-y-8 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--y-text-primary)" }}>¿Cuánto necesitas?</h2>
          
          {/* Monto Slider */}
          <div
            className="p-6 rounded-2xl shadow-sm mb-6"
            style={{ background: "var(--y-surface)", border: "1px solid var(--y-border)" }}
          >
            <div className="text-center mb-4">
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--y-text-tertiary)" }}>Monto a solicitar</span>
              <div className="font-lora text-4xl mt-1" style={{ color: "var(--y-primary)" }}>Bs {monto.toLocaleString()}</div>
            </div>
            
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              value={monto}
              onChange={(e) => !isLoanLocked && setMonto(Number(e.target.value))}
              disabled={isLoanLocked}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--y-border)" }}
            />
            <div className="flex justify-between mt-2 text-xs font-bold mb-4" style={{ color: "var(--y-text-tertiary)" }}>
              <span>Bs 500</span>
              <span>Bs 10,000</span>
            </div>
            
            <p className="text-[11px] font-medium text-center" style={{ color: "var(--y-text-tertiary)" }}>
              La mayoría de usuarios similares piden entre Bs 2.000 y Bs 5.000
            </p>
          </div>

          {/* Plazo Selector */}
          <div
            className="p-6 rounded-2xl shadow-sm"
            style={{ background: "var(--y-surface)", border: "1px solid var(--y-border)" }}
          >
            <span className="block text-sm font-bold uppercase tracking-wider mb-4 text-center" style={{ color: "var(--y-text-tertiary)" }}>¿En cuánto tiempo lo pagarás?</span>
            <div className="flex space-x-2">
              {plazos.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlazo(p)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: plazo === p ? "var(--y-primary)" : "var(--y-surface-alt)",
                    color: plazo === p ? "var(--y-text-on-primary)" : "var(--y-text-primary)",
                    transform: plazo === p ? "scale(1.05)" : "scale(1)",
                    boxShadow: plazo === p ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                  }}
                >
                  {p} {p === 1 ? "mes" : "meses"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Table */}
        <div className="animate-fade-up">
          <h3 className="text-lg font-bold mb-4" style={{ color: "var(--y-text-primary)" }}>Compara y decide</h3>
          <ImpactTable monto={monto} plazo={plazo} />
        </div>

        <div className="pb-8 pt-4">
          {isLoanLocked ? (
            <div
              className="w-full font-semibold py-4 px-6 rounded-xl text-center flex justify-center items-center gap-2"
              style={{ background: "var(--y-surface-alt)", color: "var(--y-text-tertiary)" }}
            >
              <Lock size={16} />
              <span>Paga el 50% de tu préstamo actual primero</span>
            </div>
          ) : (
            <Link
              href={`/prestamos/solicitar?monto=${monto}&plazo=${plazo}`}
              className="w-full font-semibold py-4 px-6 rounded-xl text-center transition-all flex justify-center items-center space-x-2 shadow-lg animate-shimmer-btn"
              style={{ background: "var(--y-primary)", color: "var(--y-text-on-primary)" }}
            >
              <span>Solicitar este préstamo</span>
              <span className="text-xl">→</span>
            </Link>
          )}
          <p className="text-center text-xs font-medium mt-4" style={{ color: "var(--y-text-tertiary)" }}>
            {isLoanLocked
              ? `Llevas ${activeLoan!.paidInstallments} de ${Math.ceil(activeLoan!.termMonths / 2)} cuotas para desbloquear.`
              : "Sujeto a verificación final del contrato inteligente."}
          </p>
        </div>
      </div>
    </main>
  );
}
