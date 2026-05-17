// Quipu — Conversion Bs ↔ USDC
// Tipo de cambio oficial Bolivia: 1 USD = 6.96 Bs (hardcoded)

const EXCHANGE_RATE = 6.96;

/**
 * Convierte un monto en bolivianos a USDC.
 * Redondea a 6 decimales (precisión USDC estándar).
 */
export function bsToUsdc(bs: number): number {
  return Math.round((bs / EXCHANGE_RATE) * 1_000_000) / 1_000_000;
}

/**
 * Convierte un monto en USDC a bolivianos.
 * Redondea a 2 decimales (precisión Bs estándar).
 */
export function usdcToBs(usdc: number): number {
  return Math.round(usdc * EXCHANGE_RATE * 100) / 100;
}
