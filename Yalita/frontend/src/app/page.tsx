"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function SplashPage() {
  const knotRef    = useRef<SVGSVGElement>(null);
  const orb1Ref    = useRef<HTMLDivElement>(null);
  const orb2Ref    = useRef<HTMLDivElement>(null);
  const orb3Ref    = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // ── Mark visible immediately so CTA is never hidden ─────────────────────
  useEffect(() => {
    setReady(true);
  }, []);

  // ── GSAP — SVG + orbs only (enhancement, never hides UI) ────────────────
  useEffect(() => {
    let active = true;
    let ctx: { revert: () => void } | null = null;

    import("gsap").then(({ gsap }) => {
      if (!active) return; // strict-mode guard

      const paths = knotRef.current?.querySelectorAll<SVGPathElement>("path.knot");
      paths?.forEach((path) => {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
      });

      const center = knotRef.current?.querySelector<SVGCircleElement>("circle.knot-center");
      if (center) gsap.set(center, { opacity: 0, scale: 0, transformOrigin: "50px 50px" });

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Draw knot paths
        if (paths?.[0]) tl.to(paths[0], { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" }, 0);
        if (paths?.[1]) tl.to(paths[1], { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, 0.4);
        if (center)     tl.to(center,   { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2.5)" }, 1.3);

        // Orbs float in
        tl.from([orb1Ref.current, orb2Ref.current, orb3Ref.current], {
          opacity: 0, scale: 0.5, duration: 2, stagger: 0.3, ease: "power1.out",
        }, 0);

        // Idle knot glow pulse
        gsap.to(knotRef.current, {
          filter: "drop-shadow(0 0 22px rgba(170,239,223,0.45))",
          duration: 2.5, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.8,
        });

        // Orbs float continuously
        gsap.to(orb1Ref.current, { y: -18, duration: 3.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
        gsap.to(orb2Ref.current, { y: 14,  duration: 4.5, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.2 });
        gsap.to(orb3Ref.current, { y: -10, x: 8, duration: 5.1, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.6 });
      });
    });

    return () => {
      active = false;
      ctx?.revert();
    };
  }, []);

  return (
    <main
      className="min-h-screen relative flex flex-col items-center overflow-hidden"
      style={{ background: "var(--y-navy)", padding: "40px 24px 32px" }}
    >
      {/* ── Background orbs ──────────────────────────────────────────────── */}
      <div ref={orb1Ref} className="absolute top-16 right-4 w-52 h-52 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(170,239,223,0.13) 0%, transparent 70%)", filter: "blur(24px)" }} />
      <div ref={orb2Ref} className="absolute bottom-28 -left-8 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)", filter: "blur(32px)" }} />
      <div ref={orb3Ref} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(192,57,43,0.04) 0%, transparent 70%)", filter: "blur(40px)" }} />

      {/* ── Aguayo pattern ───────────────────────────────────────────────── */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 60 60" preserveAspectRatio="none">
          <defs>
            <pattern id="aguayo" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M0 10 L10 0 L20 10 L10 20 Z" fill="#AAEFDF" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#aguayo)" />
        </svg>
      </div>

      {/* ── Center content — always visible via CSS ───────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full max-w-sm mx-auto">

        {/* Animated Knot SVG — GSAP draws paths */}
        <svg ref={knotRef} width="130" height="130" viewBox="0 0 100 100" fill="none"
          className="mb-6" aria-hidden="true"
          style={{ filter: "drop-shadow(0 0 8px rgba(170,239,223,0.18))" }}
        >
          <circle cx="50" cy="50" r="47" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 4" />
          <path className="knot" d="M50 14 C28 14, 16 34, 50 50 C84 66, 72 86, 50 86"
            stroke="#C0392B" strokeWidth="5.5" strokeLinecap="round" />
          <path className="knot" d="M50 14 C72 14, 84 34, 50 50 C16 66, 28 86, 50 86"
            stroke="#F59E0B" strokeWidth="5.5" strokeLinecap="round" />
          <circle className="knot-center" cx="50" cy="50" r="9"
            fill="var(--y-navy)" stroke="#2CB462" strokeWidth="4" />
        </svg>

        {/* Logo — CSS fade-in, always visible */}
        <div
          className="text-center"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.5s ease 0.8s, transform 0.5s ease 0.8s",
          }}
        >
          <h1 className="font-serif tracking-tight" style={{ fontSize: "3.8rem", lineHeight: 1, color: "var(--y-aqua)" }}>
            Yalita
          </h1>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mt-1" style={{ color: "rgba(170,239,223,0.35)" }}>
            Protocolo · Avalanche
          </p>
        </div>

        {/* Tagline — CSS fade-in */}
        <div
          className="text-center mt-5"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.5s ease 1.1s, transform 0.5s ease 1.1s",
          }}
        >
          <p className="text-lg font-semibold leading-snug" style={{ color: "rgba(255,255,255,0.92)" }}>
            Tu reputación es tu mayor activo
          </p>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.38)" }}>
            Rápido, simple y justo · Bolivia y Latam
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 pt-4">
            {[
              { val: "210M", label: "sin crédito" },
              { val: "2 min", label: "para empezar" },
              { val: "0%", label: "colateral" },
            ].map(({ val, label }) => (
              <div key={val} className="text-center">
                <p className="font-lora text-lg font-bold" style={{ color: "var(--y-aqua)" }}>{val}</p>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA — CSS fade-in, NUNCA controlado por GSAP ─────────────────── */}
      <div
        className="w-full max-w-sm z-10 space-y-3 mt-6"
        style={{
          opacity: ready ? 1 : 0,
          transform: ready ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.5s ease 1.4s, transform 0.5s ease 1.4s",
        }}
      >
        <Link
          href="/onboarding"
          className="block w-full font-bold py-4 px-6 rounded-2xl text-center text-white transition-all active:scale-[0.97] animate-shimmer-btn"
          style={{
            background: "linear-gradient(135deg, #C0392B 0%, #E74C3C 50%, #C0392B 100%)",
            backgroundSize: "200% 100%",
            boxShadow: "0 8px 32px rgba(192,57,43,0.45), 0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          Empieza gratis →
        </Link>

        <Link
          href="/dashboard"
          className="block w-full font-medium py-3 px-6 text-center rounded-xl transition-all active:opacity-70"
          style={{ color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          Ya tengo cuenta — Entrar
        </Link>

        <div className="flex items-center justify-center gap-6 pt-1">
          {["🔒 Sin banco", "⚡ 2 minutos", "🇧🇴 Bolivia"].map((badge) => (
            <span key={badge} className="text-[11px]" style={{ color: "rgba(255,255,255,0.22)" }}>
              {badge}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
