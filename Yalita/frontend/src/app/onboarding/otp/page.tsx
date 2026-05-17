"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { OTPInput } from "@/components/ui/OTPInput";
import { CheckCircle2 } from "lucide-react";

export default function OnboardingOTP() {
  const router = useRouter();
  const [timer, setTimer] = useState(45);
  const [status, setStatus] = useState<"default" | "verifying" | "error" | "success">("default");

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleComplete = (otp: string) => {
    setStatus("verifying");
    setTimeout(() => {
      if (otp === "123456") {
        setStatus("success");
        setTimeout(() => router.push("/onboarding/profile"), 1500);
      } else {
        setStatus("error");
      }
    }, 1500);
  };

  return (
    <main style={{ background: "var(--y-bg)" }} className="min-h-screen flex flex-col p-6">
      <header className="mb-8 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--y-text-tertiary)" }}>Paso 2 de 4</span>
          <Link href="/onboarding" className="text-sm" style={{ color: "var(--y-text-tertiary)" }}>Atrás</Link>
        </div>
        <ProgressBar progress={50} />
      </header>

      <div className="flex-1 animate-fade-in flex flex-col">
        <h1 className="font-serif text-3xl mb-2" style={{ color: "var(--y-text-primary)" }}>Ingresa el código que te enviamos</h1>
        <p className="mb-8 leading-relaxed" style={{ color: "var(--y-text-secondary)" }}>
          Lo enviamos al <span className="font-semibold" style={{ color: "var(--y-text-primary)" }}>+591 7X XXX XXXX</span>
        </p>

        <div className="mb-8 flex justify-center">
          {status === "verifying" ? (
            <div className="flex justify-between space-x-2 animate-pulse w-full max-w-[320px]">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-12 h-14 rounded-xl" style={{ background: "var(--y-surface-alt)" }} />
              ))}
            </div>
          ) : status === "success" ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-4 animate-fade-in" style={{ color: "var(--y-green)" }}>
              <CheckCircle2 size={48} className="animate-score-reveal" />
              <p className="font-bold text-lg">¡Código verificado!</p>
            </div>
          ) : (
            <OTPInput onComplete={handleComplete} isError={status === "error"} />
          )}
        </div>

        {status === "error" && (
          <p className="text-center text-sm font-medium mb-4 animate-fade-in" style={{ color: "var(--y-primary)" }}>
            Código incorrecto. Intenta con "123456".
          </p>
        )}

        <div className="mt-auto pb-4 text-center">
          {timer > 0 ? (
            <p className="text-sm font-medium" style={{ color: "var(--y-text-tertiary)" }}>Reenviar código en 0:{timer.toString().padStart(2, "0")}</p>
          ) : (
            <button 
              onClick={() => { setTimer(45); setStatus("default"); }} 
              className="font-bold text-sm hover:underline"
              style={{ color: "var(--y-primary)" }}
            >
              Reenviar código
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
