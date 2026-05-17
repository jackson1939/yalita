"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { OTPInput } from "@/components/ui/OTPInput";
import { CheckCircle2 } from "lucide-react";
import { useYalitaAuth } from "@/hooks/useYalitaAuth";
import { IS_DEMO_AUTH } from "@/lib/env";

export default function OnboardingOTP() {
  const router = useRouter();
  const { sendCode, verifyCode } = useYalitaAuth();

  const [timer, setTimer] = useState(45);
  const [status, setStatus] = useState<"default" | "verifying" | "error" | "success">("default");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [phone, setPhone] = useState<string>("");

  useEffect(() => {
    // Recuperar el teléfono al que se envió el código
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("yalita-pending-phone") ?? "";
      setPhone(stored);
      // Si no hay teléfono pendiente, regresar al paso 1
      if (!stored) router.replace("/onboarding");
    }
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleComplete = async (otp: string) => {
    setStatus("verifying");
    setErrorMsg(null);

    const wallet = await verifyCode(otp);

    if (wallet) {
      setStatus("success");
      setTimeout(() => router.push("/onboarding/profile"), 1200);
    } else {
      setStatus("error");
      setErrorMsg(
        IS_DEMO_AUTH
          ? "Código incorrecto. Usa 123456 en modo demo."
          : "El código no es válido o ya expiró. Pide uno nuevo."
      );
    }
  };

  const handleResend = async () => {
    if (!phone) return;
    setStatus("default");
    setErrorMsg(null);
    setTimer(45);
    await sendCode(phone);
  };

  // Máscara visual: +591 7X XXX XXXX
  const maskedPhone = phone
    ? phone.replace(/^(\+\d{3})(\d)(\d{2})(\d{2})(\d{2})$/, "$1 $2$3 $4 $5")
    : "+591 7X XXX XXXX";

  return (
    <main style={{ background: "var(--y-bg)" }} className="min-h-screen flex flex-col p-6">
      <header className="mb-8 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span
            className="text-sm font-bold uppercase tracking-wider"
            style={{ color: "var(--y-text-tertiary)" }}
          >
            Paso 2 de 4
          </span>
          <Link href="/onboarding" className="text-sm" style={{ color: "var(--y-text-tertiary)" }}>
            Atrás
          </Link>
        </div>
        <ProgressBar progress={50} />
      </header>

      <div className="flex-1 animate-fade-in flex flex-col">
        <h1 className="font-serif text-3xl mb-2" style={{ color: "var(--y-text-primary)" }}>
          Ingresa el código que te enviamos
        </h1>
        <p className="mb-8 leading-relaxed" style={{ color: "var(--y-text-secondary)" }}>
          Lo enviamos al{" "}
          <span className="font-semibold" style={{ color: "var(--y-text-primary)" }}>
            {maskedPhone}
          </span>
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
              <p className="text-xs" style={{ color: "var(--y-text-tertiary)" }}>
                Creando tu billetera segura...
              </p>
            </div>
          ) : (
            <OTPInput onComplete={handleComplete} isError={status === "error"} />
          )}
        </div>

        {status === "error" && errorMsg && (
          <p className="text-center text-sm font-medium mb-4 animate-fade-in" style={{ color: "var(--y-primary)" }}>
            {errorMsg}
          </p>
        )}

        <div className="mt-auto pb-4 text-center">
          {timer > 0 ? (
            <p className="text-sm font-medium" style={{ color: "var(--y-text-tertiary)" }}>
              Reenviar código en 0:{timer.toString().padStart(2, "0")}
            </p>
          ) : (
            <button
              onClick={handleResend}
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
