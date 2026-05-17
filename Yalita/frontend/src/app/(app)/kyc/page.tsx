"use client";

// ──────────────────────────────────────────────────────────────────────────────
// KYC Flow — Verificación de Identidad
// ──────────────────────────────────────────────────────────────────────────────
// Stages:
//   1. intro      → explica beneficios del KYC verificado
//   2. front      → captura/upload de C.I. anverso
//   3. back       → captura/upload de C.I. reverso
//   4. selfie     → selfie con C.I. en mano
//   5. processing → "validando" (simulado por ahora)
//   6. success    → C.I. verificada, beneficios desbloqueados
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Camera, RefreshCw, CheckCircle2, AlertCircle, Upload } from "lucide-react";
import { useQuipuStore } from "@/stores/quipu.store";

type Stage = "intro" | "front" | "back" | "selfie" | "processing" | "success";

export default function KycPage() {
  const router = useRouter();
  const verifyCi = useQuipuStore((s) => s.verifyCi);
  const isCiVerified = useQuipuStore((s) => s.isCiVerified);
  const userName = useQuipuStore((s) => s.userName);

  const [stage, setStage] = useState<Stage>(isCiVerified ? "success" : "intro");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    setStage("processing");
    setError(null);
    // Simulación de validación AML/KYC (1.8s)
    await new Promise((r) => setTimeout(r, 1800));
    verifyCi();
    setStage("success");
  };

  return (
    <main style={{ background: "var(--y-bg)" }} className="min-h-screen pb-24">
      {/* Header */}
      <header
        className="flex items-center p-6 sticky top-0 z-10 backdrop-blur-md"
        style={{
          background: "color-mix(in srgb, var(--y-surface) 80%, transparent)",
          borderBottom: "1px solid var(--y-border)",
        }}
      >
        <Link href="/perfil" className="mr-4" style={{ color: "var(--y-text-primary)" }}>
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
          <h1 className="font-serif text-2xl" style={{ color: "var(--y-text-primary)" }}>
            Verificación de Identidad
          </h1>
          <p className="text-xs" style={{ color: "var(--y-text-tertiary)" }}>
            KYC on-chain · Soulbound NFT
          </p>
        </div>
      </header>

      <div className="p-6">
        {/* Progress */}
        {stage !== "intro" && stage !== "success" && (
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {(["front", "back", "selfie", "processing"] as Stage[]).map((s, i) => (
              <div
                key={s}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: ["front", "back", "selfie", "processing"].indexOf(stage) === i ? 32 : 8,
                  background: ["front", "back", "selfie", "processing"].indexOf(stage) >= i ? "var(--y-primary)" : "var(--y-border)",
                }}
              />
            ))}
          </div>
        )}

        {stage === "intro" && (
          <IntroStage onStart={() => setStage("front")} />
        )}

        {stage === "front" && (
          <CaptureStage
            title="Carnet de Identidad — Anverso"
            description="Lado con tu foto y datos personales"
            instructions={[
              "Coloca tu CI sobre superficie plana, oscura",
              "Buena iluminación, sin reflejos",
              "Todos los bordes deben verse",
            ]}
            currentImage={frontImage}
            onCapture={setFrontImage}
            onContinue={() => setStage("back")}
            onBack={() => setStage("intro")}
            type="document"
          />
        )}

        {stage === "back" && (
          <CaptureStage
            title="Carnet de Identidad — Reverso"
            description="Lado con el código de barras o chip"
            instructions={[
              "Mismas condiciones que el anverso",
              "El código de barras debe ser legible",
            ]}
            currentImage={backImage}
            onCapture={setBackImage}
            onContinue={() => setStage("selfie")}
            onBack={() => setStage("front")}
            type="document"
          />
        )}

        {stage === "selfie" && (
          <CaptureStage
            title="Selfie con tu C.I."
            description="Sosten tu CI cerca de tu cara"
            instructions={[
              "Tu rostro y el CI completos en la foto",
              "Sin gorra, lentes oscuros ni mascarilla",
              "Buena iluminación frontal",
            ]}
            currentImage={selfieImage}
            onCapture={setSelfieImage}
            onContinue={handleProcess}
            onBack={() => setStage("back")}
            type="selfie"
          />
        )}

        {stage === "processing" && (
          <ProcessingStage />
        )}

        {stage === "success" && (
          <SuccessStage userName={userName} onContinue={() => router.push("/perfil")} />
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl flex items-center gap-2" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <AlertCircle size={16} style={{ color: "#EF4444" }} />
            <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>
          </div>
        )}
      </div>
    </main>
  );
}

