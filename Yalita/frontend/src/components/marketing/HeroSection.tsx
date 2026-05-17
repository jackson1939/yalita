"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20">
      <div aria-hidden className="absolute inset-0 bg-neutral-950"
        style={{ backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(34,197,94,0.15), transparent)" }} />
      <div aria-hidden className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-quipu-500/30 bg-quipu-500/10 text-quipu-500 text-sm font-medium"
        >
          <span className="w-2 h-2 rounded-full bg-quipu-500 animate-pulse" />
          Avalanche Hackathon 2026 — DPI Protocol
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight"
        >
          Tu historial de pagos QR
          <br />
          <span className="text-quipu-500">vale más que tu banco</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-neutral-400 leading-relaxed"
        >
          Yalita convierte cada pago que hiciste con Tigo Money o SIMPLE en una{" "}
          <span className="text-white font-medium">identidad financiera on-chain</span>.
          Crédito justo en minutos. Sin colateral. Sin banco.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/onboarding">
            <Button variant="primary" size="lg">Obtener mi Score gratis →</Button>
          </Link>
          <Link href="/como-funciona">
            <Button variant="outline" size="lg">Cómo funciona</Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500 pt-4"
        >
          <span>🔒 Privacidad zkTLS</span>
          <span>⛓️ Avalanche L1</span>
          <span>📱 Solo tu celular</span>
        </motion.div>
      </div>
    </section>
  );
}
