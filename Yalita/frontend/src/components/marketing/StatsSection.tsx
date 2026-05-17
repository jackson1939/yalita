"use client";

import { motion } from "framer-motion";

const STATS = [
  { value: "210M", label: "personas sin acceso a crédito formal en Latam" },
  { value: "180%", label: "tasa anual promedio del prestamista informal" },
  { value: "3 min", label: "tiempo para obtener tu Score Yalita" },
  { value: "$5K", label: "límite máximo de crédito en la primera solicitud" },
];

export function StatsSection() {
  return (
    <section className="py-20 px-4 border-y border-white/5">
      <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
        {STATS.map((s, i) => (
          <motion.div
            key={s.value}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="text-center space-y-2"
          >
            <p className="text-4xl lg:text-5xl font-black text-quipu-500">{s.value}</p>
            <p className="text-sm text-neutral-400 leading-snug">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