// ── INTRO ────────────────────────────────────────────────────────────────────
function IntroStage({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{ background: "rgba(44,180,98,0.12)" }}>
          <ShieldCheck size={40} style={{ color: "var(--y-green)" }} />
        </div>
        <h2 className="font-serif text-2xl mb-2" style={{ color: "var(--y-text-primary)" }}>
          Verifica tu identidad on-chain
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--y-text-secondary)" }}>
          Tu C.I. verificada queda como un NFT Soulbound en Avalanche. Desbloquea préstamos más grandes y tasas mejores.
        </p>
      </div>

      <div className="rounded-2xl p-5 space-y-4" style={{ background: "var(--y-surface)", border: "1px solid var(--y-border)" }}>
        <h3 className="font-bold text-sm" style={{ color: "var(--y-text-primary)" }}>
          ¿Qué ganas verificándote?
        </h3>
        <BenefitItem
          emoji="📈"
          title="Límite de crédito hasta Bs 8.000"
          desc="Sin verificar el máximo es Bs 1.500"
        />
        <BenefitItem
          emoji="💰"
          title="Tasas de interés más bajas"
          desc="Ahorra hasta 1.5% mensual en tus préstamos"
        />
        <BenefitItem
          emoji="🛡️"
          title="Cumplimiento AML/KYC on-chain"
          desc="Tu verificación es un NFT no transferible"
        />
        <BenefitItem
          emoji="🤝"
          title="Tracks KYC + Identidad Digital"
          desc="Acceso prioritario al ecosistema Yalita"
        />
      </div>

      <div className="p-4 rounded-xl" style={{ background: "rgba(44,180,98,0.08)", border: "1px solid rgba(44,180,98,0.25)" }}>
        <p className="text-xs leading-relaxed" style={{ color: "var(--y-green)" }}>
          <strong>🔒 Privacidad:</strong> Las fotos se procesan localmente en tu navegador. Solo el hash SHA-256 (no la imagen) se registra on-chain. Tus datos personales nunca tocan nuestros servidores.
        </p>
      </div>

      <button
        onClick={onStart}
        className="w-full py-4 rounded-xl font-bold transition-all active:scale-[0.97]"
        style={{ background: "var(--y-primary)", color: "var(--y-text-on-dark)" }}
      >
        Empezar verificación →
      </button>
    </div>
  );
}

function BenefitItem({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-2xl shrink-0">{emoji}</span>
      <div>
        <p className="font-semibold text-sm" style={{ color: "var(--y-text-primary)" }}>{title}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--y-text-secondary)" }}>{desc}</p>
      </div>
    </div>
  );
}

