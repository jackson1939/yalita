"use client";

import { mockProviders } from "@/lib/mock-data";
import { ProviderCard } from "@/components/ui/ProviderCard";
import { QuipuCard } from "@/components/ui/QuipuCard";
import { useQuipuStore } from "@/stores/quipu.store";
import { Settings, LogOut, ChevronRight, Share2, Globe, Bell, MessageSquare, Mail, Smartphone, QrCode, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";

export default function Perfil() {
  const { userName, userPhone, isCiVerified, verifyCi } = useQuipuStore();
  
  const verificationLevel = isCiVerified ? 100 : 40;
  const memberSince = "Octubre 2023";
  const avatarInitial = userName.charAt(0);

  return (
    <main style={{ background: "var(--y-bg)" }} className="min-h-screen pb-6">
      {/* Header Avatar */}
      <header
        className="flex flex-col items-center pt-10 pb-6"
        style={{ background: "var(--y-surface)", borderBottom: "1px solid var(--y-border)" }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-serif shadow-lg mb-4"
          style={{ background: "linear-gradient(135deg, var(--y-navy), var(--y-primary))", color: "var(--y-text-on-dark)" }}
        >
          {avatarInitial}
        </div>
        <h1 className="font-serif text-2xl" style={{ color: "var(--y-text-primary)" }}>{userName}</h1>
        <p className="text-sm font-bold mt-1" style={{ color: "var(--y-primary)" }}>{userPhone}</p>
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-xs font-medium" style={{ color: "var(--y-text-tertiary)" }}>Miembro desde {memberSince}</span>
          {isCiVerified && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "var(--y-green-light)", color: "var(--y-green)", border: "1px solid rgba(44,180,98,0.2)" }}
            >
              Verificada ✓
            </span>
          )}
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* NIVEL DE CONFIANZA */}
        <section
          className="rounded-2xl p-5 shadow-sm animate-fade-up"
          style={{ background: "var(--y-surface)", border: "1px solid var(--y-border)" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--y-text-primary)" }}>Nivel de Confianza</h2>
            <span className="text-xs font-bold" style={{ color: "var(--y-primary)" }}>{verificationLevel}%</span>
          </div>
          
          <div className="w-full h-3 rounded-full overflow-hidden mb-4" style={{ background: "var(--y-surface-alt)" }}>
            <div 
              className="h-full transition-all duration-1000"
              style={{
                width: `${verificationLevel}%`,
                background: isCiVerified ? "var(--y-green)" : "var(--y-primary)",
              }}
            />
          </div>

          {!isCiVerified ? (
            <div className="rounded-xl p-4" style={{ background: "rgba(var(--y-primary-rgb), 0.05)", border: "1px solid rgba(var(--y-primary-rgb), 0.1)" }}>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg" style={{ background: "rgba(var(--y-primary-rgb), 0.1)" }}>
                  <UserCheck size={20} style={{ color: "var(--y-primary)" }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: "var(--y-text-primary)" }}>Verifica tu C.I.</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--y-text-secondary)" }}>Desbloquea préstamos de hasta Bs 8,000 verificando tu identidad nacional.</p>
                  <button 
                    onClick={() => verifyCi()}
                    className="mt-3 text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                    style={{ background: "var(--y-primary)", color: "var(--y-text-on-dark)" }}
                  >
                    Verificar ahora
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 p-3 rounded-xl" style={{ background: "var(--y-green-light)", color: "var(--y-green)", border: "1px solid rgba(44,180,98,0.1)" }}>
              <ShieldCheck size={18} />
              <span className="text-xs font-bold">Tu identidad está plenamente protegida y verificada on-chain.</span>
            </div>
          )}
        </section>

        {/* Fuentes Conectadas */}
        <section className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: "var(--y-text-primary)" }}>Fuentes conectadas</h3>
          <div className="space-y-3">
            {mockProviders.map((provider) => {
              let Icon = Smartphone;
              if (provider.id === "sms") Icon = MessageSquare;
              if (provider.id === "email") Icon = Mail;

              return (
                <ProviderCard
                  key={provider.id}
                  name={provider.name}
                  icon={<Icon size={20} style={{ color: "var(--y-primary)" }} />}
                  status={provider.status}
                />
              );
            })}
          </div>
        </section>

        {/* Configuración */}
        <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--y-text-primary)" }}>Configuración</h2>
          <div
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{ background: "var(--y-surface)", border: "1px solid var(--y-border)" }}
          >
            <button className="w-full flex items-center justify-between p-4 hover:opacity-80 transition-colors text-left" style={{ borderBottom: "1px solid var(--y-border)" }}>
              <div className="flex items-center space-x-3">
                <Globe size={20} style={{ color: "var(--y-text-tertiary)" }} />
                <span className="font-semibold" style={{ color: "var(--y-text-primary)" }}>Idioma</span>
              </div>
              <div className="flex items-center" style={{ color: "var(--y-text-tertiary)" }}>
                <span className="text-sm font-medium mr-2">Español</span>
                <ChevronRight size={18} />
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:opacity-80 transition-colors text-left" style={{ borderBottom: "1px solid var(--y-border)" }}>
              <div className="flex items-center space-x-3">
                <Bell size={20} style={{ color: "var(--y-text-tertiary)" }} />
                <span className="font-semibold" style={{ color: "var(--y-text-primary)" }}>Notificaciones</span>
              </div>
              <ChevronRight size={18} style={{ color: "var(--y-text-tertiary)" }} />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:opacity-80 transition-colors text-left" style={{ borderBottom: "1px solid var(--y-border)" }}>
              <div className="flex items-center space-x-3">
                <Settings size={20} style={{ color: "var(--y-text-tertiary)" }} />
                <span className="font-semibold" style={{ color: "var(--y-text-primary)" }}>Seguridad</span>
              </div>
              <ChevronRight size={18} style={{ color: "var(--y-text-tertiary)" }} />
            </button>
            <button className="w-full flex items-center p-4 hover:opacity-80 transition-colors text-left" style={{ color: "var(--y-primary)" }}>
              <LogOut size={20} className="mr-3" />
              <span className="font-semibold">Cerrar sesión</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
