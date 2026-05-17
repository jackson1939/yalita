"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useYalitaAuth } from "@/hooks/useYalitaAuth";
import { IS_DEMO_AUTH } from "@/lib/env";

export default function OnboardingPhone() {
  const router = useRouter();
  const { sendCode } = useYalitaAuth();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 8) {
      setPhone(val);
      if (error) setError(null);
    }
  };

  // Boliviano válido: 6XXXXXXX o 7XXXXXXX, 8 dígitos
  const isValid = phone.length === 8 && /^[67]\d{7}$/.test(phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setIsLoading(true);
    setError(null);

    const phoneE164 = `+591${phone}`;
    const ok = await sendCode(phoneE164);

    if (ok) {
      // Persistir el teléfono pendiente para que la pantalla OTP lo conozca
      if (typeof window !== "undefined") {
        sessionStorage.setItem("yalita-pending-phone", phoneE164);
      }
      router.push("/onboarding/otp");
    } else {
      setError("No pudimos enviar el código. Verifica tu número e intenta de nuevo.");
      setIsLoading(false);
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
            Paso 1 de 4
          </span>
          <Link href="/" className="text-sm" style={{ color: "var(--y-text-tertiary)" }}>
            Cancelar
          </Link>
        </div>
        <ProgressBar progress={25} />
      </header>

      <div className="flex-1 animate-fade-in">
        <h1 className="font-serif text-3xl mb-2" style={{ color: "var(--y-text-primary)" }}>
          ¿Cuál es tu número de celular?
        </h1>
        <p className="mb-2 leading-relaxed" style={{ color: "var(--y-text-secondary)" }}>
          Te enviaremos un código por SMS para confirmar que eres tú.
        </p>
        <p className="mb-8 text-xs" style={{ color: "var(--y-text-tertiary)" }}>
          Solo aceptamos números bolivianos (+591) que empiecen con 6 o 7.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="font-semibold text-lg" style={{ color: "var(--y-text-primary)" }}>+591</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="71234567"
              inputMode="numeric"
              autoComplete="tel-national"
              className="w-full pl-16 pr-4 py-4 rounded-xl text-lg font-semibold focus:outline-none transition-colors shadow-sm"
              style={{
                background: "var(--y-surface)",
                border: `2px solid ${isValid ? "var(--y-green)" : "var(--y-border)"}`,
                color: "var(--y-text-primary)",
              }}
              autoFocus
            />
          </div>

          {phone.length === 8 && !isValid && (
            <p className="text-sm mb-4 font-medium" style={{ color: "var(--y-primary)" }}>
              Ingresa un número boliviano válido (debe empezar con 6 o 7).
            </p>
          )}
          {error && (
            <p className="text-sm mb-4 font-medium" style={{ color: "var(--y-primary)" }}>
              {error}
            </p>
          )}

          {IS_DEMO_AUTH && (
            <div
              className="text-xs px-3 py-2 rounded-lg mb-4"
              style={{ background: "var(--y-surface-alt)", color: "var(--y-text-tertiary)" }}
            >
              <strong>Modo demo:</strong> el código será <code>123456</code> (no llega SMS real)
            </div>
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
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                "Enviar código"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