// ── CAPTURE ──────────────────────────────────────────────────────────────────
function CaptureStage({ title, description, instructions, currentImage, onCapture, onContinue, onBack, type }: {
  title: string;
  description: string;
  instructions: string[];
  currentImage: string | null;
  onCapture: (img: string) => void;
  onContinue: () => void;
  onBack: () => void;
  type: "document" | "selfie";
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => onCapture(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5 animate-fadeInUp">
      <div>
        <h2 className="font-serif text-2xl mb-1" style={{ color: "var(--y-text-primary)" }}>{title}</h2>
        <p className="text-sm" style={{ color: "var(--y-text-secondary)" }}>{description}</p>
      </div>

      {/* Capture frame */}
      {currentImage ? (
        <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: type === "selfie" ? "3/4" : "16/10", border: "2px solid var(--y-green)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentImage} alt="Captured" className="w-full h-full object-cover" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-3 right-3 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg"
            style={{ background: "rgba(0,0,0,0.7)", color: "white" }}
          >
            <RefreshCw size={12} /> Volver a tomar
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-2xl flex flex-col items-center justify-center transition-all hover:scale-[0.99] active:scale-[0.97]"
          style={{
            aspectRatio: type === "selfie" ? "3/4" : "16/10",
            background: "var(--y-surface-alt)",
            border: "2px dashed var(--y-border)",
            color: "var(--y-text-tertiary)",
          }}
        >
          {type === "selfie" ? <Camera size={48} /> : <Upload size={48} />}
          <p className="font-semibold mt-3 text-sm">
            {type === "selfie" ? "Tomar selfie" : "Subir o tomar foto"}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--y-text-tertiary)" }}>
            JPG o PNG, máx 5 MB
          </p>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture={type === "selfie" ? "user" : "environment"}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Instructions */}
      <div className="rounded-xl p-4" style={{ background: "var(--y-surface)", border: "1px solid var(--y-border)" }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--y-text-tertiary)" }}>
          Para que salga bien:
        </p>
        <ul className="space-y-1.5">
          {instructions.map((ins, i) => (
            <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--y-text-secondary)" }}>
              <span style={{ color: "var(--y-green)" }}>✓</span>
              <span>{ins}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all"
          style={{ background: "var(--y-surface-alt)", color: "var(--y-text-primary)" }}
        >
          Atrás
        </button>
        <button
          onClick={onContinue}
          disabled={!currentImage}
          className="flex-[2] py-3.5 rounded-xl font-bold text-sm transition-all"
          style={{
            background: currentImage ? "var(--y-primary)" : "var(--y-surface-alt)",
            color: currentImage ? "var(--y-text-on-dark)" : "var(--y-text-tertiary)",
          }}
        >
          {type === "selfie" ? "Verificar identidad" : "Continuar →"}
        </button>
      </div>
    </div>
  );
}

// ── PROCESSING ───────────────────────────────────────────────────────────────
function ProcessingStage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--y-primary)", borderTopColor: "transparent" }} />
        <div className="absolute inset-3 flex items-center justify-center">
          <ShieldCheck size={32} style={{ color: "var(--y-primary)" }} />
        </div>
      </div>
      <div className="text-center">
        <h3 className="font-serif text-xl mb-1" style={{ color: "var(--y-text-primary)" }}>
          Validando tu identidad...
        </h3>
        <p className="text-sm" style={{ color: "var(--y-text-secondary)" }}>
          Verificación AML/KYC en proceso
        </p>
      </div>
      <ul className="space-y-2 text-xs w-full max-w-xs">
        <ProcessStep done text="Detección de bordes del documento" />
        <ProcessStep done text="OCR de datos personales" />
        <ProcessStep done text="Match facial con selfie" />
        <ProcessStep loading text="Cross-check con base AML" />
        <ProcessStep text="Generación de NFT Soulbound" />
      </ul>
    </div>
  );
}

function ProcessStep({ done, loading, text }: { done?: boolean; loading?: boolean; text: string }) {
  return (
    <li className="flex items-center gap-2.5" style={{ color: done ? "var(--y-green)" : "var(--y-text-tertiary)" }}>
      {done ? <CheckCircle2 size={14} /> : loading ? (
        <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--y-primary)", borderTopColor: "transparent" }} />
      ) : (
        <div className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: "var(--y-border)" }} />
      )}
      <span>{text}</span>
    </li>
  );
}

// ── SUCCESS ──────────────────────────────────────────────────────────────────
function SuccessStage({ userName, onContinue }: { userName: string; onContinue: () => void }) {
  return (
    <div className="space-y-6 animate-fadeInUp text-center">
      <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center" style={{ background: "rgba(44,180,98,0.15)" }}>
        <CheckCircle2 size={56} style={{ color: "var(--y-green)" }} />
      </div>
      <div>
        <h2 className="font-serif text-2xl mb-1" style={{ color: "var(--y-text-primary)" }}>
          ¡Identidad verificada!
        </h2>
        <p className="text-sm" style={{ color: "var(--y-text-secondary)" }}>
          Bienvenido(a) al ecosistema Yalita, <strong>{userName}</strong>
        </p>
      </div>

      <div className="rounded-2xl p-5 space-y-3 text-left" style={{ background: "var(--y-surface)", border: "1px solid var(--y-border)" }}>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--y-text-tertiary)" }}>
          Beneficios desbloqueados
        </p>
        <UnlockedItem text="Límite hasta Bs 8.000" />
        <UnlockedItem text="Tasas preferenciales (-1.5%/mes)" />
        <UnlockedItem text="NFT KYC Soulbound mintado" />
        <UnlockedItem text="Track Identidad Digital · OK" />
      </div>

      <button
        onClick={onContinue}
        className="w-full py-4 rounded-xl font-bold transition-all active:scale-[0.97]"
        style={{ background: "var(--y-primary)", color: "var(--y-text-on-dark)" }}
      >
        Ir a mi perfil
      </button>
    </div>
  );
}

function UnlockedItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <CheckCircle2 size={16} style={{ color: "var(--y-green)" }} />
      <span style={{ color: "var(--y-text-primary)" }}>{text}</span>
    </div>
  );
}
