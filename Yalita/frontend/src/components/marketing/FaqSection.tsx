"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const FAQS = [
  { q: "¿Necesito tener una cuenta bancaria?",
    a: "No. Yalita fue diseñado para personas sin historial bancario. Solo necesitas tu celular y haber recibido pagos por Tigo Money, SIMPLE u otra app similar." },
  { q: "¿Cómo extraen mis datos sin que yo dé acceso?",
    a: "Usamos Reclaim Protocol (zkTLS): vos abrís tu app de Tigo en tu celular y se genera una prueba matemática de tus transacciones sin que nadie vea los datos crudos. Es como mostrar el resultado de una suma sin revelar los números." },
  { q: "¿Cuál es la tasa que voy a pagar?",
    a: "Depende de tu Score. Score alto (>750) → desde 12% anual. Score bajo (450-549) → hasta 38%. En todos los casos, mucho mejor que el 180% del prestamista informal." },
  { q: "¿Qué pasa si no puedo pagar a tiempo?",
    a: "Tenés grace period de 7 días. Después se aplica una pequeña penalidad y tu Score baja, pero no perdés nada (no hay colateral). El sistema está diseñado para que mejores con el tiempo, no para castigarte." },
  { q: "¿Mis datos están seguros?",
    a: "Sí. Nunca almacenamos tus credenciales bancarias. Los datos crudos nunca salen de tu teléfono — solo viajan pruebas criptográficas que se verifican on-chain." },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-24 px-4">
      <div className="max-w-3xl mx-auto space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <p className="text-quipu-500 text-sm font-semibold uppercase tracking-wider">Preguntas frecuentes</p>
          <h2 className="text-4xl sm:text-5xl font-black">Lo que querías preguntar</h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/8 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-sm font-semibold text-white">{f.q}</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={cn("text-neutral-500 transition-transform", open === i && "rotate-180")} aria-hidden>
                  <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className={cn("overflow-hidden transition-all", open === i ? "max-h-48" : "max-h-0")}>
                <p className="px-4 pb-4 text-sm text-neutral-400 leading-relaxed">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
