"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Mail, Check, Smartphone, Building2, Lock, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { IS_DEMO_RECLAIM } from "@/lib/env";

// Tipo mínimo del SDK Reclaim para evitar dependencia de tipos al build
interface ReclaimProofRequest {
  getRequestUrl: () => Promise<string>;
  startSession: (callbacks: { onSuccess: (p: unknown) => void; onError: (e: Error) => void }) => Promise<void>;
}

type ProviderStatus = "idle" | "requesting" | "scanning" | "connected" | "error";

interface Provider {
  id: "gmail_yape" | "tigo_money" | "simple_bank";
  name: string;
  description: string;
  status: ProviderStatus;
  icon: React.ReactNode;
  available: boolean;
}

const INITIAL_PROVIDERS: Provider[] = [
  {
    id: "gmail_yape",
    name: "Gmail — Facturas Yape",
    description: "Analizamos tu historial de notificacionesyape@bcp.com.bo",
    status: "idle",
    icon: <Mail size={20} />,
    available: true,
  },
  {
    id: "tigo_money",
    name: "Tigo Money",
    description: "Próximamente — requiere SDK Tigo",
    status: "idle",
    icon: <Smartphone size={20} />,
    available: false,
  },
  {
    id: "simple_bank",
    name: "SIMPLE / BCP",
    description: "Próximamente — pendiente integración Open Banking",
    status: "idle",
    icon: <Building2 size={20} />,
    available: false,
  },
];

