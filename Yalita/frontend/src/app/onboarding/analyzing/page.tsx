"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useQuipuStore } from "@/stores/quipu.store";

// ── Types ────────────────────────────────────────────────────────────────────
type StepState = "waiting" | "active" | "done";

interface Step {
  waiting: string;
  active: string;
  done: (data: { txCount: number; score: number }) => string;
}

const STEPS: Step[] = [
  {
    waiting: "Conectando con Tigo Money...",
    active:  "Conectando con Tigo Money...",
    done:    () => "Conexión establecida ✓",
  },
  {
    waiting: "Esperando historial...",
    active:  "Leyendo tu historial de pagos...",
    done:    ({ txCount }) => `${txCount} transacciones encontradas ✓`,
  },
  {
    waiting: "Esperando cálculo...",
    active:  "Calculando tu puntaje DPI...",
    done:    () => "Algoritmo completado ✓",
  },
  {
    waiting: "Esperando confirmación...",
    active:  "Registrando identidad financiera...",
    done:    ({ score }) => `¡Puntaje listo! Tu score es ${score} ✓`,
  },
];

// ── Score counter hook ────────────────────────────────────────────────────────
function useCountUp(target: number, enabled: boolean) {
  const [display, setDisplay] = useState(300);

  useEffect(() => {
    if (!enabled || target === 0) return;
    const obj = { val: 300 };
    import("gsap").then(({ gsap }) => {
      gsap.to(obj, {
        val: target,
        duration: 1.4,
        ease: "power2.out",
        onUpdate() { setDisplay(Math.round(obj.val)); },
      });
    });
  }, [target, enabled]);

  return display;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AnalyzingPage() {
  const router = useRouter();
  const setScore = useQuipuStore((s) => s.setScore);
  const setScoreLoaded = useQuipuStore((s) => s.setScoreLoaded);

  const knotRef = useRef<SVGSVGElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  const [stepStates, setStepStates] = useState<StepState[]>(["active", "waiting", "waiting", "waiting"]);
  const [txCount, setTxCount] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [scoreReady, setScoreReady] = useState(false);
  const [exiting, setExiting] = useState(false);

  const displayScore = useCountUp(finalScore, scoreReady);

  // ── GSAP knot animation ────────────────────────────────────────────────────
  useEffect(() => {
    let ctx: { revert: () => void } | null = null;

    import("gsap").then(({ gsap }) => {
      const paths = knotRef.current?.querySelectorAll<SVGPathElement>("path.knot");
      paths?.forEach((path) => {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
      });

      const glow = knotRef.current?.querySelector<SVGCircleElement>("circle.knot-glow");
      if (glow) gsap.set(glow, { opacity: 0, scale: 0, transformOrigin: "50px 50px" });

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

        if (paths?.[0]) tl.to(paths[0], { strokeDashoffset: 0, duration: 1.6 }, 0);
        if (paths?.[1]) tl.to(paths[1], { strokeDashoffset: 0, duration: 1.3 }, 0.4);

        // Idle pulse loop on the knot
        tl.add(() => {
          gsap.to(knotRef.current, {
            filter: "drop-shadow(0 0 18px rgba(245,158,11,0.5))",
            duration: 1.8,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        }, 1.8);

        // Stagger in the step rows
        const rows = stepsRef.current?.querySelectorAll(".step-row");
        if (rows) {
          tl.from(Array.from(rows), {
            opacity: 0, x: -16, duration: 0.35, stagger: 0.12, ease: "power2.out",
          }, 0.6);
        }
      });
    });

    return () => { ctx?.revert(); };
  }, []);

  // ── Step state updater ─────────────────────────────────────────────────────
  function advanceStep(idx: number) {
    setStepStates((prev) =>
      prev.map((s, i) => {
        if (i < idx) return "done";
        if (i === idx) return "active";
        return "waiting";
      })
    );
  }
  function completeAll() {
    setStepStates(["done", "done", "done", "done"]);
  }

  // ── Main API flow ──────────────────────────────────────────────────────────
  async function runAnalysis() {
    setApiError(null);
    setScoreReady(false);
    setStepStates(["active", "waiting", "waiting", "waiting"]);

    // Step 0 → 1 after short delay (visual only)
    const step1Timer = setTimeout(() => advanceStep(1), 900);

    try {
      // Timeout wrapper: if API takes > 8s, use fallback score
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          proof: null,
          userId: "user_mock",
          walletAddress: "0xMockWalletAddress",
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`API ${response.status}`);

      const data = await response.json();
      const score: number = data.score ?? 680;
      const count: number = data.transactionCount ?? 12;

      clearTimeout(step1Timer);

      // Step 2 — calculating
      setTxCount(count);
      advanceStep(2);

      await wait(900);

      // Step 3 — registering
      advanceStep(3);
      setFinalScore(score);
      setScore(score);
      setScoreLoaded(true);

      await wait(700);

      // All done
      completeAll();
      setScoreReady(true);

      await wait(2200);
      setExiting(true);
      await wait(450);
      router.push("/dashboard");

    } catch (err) {
      clearTimeout(step1Timer);
      const isTimeout = (err as Error)?.name === "AbortError";

      if (isTimeout) {
        // Fallback: use default score, don't block user
        const fallback = 680;
        setTxCount(12);
        advanceStep(2);
        await wait(600);
        advanceStep(3);
        setFinalScore(fallback);
        setScore(fallback);
        setScoreLoaded(true);
        completeAll();
        setScoreReady(true);
        await wait(1800);
        setExiting(true);
        await wait(400);
        router.push("/dashboard");
      } else {
        setApiError((err as Error)?.message ?? "Error desconocido");
        setStepStates(["active", "waiting", "waiting", "waiting"]);
      }
    }
  }

  useEffect(() => { runAnalysis(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // ── Error screen ───────────────────────────────────────────────────────────
  if (apiError) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
        style={{ background: "var(--y-navy)" }}
      >
        <div className="mb-6 p-4 rounded-full" style={{ background: "rgba(239,68,68,0.1)" }}>
          <AlertCircle size={48} style={{ color: "#EF4444" }} />
        </div>
        <h1 className="font-serif text-2xl mb-2" style={{ color: "var(--y-aqua)" }}>
          Algo salió mal
        </h1>
        <p className="text-sm mb-2 leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
          No pudimos verificar tu historial. Tu sesión se guarda — puedes reintentar.
        </p>
        <p className="text-[11px] font-mono mb-8" style={{ color: "rgba(255,255,255,0.25)" }}>
          {apiError}
        </p>
        <button
          onClick={runAnalysis}
          className="flex items-center gap-2 font-bold py-3.5 px-8 rounded-xl transition-all active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, #C0392B, #E74C3C)",
            color: "white",
            boxShadow: "0 4px 20px rgba(192,57,43,0.4)",
          }}
        >
          <RefreshCw size={16} />
          Reintentar
        </button>
        <button
          onClick={() => {
            setScore(680);
            setScoreLoaded(true);
            router.push("/dashboard");
          }}
          className="mt-4 text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Continuar sin verificar
        </button>
      </main>
    );
  }

  // ── Main analyzing screen ──────────────────────────────────────────────────
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{
        background: "var(--y-navy)",
        opacity: exiting ? 0 : 1,
        transform: exiting ? "translateY(-12px)" : "none",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      {/* Knot SVG */}
      <svg
        ref={knotRef}
        width="130" height="130"
        viewBox="0 0 100 100"
        fill="none"
        className="mb-10"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <path
          className="knot"
          d="M50 14 C28 14, 16 34, 50 50 C84 66, 72 86, 50 86"
          stroke="#C0392B"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <path
          className="knot"
          d="M50 14 C72 14, 84 34, 50 50 C16 66, 28 86, 50 86"
          stroke="#F59E0B"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <circle
          className="knot-glow"
          cx="50" cy="50" r="9"
          fill="var(--y-navy)"
          stroke="#2CB462"
          strokeWidth="4"
        />
      </svg>

      {/* Steps */}
      <div ref={stepsRef} className="w-full max-w-xs space-y-5 mb-10">
        {STEPS.map((step, idx) => {
          const state = stepStates[idx];
          return (
            <div key={idx} className="step-row flex items-start gap-3">
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {state === "done" ? (
                  <CheckCircle2 size={22} style={{ color: "var(--y-green)" }} />
                ) : state === "active" ? (
                  <div
                    className="w-[22px] h-[22px] rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "var(--y-aqua)", borderTopColor: "transparent" }}
                  />
                ) : (
                  <div
                    className="w-[22px] h-[22px] rounded-full border-2"
                    style={{ borderColor: "rgba(255,255,255,0.12)" }}
                  />
                )}
              </div>

              {/* Text */}
              <span
                className="font-serif text-[17px] leading-snug transition-colors duration-300"
                style={{
                  color: state === "done"
                    ? "var(--y-aqua)"
                    : state === "active"
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.25)",
                }}
              >
                {state === "done"
                  ? step.done({ txCount, score: finalScore })
                  : state === "active"
                  ? step.active
                  : step.waiting}
              </span>
            </div>
          );
        })}
      </div>

      {/* Score reveal */}
      {scoreReady && (
        <div
          className="text-center"
          style={{
            animation: "fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            Tu Poder Yalita
          </p>
          <p
            className="font-lora score-glow"
            style={{ fontSize: "5rem", lineHeight: 1, color: "var(--y-amber)" }}
          >
            {displayScore}
          </p>
          <p className="text-sm mt-1 font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
            {displayScore >= 750 ? "Excelente" : displayScore >= 680 ? "Bueno" : displayScore >= 600 ? "Regular" : "En desarrollo"}
          </p>
        </div>
      )}
    </main>
  );
}

// ── Utility ──────────────────────────────────────────────────────────────────
function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
