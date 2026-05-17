"use client";

import { motion } from "framer-motion";

const ROWS = [
  { feature: "Requiere historial bancario", bank: true, informal: false, Yalita: false },
  { feature: "Requiere colateral", bank: true, informal: true, Yalita: false },
  { feature: "Aprobación instantánea", bank: false, informal: true, Yalita: true },
  { feature: "Tasa anual justa (<30%)", bank: true, informal: false, Yalita: true },
  { feature: "Repago automático", bank: false, informal: false, Yalita: true },
  { feature: "Privacidad de datos", bank: false, informal: false, Yalita: true },
  { feature: "24/7 desde celular", bank: false, informal: false, Yalita: true },
];

const Check = ({ v }: { v: boolean }) =>
  v ? <span className="text-quipu-500 font-bold text-lg">✓</span>
    : <span className="text-neutral-600 font-bold text-lg">✗</span>;

export function ComparisonSection() {
  return (
    <section className="py-24 px-4 bg-white/[0.02]" id="comparativa">
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <p className="text-quipu-500 text-sm font-semibold uppercase tracking-wider">Comparativa</p>
          <h2 className="text-4xl sm:text-5xl font-black">Yalita vs. las alternativas</h2>
          <p className="text-neutral-400 max-w-xl mx-auto">
            El banco te rechazó. El prestamista te cobra el 180%. Doña María merece una tercera opción.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="overflow-x-auto"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 pr-4 text-neutral-400 font-medium text-sm w-1/2">Característica</th>
                <th className="py-4 px-4 text-center text-neutral-400 font-medium text-sm">🏦 Banco</th>
                <th className="py-4 px-4 text-center text-neutral-400 font-medium text-sm">🦈 Informal</th>
                <th className="py-4 px-4 text-center font-bold text-sm"><span className="text-quipu-500">✨ Yalita</span></th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row.feature} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.015]" : ""}`}>
                  <td className="py-4 pr-4 text-sm text-neutral-300">{row.feature}</td>
                  <td className="py-4 px-4 text-center"><Check v={row.bank} /></td>
                  <td className="py-4 px-4 text-center"><Check v={row.informal} /></td>
                  <td className="py-4 px-4 text-center"><Check v={row.Yalita} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