export default function OnboardingConnect() {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>(INITIAL_PROVIDERS);
  const [showPermissionsModal, setShowPermissionsModal] = useState<Provider["id"] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasAnyConnected = providers.some((p) => p.status === "connected");

  // ── Iniciar flujo Reclaim ──────────────────────────────────────────────────
  async function startReclaimFlow(providerId: Provider["id"]) {
    setShowPermissionsModal(null);
    setErrorMsg(null);

    // Solo Gmail Yape implementado por ahora
    if (providerId !== "gmail_yape") return;

    setProviders((prev) => prev.map((p) =>
      p.id === providerId ? { ...p, status: "requesting" } : p
    ));

    if (IS_DEMO_RECLAIM) {
      // Modo demo: simular el flow visualmente
      await new Promise((r) => setTimeout(r, 1500));
      setProviders((prev) => prev.map((p) =>
        p.id === providerId ? { ...p, status: "scanning" } : p
      ));
      await new Promise((r) => setTimeout(r, 2200));
      setProviders((prev) => prev.map((p) =>
        p.id === providerId ? { ...p, status: "connected" } : p
      ));
      return;
    }

    // Modo real: iniciar Reclaim Protocol con provider Google
    try {
      // Dynamic import seguro — si el SDK no está instalado, caemos a demo
      const reclaim = await import("@reclaimprotocol/js-sdk" as string).catch(() => null) as { ReclaimProofRequest?: { init: (appId: string, secret: string, providerId: string) => Promise<ReclaimProofRequest> } } | null;
      if (!reclaim?.ReclaimProofRequest) {
        throw new Error("Reclaim SDK no disponible");
      }

      const appId = process.env.NEXT_PUBLIC_RECLAIM_APP_ID!;
      const reclaimProviderId = process.env.NEXT_PUBLIC_RECLAIM_GMAIL_PROVIDER_ID ?? "google-login";

      const reclaimProofRequest = await reclaim.ReclaimProofRequest.init(
        appId,
        process.env.NEXT_PUBLIC_RECLAIM_APP_SECRET ?? "",
        reclaimProviderId,
      );

      const requestUrl = await reclaimProofRequest.getRequestUrl();

      // Abrir el flow de Reclaim en una ventana nueva
      window.open(requestUrl, "_blank", "width=500,height=700");

      setProviders((prev) => prev.map((p) =>
        p.id === providerId ? { ...p, status: "scanning" } : p
      ));

      // Escuchar callbacks
      await reclaimProofRequest.startSession({
        onSuccess: (proofs: unknown) => {
          // Guardar proof para la pantalla de analyzing
          if (typeof window !== "undefined") {
            sessionStorage.setItem("yalita-reclaim-proof", JSON.stringify(proofs));
          }
          setProviders((prev) => prev.map((p) =>
            p.id === providerId ? { ...p, status: "connected" } : p
          ));
        },
        onError: (error: Error) => {
          console.error("[Reclaim] session error:", error);
          setProviders((prev) => prev.map((p) =>
            p.id === providerId ? { ...p, status: "error" } : p
          ));
          setErrorMsg("No pudimos conectar con Gmail. Intenta de nuevo.");
        },
      });
    } catch (err) {
      console.error("[Reclaim] init failed:", err);
      setProviders((prev) => prev.map((p) =>
        p.id === providerId ? { ...p, status: "error" } : p
      ));
      setErrorMsg("Error iniciando la conexión. Verifica tu conexión a internet.");
    }
  }

  const handleFinish = () => router.push("/onboarding/analyzing");

  return (
    <main style={{ background: "var(--y-bg)" }} className="min-h-screen flex flex-col p-6">
      <header className="mb-8 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--y-text-tertiary)" }}>
            Paso 4 de 4
          </span>
          <Link href="/onboarding/profile" className="text-sm" style={{ color: "var(--y-text-tertiary)" }}>
            Atrás
          </Link>
        </div>
        <ProgressBar progress={100} />
      </header>

      <div className="flex-1 flex flex-col">
        <h1 className="font-serif text-3xl mb-2" style={{ color: "var(--y-text-primary)" }}>
          Conecta tu historial de pagos
        </h1>
        <p className="mb-3 leading-relaxed" style={{ color: "var(--y-text-secondary)" }}>
          Necesitamos analizar tus transacciones reales para darte un puntaje crediticio justo.
        </p>

        {/* Privacy badge */}
        <div
          className="flex items-center gap-2 mb-6 p-3 rounded-xl"
          style={{
            background: "rgba(44,180,98,0.08)",
            border: "1px solid rgba(44,180,98,0.25)",
          }}
        >
          <Lock size={16} style={{ color: "var(--y-green)", flexShrink: 0 }} />
          <p className="text-xs leading-snug" style={{ color: "var(--y-green)" }}>
            <strong>Verificación zkTLS:</strong> tus datos viajan cifrados y NUNCA se guardan en nuestros servidores. Solo extraemos montos y fechas — ni mensajes ni contactos.
          </p>
        </div>

        {/* Providers list */}
        <div className="space-y-3 mb-6">
          {providers.map((provider) => (
            <ProviderRow
              key={provider.id}
              provider={provider}
              onConnect={() => setShowPermissionsModal(provider.id)}
            />
          ))}
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2 p-3 rounded-xl mb-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <AlertCircle size={16} style={{ color: "#EF4444", flexShrink: 0, marginTop: 2 }} />
            <p className="text-xs" style={{ color: "#EF4444" }}>{errorMsg}</p>
          </div>
        )}

        <p className="text-center text-xs mb-6" style={{ color: "var(--y-text-tertiary)" }}>
          Puedes conectar más fuentes después desde tu perfil.
        </p>

        <div className="mt-auto pb-4">
          <button
            onClick={handleFinish}
            disabled={!hasAnyConnected}
            className="w-full font-semibold py-4 px-6 rounded-xl text-center transition-all flex justify-center items-center gap-2"
            style={{
              background: hasAnyConnected ? "var(--y-primary)" : "var(--y-surface-alt)",
              color: hasAnyConnected ? "var(--y-text-on-dark)" : "var(--y-text-tertiary)",
            }}
          >
            <span>Calcular mi puntaje</span>
            <span className="text-xl">→</span>
          </button>
        </div>
      </div>

      {/* Permissions modal */}
      {showPermissionsModal && (
        <PermissionsModal
          providerId={showPermissionsModal}
          onConfirm={() => startReclaimFlow(showPermissionsModal)}
          onCancel={() => setShowPermissionsModal(null)}
        />
      )}
    </main>
  );
}

