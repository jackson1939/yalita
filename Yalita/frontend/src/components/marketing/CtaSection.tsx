"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";

export function CtaSection() {
  return (
    <section className="py-24 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center space-y-8 bg-gradient-to-br from-quipu-500/10 to-transparent border border-quipu-500/20 rounded-3xl p-12"
      >
        <div className="space-y-4">
          <p className="text-quipu-500 text-sm font-semibold uppercase tracking-wider">Es tu turno</p>
          <h2 className="text-4xl sm:text-5xl font-black leading-tight">
            Hace 600 años los incas<br />
            registraban deudas en nudos.<br />
            <span className="text-quipu-500">Hoy lo hacemos en blockchain.</span>
          </h2>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Únete a los primeros usuarios que están construyendo su identidad financiera descentralizada.
          </p>
        </div>
        <Link href="/onboarding">
          <Button variant="primary" size="lg">Empezar ahora — es gratis</Button>
        </Link>
        <p className="text-neutral-600 text-sm">Solo necesitás tu número de celular.</p>
      </motion.div>
    </section>
  );
}
