"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Lock } from "lucide-react";
import { useQuipuStore } from "@/stores/quipu.store";

export default function OnboardingProfile() {
  const router = useRouter();
  const setUserName = useQuipuStore((s) => s.setUserName);

  const [name, setName] = useState("");
  const [ci, setCi] = useState("");

  const handleCiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 4) setCi(val);
  };

  const isValid = name.trim().length > 2 && ci.length === 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      // Persist name to store before navigating
      setUserName(name.trim());
      router.push("/onboarding/connect");
    }
  };

  return (
    <main style={{ background: "var(--y-bg)" }} className="min-h-screen flex flex-col p-6">
      <header className="mb-8 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span
            className="text-sm font-bold uppercase tracking-wider"
            style={{ color: "var(--y-text-tertiary)" }}
          >
            Paso 3 de 4
          </span>
          <Link href="/onboarding/otp" className="text-sm" style={{ color: "var(--y-text-tertiary)" }}>
            Atrás
          </Link>
        </div>
        <ProgressBar progress={75} />
      </header>

      <div className="flex-1 animate-fade-in">
        <h1 className="font-serif text-3xl mb-2" style={{ color: "var(--y-text-primary)" }}>
          Cuéntanos un poco de ti
        </h1>
        <p className="mb-8 leading-relaxed" style={{ color: "var(--y-text-secondary)" }}>
          Esto nos ayuda a crear tu identidad financiera única.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="space-y-4 mb-6">
            <div>
              <label
                className="block text-sm font-bold mb-2"
                style={{ color: "var(--y-text-primary)" }}
              >
                Nombre completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. María Choque"
                className="w-full px-4 py-4 rounded-xl text-lg font-semibold focus:outline-none transition-colors shadow-sm"
                style={{
                  background: "var(--y-surface)",
                  border: `2px solid ${name.length > 2 ? "var(--y-green)" : "var(--y-border)"}`,
                  color: "var(--y-text-primary)",
                }}
                autoFocus
              />
            </div>

            <div>
              <label
                className="block text-sm font-bold mb-2"
                style={{ color: "var(--y-text-primary)" }}
              >
                Últimos 4 dígitos de tu CI
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={ci}
                onChange={handleCiChange}
                placeholder="Ej. 4567"
                className="w-full px-4 py-4 rounded-xl text-lg font-semibold focus:outline-none transition-colors shadow-sm"
                style={{
                  background: "var(--y-surface)",
                  border: `2px solid ${ci.length === 4 ? "var(--y-green)" : "var(--y-border)"}`,
                  color: "var(--y-text-primary)",
                }}
              />
            </div>
          </div>

          <div
            className="flex items-center gap-2 p-3 rounded-xl mb-8"
            style={{ background: "var(--y-green-light)", border: "1px solid var(--y-green)" }}
          >
            <Lock size={14} style={{ color: "var(--y-green)", flexShrink: 0 }} />
            <p className="text-xs font-medium" style={{ color: "var(--y-green)" }}>
              Tus datos viajan cifrados y nunca se venden ni comparten.
            </p>
          </div>

          <div className="mt-auto pb-4">
            <button
              type="submit"
              disabled={!isValid}
              className="w-full font-semibold py-4 px-6 rounded-xl text-center transition-all"
              style={{
                background: isValid ? "var(--y-primary)" : "var(--y-surface-alt)",
                color: isValid ? "var(--y-text-on-dark)" : "var(--y-text-tertiary)",
              }}
            >
              Continuar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
