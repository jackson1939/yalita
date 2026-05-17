"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useQuipuStore } from "@/stores/quipu.store";

export default function OnboardingPhone() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setUserPhone = useQuipuStore((s) => s.setUserPhone);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 8) {
      setPhone(val);
    }
  };

  const isValid = phone.length === 8 && /^[67]\d{7}$/.test(phone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      setIsLoading(true);
      // Persist phone before navigating so it survives back-navigation
      setUserPhone(`+591 ${phone}`);
      setTimeout(() => {
        router.push("/onboarding/otp");
      }, 1000);
    }
  };

  return (
    <main style={{ background: "var(--y-bg)" }} className="min-h-screen flex flex-col p-6">
      <header className="mb-8 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--y-text-tertiary)" }}>Paso 1 de 4</span>
          <Link href="/" className="text-sm" style={{ color: "var(--y-text-tertiary)" }}>Cancelar</Link>
        </div>
        <ProgressBar progress={25} />
      </header>

      <div className="flex-1 animate-fade-in">
        <h1 className="font-serif text-3xl mb-2" style={{ color: "var(--y-text-primary)" }}>¿Cuál es tu número de celular?</h1>
        <p className="mb-8 leading-relaxed" style={{ color: "var(--y-text-secondary)" }}>
          Te enviaremos un código para confirmar que eres tú
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="font-semibold text-lg" style={{ color: "var(--y-text-primary)" }}>+591</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="71234567"
              className="w-full pl-16 pr-4 py-4 rounded-xl text-lg font-semibold focus:outline-none transition-colors shadow-sm"
              style={{
                background: "var(--y-surface)",
                border: "2px solid var(--y-border)",
                color: "var(--y-text-primary)",
              }}
              autoFocus
            />
          </div>
          
          {phone.length > 0 && !isValid && phone.length === 8 && (
            <p className="text-sm mb-4 font-medium" style={{ color: "var(--y-primary)" }}>Ingresa un número boliviano válido.</p>
          )}

          <div className="mt-auto pb-4 space-y-4">
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full font-semibold py-4 px-6 rounded-xl text-center transition-all flex justify-center items-center h-[56px]"
              style={{
                background: isValid && !isLoading ? "var(--y-primary)" : "var(--y-surface-alt)",
                color: isValid && !isLoading ? "var(--y-text-on-dark)" : "var(--y-text-tertiary)",
              }}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" style={{ color: "var(--y-text-on-dark)" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Enviar código"
              )}
            </button>
            <p className="text-center">
              <button type="button" className="font-medium text-sm" style={{ color: "var(--y-primary)" }}>
                ¿No tienes celular? Usa tu email
              </button>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
