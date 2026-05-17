"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { QRBottomSheet } from "@/components/ui/QRBottomSheet";
import { Bell, CreditCard, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Link from "next/link";
import { useQuipuStore } from "@/stores/quipu.store";

// ─── HELPER: Relative time in Modo Doña ───
function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  return `hace ${days} días`;
}

const TX_ICONS: Record<string, string> = {
  loan_received: "💰",
  qr_received: "📲",
  loan_payment: "✅",
  qr_sent: "📤",
};

const BANNERS = [
  {
    emoji: "💡",
    title: "Tu historial de pagos ES tu garantía",
    text: "No necesitas casa, carro ni aval. Si cobras seguido por QR, Yalita lo sabe y te presta a tasa justa.",
    cta: "Ver cómo se calcula →",
    href: "/como-funciona",
  },
  {
    emoji: "📱",
    title: "Muestra el QR, cobra al instante",
    text: "Tu cliente escanea tu código y te paga en segundos. Sin efectivo, sin vuelto, sin riesgo.",
    cta: "Ver mi QR →",
    href: "__qr__",
  },
  {
    emoji: "🔄",
    title: "Cada cobro que haces paga tu deuda solo",
    text: "Cuando activas el repago automático, un pequeño porcentaje de cada cobro QR se descuenta de tu cuota.",
    cta: "Activar repago automático →",
    href: "/prestamos/activo",
  },
  {
    emoji: "🔒",
    title: "Tus datos no se venden ni se guardan",
    text: "Solo vemos qué tanto cobras, no a quién ni qué vendes. Tú controlas tu información en todo momento.",
    cta: "Leer más →",
    href: "/como-funciona",
  },
];

