"use client";

import { motion } from "framer-motion";

const STEPS = [
  { number: "01", icon: "📱", title: "Entra con tu celular",
    description: "Login con tu número de teléfono. Sin contraseñas, sin instalar wallet. Tu cuenta Web3 se crea automáticamente." },
  { number: "02", icon: "🔐", title: "Conecta Tigo Money o SIMPLE",
    description: "Reclaim Protocol extrae criptográficamente tu historial. Nosotros nunca vemos tus datos — solo la prueba matemática." },
  { number: "03", icon: "⛓️", title: "Tu Score se emite on-chain",
    description: "El algoritmo calcula tu DPI Score [300–850] y lo emite como NFT intransferible en Avalanche." },
  { number: "04", icon: "💸", title: "Crédito al instante",
    description: "Solicita hasta $5,000 USDC con tasa justa según tu score. Repago automático desde tus cobros QR." },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 px-4" id="como-funciona">
      <div className="max-w-5xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <p className="text-quipu-500 text-sm font-semibold uppercase tracking-wider">El proceso</p>
          <h2 className="text-4xl sm:text-5xl font-black">
            De pagos QR a crédito formal<br /><span className="text-neutral-400">en 4 pasos</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-4 hover:border-quipu-500/30 transition-colors duration-300"
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl">{step.icon}</span>
                <span className="text-6xl font-black text-white/5 leading-none select-none">{step.number}</span>
              </div>
              <h3 className="text-xl font-bold text-white">{step.title}</h3>
              <p className="text-neutral-400 leading-relaxed text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