// ── Provider Row ─────────────────────────────────────────────────────────────
function ProviderRow({ provider, onConnect }: { provider: Provider; onConnect: () => void }) {
  const isDisabled = !provider.available;
  const isBusy = provider.status === "requesting" || provider.status === "scanning";
  const isConnected = provider.status === "connected";

  return (
    <button
      onClick={isDisabled || isBusy || isConnected ? undefined : onConnect}
      disabled={isDisabled || isBusy || isConnected}
      className="w-full p-4 rounded-2xl flex items-center justify-between transition-all text-left disabled:cursor-default"
      style={{
        background: "var(--y-surface)",
        border: `1px solid ${isConnected ? "var(--y-green)" : "var(--y-border)"}`,
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: isConnected ? "rgba(44,180,98,0.12)" : "var(--y-surface-alt)",
            color: isConnected ? "var(--y-green)" : "var(--y-primary)",
          }}
        >
          {provider.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: "var(--y-text-primary)" }}>
            {provider.name}
          </p>
          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--y-text-secondary)" }}>
            {provider.description}
          </p>
        </div>
      </div>

      {/* Status indicator */}
      <div className="shrink-0 ml-3">
        {isConnected ? (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "rgba(44,180,98,0.12)" }}>
            <Check size={14} style={{ color: "var(--y-green)" }} />
            <span className="text-xs font-bold" style={{ color: "var(--y-green)" }}>Conectado</span>
          </div>
        ) : provider.status === "requesting" ? (
          <Loader2 size={18} className="animate-spin" style={{ color: "var(--y-primary)" }} />
        ) : provider.status === "scanning" ? (
          <span className="text-xs font-bold animate-pulse" style={{ color: "var(--y-primary)" }}>Leyendo...</span>
        ) : provider.status === "error" ? (
          <span className="text-xs font-bold" style={{ color: "#EF4444" }}>Error</span>
        ) : isDisabled ? (
          <span className="text-xs" style={{ color: "var(--y-text-tertiary)" }}>Próximamente</span>
        ) : (
          <span className="text-xs font-bold" style={{ color: "var(--y-primary)" }}>Conectar</span>
        )}
      </div>
    </button>
  );
}

// ── Permissions Modal ────────────────────────────────────────────────────────
function PermissionsModal({
  providerId,
  onConfirm,
  onCancel,
}: {
  providerId: Provider["id"];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 animate-slideUp"
        style={{ background: "var(--y-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(44,180,98,0.12)" }}>
            <Lock size={22} style={{ color: "var(--y-green)" }} />
          </div>
          <div>
            <h2 className="font-bold text-lg" style={{ color: "var(--y-text-primary)" }}>
              Permisos requeridos
            </h2>
            <p className="text-xs" style={{ color: "var(--y-text-tertiary)" }}>
              Lee con atención antes de continuar
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <PermissionItem
            check
            title="Leer SOLO emails de notificacionesyape@bcp.com.bo"
            description="No accedemos a tus otros correos, contactos, ni archivos adjuntos."
          />
          <PermissionItem
            check
            title="Extraer montos, fechas y comercios"
            description="Solo los datos necesarios para calcular tu puntaje crediticio."
          />
          <PermissionItem
            check
            title="Generar prueba zkTLS"
            description="Una prueba criptográfica que el dato vino de Gmail, sin exponer el contenido."
          />
          <PermissionItem
            cross
            title="NO publicamos ni vendemos tus datos"
            description="Los emails no se guardan. Solo el score numérico final queda registrado."
          />
        </div>

        {/* Términos */}
        <label className="flex items-start gap-3 p-3 rounded-xl cursor-pointer mb-5" style={{ background: "var(--y-surface-alt)" }}>
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-current"
            style={{ accentColor: "var(--y-green)" }}
          />
          <span className="text-xs leading-relaxed" style={{ color: "var(--y-text-secondary)" }}>
            Acepto los <Link href="/terminos" className="underline font-semibold" style={{ color: "var(--y-primary)" }}>Términos y Condiciones</Link> y autorizo a Yalita a leer mis facturas Yape para generar mi historial crediticio descentralizado.
          </span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: "var(--y-surface-alt)", color: "var(--y-text-primary)" }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!accepted}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1"
            style={{
              background: accepted ? "var(--y-primary)" : "var(--y-surface-alt)",
              color: accepted ? "var(--y-text-on-dark)" : "var(--y-text-tertiary)",
            }}
          >
            Continuar <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PermissionItem({ check, cross, title, description }: {
  check?: boolean; cross?: boolean; title: string; description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: check ? "rgba(44,180,98,0.15)" : "rgba(239,68,68,0.15)" }}
      >
        {check ? <Check size={14} style={{ color: "var(--y-green)" }} /> : <span style={{ color: "#EF4444", fontWeight: 700 }}>×</span>}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm" style={{ color: "var(--y-text-primary)" }}>{title}</p>
        <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--y-text-secondary)" }}>{description}</p>
      </div>
    </div>
  );
}
