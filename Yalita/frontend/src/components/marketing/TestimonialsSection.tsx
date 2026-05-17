"use client";

import { motion } from "framer-motion";

const TESTIMONIALS = [
  { quote: "El banco me rechazó tres veces. Yalita vio mis 8 años de pagos con Tigo y me dio Bs 5.000 en 10 minutos.",
    name: "María G.", role: "Vendedora de salteñas, La Paz", score: 712, avatar: "MG" },
  { quote: "No tenía cuenta bancaria ni tarjeta. Solo mi celular y mis cobros QR del mercado. Ahora tengo historial.",
    name: "Roberto C.", role: "Ferretero, Cochabamba", score: 684, avatar: "RC" },
  { quote: "La tasa que me dieron fue mejor que la del banco que me rechazó. No lo podía creer.",
    name: "Lucia V.", role: "Emprendedora textil, El Alto", score: 748, avatar: "LV" },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4" id="historias">
      <div className="max-w-5xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <p className="text-quipu-500 text-sm font-semibold uppercase tracking-wider">Historias reales</p>
          <h2 className="text-4xl sm:text-5xl font-black">Las personas que Yalita<br /><span className="text-neutral-400">ya está cambiando</span></h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5 hover:border-quipu-500/20 transition-colors"
            >
              <p className="text-neutral-300 text-sm leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-quipu-500/20 text-quipu-500 font-bold text-sm flex items-center justify-center flex-shrink-0">{t.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white truncate">{t.name}</p>
                  <p className="text-neutral-500 text-xs truncate">{t.role}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-quipu-500 font-black text-lg">{t.score}</p>
                  <p className="text-neutral-600 text-xs">Score</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
