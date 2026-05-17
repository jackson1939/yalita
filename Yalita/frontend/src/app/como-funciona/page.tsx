"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

const STEPS = [
  {
    emoji: "📱",
    color: "rgba(var(--y-primary-rgb), 0.1)",
    border: "rgba(var(--y-primary-rgb), 0.2)",
    title: "Conectas tu historial de pagos",
    text: "Autorizas a Yalita a ver cuánto cobras por QR cada mes. Nada más. No vemos tus contactos, fotos ni contraseñas.",
  },
  {
    emoji: "⭐",
    color: "rgba(var(--y-aqua-rgb), 0.1)",
    border: "rgba(var(--y-aqua-rgb), 0.2)",
    title: "Calculamos tu puntaje",
    text: "Miramos cuánto cobras, con qué frecuencia y hace cuánto tiempo. Eso se convierte en tu Poder Yalita: un número entre 300 y 850.",
  },
  {
    emoji: "💰",
    color: "rgba(44, 180, 98, 0.1)",
    border: "rgba(44, 180, 98, 0.2)",
    title: "Accedes a crédito justo",
    text: "Con tu puntaje, puedes pedir desde Bs 500 hasta Bs 8.000 a tasas mucho más bajas que cualquier prestamista del mercado.",
  },
  {
    emoji: "🔄",
    color: "rgba(var(--y-navy-rgb), 0.1)",
    border: "rgba(var(--y-navy-rgb), 0.2)",
    title: "Pagas mientras cobras",
    text: "Cada vez que recibes un pago QR, una parte pequeña va a tu cuota automáticamente. Tu deuda se paga sola mientras trabajas.",
  },
];

const FAQS = [
  {
    q: "¿Qué pasa si no puedo pagar una cuota?",
    a: "Nos avisas y buscamos una solución juntos. No hay cobros ocultos ni penalizaciones abusivas.",
  },
  {
    q: "¿Yalita es un banco?",
    a: "No. Somos un protocolo de crédito descentralizado. Eso significa que el dinero viene de otras personas que prestan sus ahorros, no de un banco. Por eso podemos ofrecer mejores tasas.",
  },
  {
    q: "¿Mis datos están seguros?",
    a: "Sí. Usamos criptografía para verificar tus ingresos sin guardar tus datos en nuestros servidores. Tú eres dueño de tu información.",
  },
];

export default function ComoFunciona() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main style={{ background: "var(--y-bg)" }} className="min-h-screen flex flex-col">
      {/* Header */}
      <header 
        className="flex items-center p-6 backdrop-blur-md sticky top-0 z-10"
        style={{ background: "var(--y-surface)", borderBottom: "1px solid var(--y-border)" }}
      >
        <Link
          href="/dashboard"
          className="mr-4 transition-colors"
          style={{ color: "var(--y-text-primary)" }}
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-serif text-2xl" style={{ color: "var(--y-text-primary)" }}>
          Cómo funciona Yalita
        </h1>
      </header>

      <div className="flex-1 p-6 space-y-6 pb-24">
        <p 
          className="text-center text-[10px] font-bold uppercase tracking-[0.2em]" 
          style={{ color: "var(--y-text-tertiary)" }}
        >
          En 4 pasos simples
        </p>

        {/* ─── 4 STEPS ─── */}
        <div className="space-y-4">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 shadow-sm animate-fadeInUp"
              style={{ 
                background: "var(--y-surface)", 
                border: `1px solid ${step.border}`,
                animationDelay: `${i * 0.1}s` 
              }}
            >
              <div className="flex items-start space-x-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
                  style={{ background: step.color }}
                >
                  {step.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] font-bold uppercase" style={{ color: "var(--y-text-tertiary)" }}>
                      Paso {i + 1}
                    </span>
                  </div>
                  <h3 className="font-bold mb-1" style={{ color: "var(--y-text-primary)" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--y-text-secondary)" }}>
                    {step.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── SEPARATOR ─── */}
        <div className="flex items-center space-x-3 py-4">
          <div className="flex-1 h-px" style={{ background: "var(--y-border)" }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--y-text-tertiary)" }}>
            ¿Más dudas?
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--y-border)" }} />
        </div>

        {/* ─── FAQS ─── */}
        <div className="space-y-2">
          <h3 className="font-bold text-lg mb-3" style={{ color: "var(--y-text-primary)" }}>
            Preguntas frecuentes
          </h3>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl shadow-sm overflow-hidden"
              style={{ background: "var(--y-surface)", border: "1px solid var(--y-border)" }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-bold text-sm pr-4" style={{ color: "var(--y-text-primary)" }}>
                  {faq.q}
                </span>
                {openFaq === i ? (
                  <ChevronUp
                    size={20}
                    style={{ color: "var(--y-text-tertiary)" }}
                    className="shrink-0"
                  />
                ) : (
                  <ChevronDown
                    size={20}
                    style={{ color: "var(--y-text-tertiary)" }}
                    className="shrink-0"
                  />
                )}
              </button>
              {openFaq === i && (
                <div 
                  className="px-4 pb-4 text-sm leading-relaxed animate-fadeInUp"
                  style={{ color: "var(--y-text-secondary)" }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ─── CTA ─── */}
        <div className="pt-4">
          <Link
            href="/prestamos/calculadora"
            className="w-full font-semibold py-4 px-6 rounded-xl text-center transition-all flex justify-center items-center space-x-2 shadow-lg animate-shimmer-btn"
            style={{ background: "var(--y-primary)", color: "var(--y-text-on-primary)" }}
          >
            <span>Empezar ahora</span>
            <span className="text-xl">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