export default function Dashboard() {
  const userName = useQuipuStore((s) => s.userName);
  const score = useQuipuStore((s) => s.score);
  const balanceUsdc = useQuipuStore((s) => s.balanceUsdc);
  const dataSource = useQuipuStore((s) => s.dataSource);
  const getBalanceBs = useQuipuStore((s) => s.getBalanceBs);
  const getCreditLimitBs = useQuipuStore((s) => s.getCreditLimitBs);
  const getAvailableCreditBs = useQuipuStore((s) => s.getAvailableCreditBs);
  const activeLoan = useQuipuStore((s) => s.activeLoan);
  const transactions = useQuipuStore((s) => s.transactions);

  const contentRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrMode, setQrMode] = useState<"cobrar" | "pagar" | "pagar_qr" | "pagar_cuota" | undefined>();
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── GSAP stagger entrance ─────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    let ctx: { revert: () => void } | null = null;

    import("gsap").then(({ gsap }) => {
      ctx = gsap.context(() => {
        // Sections stagger in from below
        gsap.from(contentRef.current?.querySelectorAll("section, header") ?? [], {
          opacity: 0,
          y: 18,
          duration: 0.45,
          stagger: 0.07,
          ease: "power2.out",
          clearProps: "all",
        });

        // Action grid buttons subtle pop
        gsap.from(contentRef.current?.querySelectorAll(".action-btn") ?? [], {
          scale: 0.93,
          opacity: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: "back.out(1.5)",
          delay: 0.35,
          clearProps: "all",
        });
      }, contentRef);
    });

    return () => { ctx?.revert(); };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [mounted]);

  const handleBannerCta = useCallback((href: string) => {
    if (href === "__qr__") {
      setQrMode("cobrar");
      setQrOpen(true);
    }
  }, []);

  const openQr = (mode: "cobrar" | "pagar" | "pagar_qr" | "pagar_cuota") => {
    setQrMode(mode);
    setQrOpen(true);
  };

  if (!mounted) return <div style={{ background: "var(--y-bg)" }} className="min-h-screen" />;

  const balanceBs = getBalanceBs();
  const hasActiveLoan = activeLoan && activeLoan.status === "active";
  const creditLimitBs = getCreditLimitBs();
  const availableCreditBs = getAvailableCreditBs();
  const recentTx = transactions.slice(0, 3);

  const daysUntilDue = hasActiveLoan
    ? Math.max(
        0,
        28 -
          (Math.floor(
            (Date.now() - new Date(activeLoan!.createdAt).getTime()) / 86400000
          ) %
            30)
      )
    : 0;

  return (
    <main ref={contentRef} style={{ background: "var(--y-bg)" }} className="min-h-screen pb-24">
      {/* ─── HEADER ─── */}
      <header
        className="flex justify-between items-center p-6 backdrop-blur-md sticky top-0 z-10"
        style={{
          background: "color-mix(in srgb, var(--y-surface) 80%, transparent)",
          borderBottom: "1px solid var(--y-border)",
        }}
      >
        <div>
          <h1 className="font-serif text-2xl" style={{ color: "var(--y-text-primary)" }}>
            Buenos días, {userName.split(" ")[0]} ☀️
          </h1>
          <p className="text-sm font-medium" style={{ color: "var(--y-text-secondary)" }}>
            Tu billetera Yalita
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <button
            className="relative w-10 h-10 flex items-center justify-center rounded-full shadow-sm"
            style={{
              background: "var(--y-surface)",
              border: "1px solid var(--y-border)",
              color: "var(--y-text-primary)",
            }}
          >
            <Bell size={20} />
            {transactions.length > 0 && (
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full border-2"
                style={{
                  background: "var(--y-primary)",
                  borderColor: "var(--y-surface)",
                }}
              />
            )}
          </button>
        </div>
      </header>

      <div className="p-6 space-y-5">
        {/* ─── SALDO PRINCIPAL ─── */}
        <section
          className="rounded-2xl p-5 shadow-sm animate-fadeInUp"
          style={{
            background: "var(--y-surface)",
            border: "1px solid var(--y-border)",
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-wider mb-1"
            style={{ color: "var(--y-text-tertiary)" }}
          >
            Tu saldo Yalita
          </p>
          <p
            className="font-lora text-5xl tracking-tight"
            style={{ color: "var(--y-text-primary)" }}
          >
            Bs{" "}
            {balanceBs.toLocaleString("es-BO", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--y-text-tertiary)" }}>
            ≈ {balanceUsdc.toFixed(2)} USDC
          </p>
          <div className="flex items-center mt-3 space-x-2">
            {balanceBs > 0 ? (
              <span className="text-[10px] font-bold flex items-center space-x-1" style={{ color: "var(--y-green)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--y-green)" }} />
                <span>Activo</span>
              </span>
            ) : !activeLoan ? (
              <Link
                href="/prestamos/calculadora"
                className="text-xs font-bold"
                style={{ color: "var(--y-primary)" }}
              >
                Pide tu primer préstamo →
              </Link>
            ) : null}
          </div>
        </section>

        {/* ─── SCORE COMPACTO ─── */}
        <section
          className="rounded-2xl p-4 relative overflow-hidden animate-fadeInUp shadow-lg"
          style={{
            background: `linear-gradient(135deg, var(--y-card-dark) 0%, var(--y-navy) 100%)`,
            animationDelay: "0.1s",
          }}
        >
          {/* On-chain + dataSource badges */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {/* dataSource flywheel indicator */}
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
              style={{
                background: dataSource === "internal"
                  ? "rgba(44,180,98,0.18)"
                  : dataSource === "hybrid"
                  ? "rgba(245,158,11,0.18)"
                  : "rgba(170,239,223,0.1)",
                color: dataSource === "internal"
                  ? "var(--y-green)"
                  : dataSource === "hybrid"
                  ? "var(--y-amber)"
                  : "var(--y-aqua)",
              }}
            >
              {dataSource === "internal" ? "Historial propio" : dataSource === "hybrid" ? "Mixto" : "Externo"}
            </span>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--y-green)" }} />
            <span className="text-[10px] font-medium" style={{ color: "var(--y-text-on-dark-muted)" }}>On-chain</span>
          </div>
          <div className="flex items-center space-x-4">
            {/* Mini score */}
            <div
              className="w-16 h-16 rounded-full border-[3px] flex items-center justify-center shrink-0"
              style={{
                borderColor: "var(--y-aqua)",
                background: "rgba(255,255,255,0.05)",
                boxShadow: "0 0 15px rgba(var(--y-aqua-rgb), 0.2)",
              }}
            >
              <span className="font-lora text-2xl" style={{ color: "var(--y-aqua)" }}>
                {score}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm flex items-center gap-1" style={{ color: "var(--y-text-on-dark)" }}>
                Tu Poder Yalita <ShieldCheck size={14} style={{ color: "var(--y-green)" }} />
              </p>
              <p className="text-[11px] mt-0.5 leading-tight" style={{ color: "var(--y-text-on-dark-muted)" }}>
                Este número es tu llave: a mayor puntaje, podrás pedir préstamos más grandes y baratos.
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs" style={{ color: "var(--y-text-on-dark-muted)" }}>
                  ⚡ Crédito disponible:{" "}
                  <span className="font-bold" style={{ color: "var(--y-aqua)" }}>
                    Bs {availableCreditBs.toLocaleString()}
                  </span>
                </p>
                <Link
                  href="/como-funciona"
                  className="text-[10px] px-2 py-1 rounded-lg font-bold hover:opacity-80 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "var(--y-aqua)",
                  }}
                >
                  Subir mi límite →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── ACTIVE LOAN CARD (conditional) ─── */}
        {hasActiveLoan && (
          <section
            className="rounded-2xl p-5 relative overflow-hidden animate-fadeInUp"
            style={{
              background: `linear-gradient(135deg, var(--y-card-dark) 0%, var(--y-navy) 100%)`,
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--y-text-on-dark-muted)" }}>
                Tu préstamo activo
              </p>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(44,180,98,0.2)",
                  color: "var(--y-green)",
                }}
              >
                Al día ✓
              </span>
            </div>

            <p className="font-lora text-3xl mb-1" style={{ color: "var(--y-amber)" }}>
              Bs {activeLoan!.monthlyPaymentBs.toLocaleString()}
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--y-text-on-dark-muted)" }}>
              próxima cuota · vence en {daysUntilDue} días
            </p>

            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(activeLoan!.paidInstallments / activeLoan!.termMonths) * 100}%`,
                    background: "var(--y-green)",
                  }}
                />
              </div>
              <span className="text-xs font-bold" style={{ color: "var(--y-text-on-dark-muted)" }}>
                {activeLoan!.paidInstallments}/{activeLoan!.termMonths}
              </span>
            </div>

            <button
              onClick={() => openQr("pagar_cuota")}
              className="w-full py-2.5 hover:opacity-80 transition-colors rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 active:scale-[0.97]"
              style={{ background: "rgba(255,255,255,0.1)", color: "var(--y-text-on-dark)" }}
            >
              <CreditCard size={16} />
              <span>Pagar ahora</span>
            </button>
          </section>
        )}

        {/* ─── ACTION BUTTONS 2×2 ─── */}
        <section>
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--y-text-primary)" }}>
            ¿Qué quieres hacer?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {/* COBRAR */}
            <button
              onClick={() => openQr("cobrar")}
              className="action-btn rounded-2xl p-5 text-left transition-all active:scale-[0.97]"
              style={{ background: "var(--y-navy)", minHeight: "110px" }}
            >
              <span className="text-3xl block mb-2">💳</span>
              <p className="font-bold text-[15px]" style={{ color: "white" }}>Cobrar</p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                Muestra tu QR y recibe pagos
              </p>
            </button>

            {/* PAGAR QR */}
            <button
              onClick={() => openQr("pagar_qr")}
              className="action-btn rounded-2xl p-5 text-left transition-all active:scale-[0.97]"
              style={{ background: "var(--y-navy-light)", minHeight: "110px" }}
            >
              <span className="text-3xl block mb-2">📤</span>
              <p className="font-bold text-[15px]" style={{ color: "var(--y-text-on-dark)" }}>Pagar QR</p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                Escanea o paga cuotas
              </p>
            </button>

            {/* PEDIR PRÉSTAMO */}
            <Link
              href="/prestamos/calculadora"
              className="action-btn rounded-2xl p-5 text-left transition-all active:scale-[0.97]"
              style={{ background: "var(--y-navy-light)", minHeight: "110px", border: "1px solid var(--y-border)" }}
            >
              <span className="text-3xl block mb-2">💰</span>
              <p className="font-bold text-[15px]" style={{ color: "var(--y-text-on-dark)" }}>
                Pedir préstamo
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--y-text-on-dark-muted)" }}>
                Hasta Bs {creditLimitBs.toLocaleString()}
              </p>
            </Link>

            {/* MI HISTORIAL o PAGAR DEUDA */}
            {hasActiveLoan ? (
              <button
                onClick={() => openQr("pagar_cuota")}
                className="rounded-2xl p-5 text-left transition-all active:scale-[0.97]"
                style={{ background: "var(--y-green)", minHeight: "110px" }}
              >
                <span className="text-3xl block mb-2">✅</span>
                <p className="font-bold text-[15px]" style={{ color: "var(--y-text-on-dark)" }}>Pagar deuda</p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Cuota: Bs {activeLoan!.monthlyPaymentBs.toLocaleString()}
                </p>
              </button>
            ) : (
              <Link
                href="/historial"
                className="rounded-2xl p-5 text-left transition-all active:scale-[0.97]"
                style={{ background: "var(--y-navy-light)", minHeight: "110px" }}
              >
                <span className="text-3xl block mb-2">📊</span>
                <p className="font-bold text-[15px]" style={{ color: "var(--y-text-on-dark)" }}>Mi historial</p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Ver tus movimientos
                </p>
              </Link>
            )}
          </div>
        </section>

        {/* ─── ÚLTIMOS MOVIMIENTOS ─── */}
        {recentTx.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--y-text-primary)" }}>
              Últimos movimientos
            </h2>
            <div
              className="rounded-2xl shadow-sm divide-y"
              style={{
                background: "var(--y-surface)",
                border: "1px solid var(--y-border)",
              }}
            >
              {recentTx.map((tx) => {
                const isIncome =
                  tx.type === "loan_received" || tx.type === "qr_received";
                return (
                  <div key={tx.id} className="flex items-center p-4 space-x-3">
                    <span className="text-2xl shrink-0">
                      {TX_ICONS[tx.type] || "📋"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: "var(--y-text-primary)" }}>
                        {tx.description}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--y-text-tertiary)" }}>
                        {timeAgo(tx.timestamp)}
                      </p>
                    </div>
                    <span
                      className="text-sm font-bold shrink-0"
                      style={{ color: isIncome ? "var(--y-green)" : "var(--y-text-primary)" }}
                    >
                      {isIncome ? "+" : "-"}Bs{" "}
                      {tx.amountBs.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
            <Link
              href="/historial"
              className="block text-center text-xs font-bold mt-3"
              style={{ color: "var(--y-primary)" }}
            >
              Ver todos los movimientos →
            </Link>
          </section>
        )}

        {/* ─── ROTATING BANNERS ─── */}
        <section>
          <div
            className="relative overflow-hidden rounded-2xl shadow-sm"
            style={{ background: "var(--y-surface)", border: "1px solid var(--y-border)" }}
          >
            {BANNERS.map((banner, i) => (
              <div
                key={i}
                className="p-5 transition-opacity duration-500"
                style={{
                  display: i === bannerIndex ? "block" : "none",
                  opacity: i === bannerIndex ? 1 : 0,
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0" style={{ background: "var(--y-surface-alt)" }}>
                    {banner.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm mb-1" style={{ color: "var(--y-text-primary)" }}>
                      {banner.title}
                    </h4>
                    <p className="text-[12px] leading-relaxed mb-3" style={{ color: "var(--y-text-secondary)" }}>
                      {banner.text}
                    </p>
                    {banner.href === "__qr__" ? (
                      <button
                        onClick={() => handleBannerCta(banner.href)}
                        className="text-xs font-bold"
                        style={{ color: "var(--y-primary)" }}
                      >
                        {banner.cta}
                      </button>
                    ) : (
                      <Link
                        href={banner.href}
                        className="text-xs font-bold"
                        style={{ color: "var(--y-primary)" }}
                      >
                        {banner.cta}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-center space-x-1.5 pb-4">
              {BANNERS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setBannerIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === bannerIndex ? "w-4" : "w-1.5"}`}
                  style={{
                    background: i === bannerIndex ? "var(--y-primary)" : "var(--y-border)",
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* QR Bottom Sheet */}
      <QRBottomSheet 
        isOpen={qrOpen} 
        onClose={() => setQrOpen(false)} 
        mode={qrMode as any}
      />
    </main>
  );
}
