// ──────────────────────────────────────────────────────────────────────────────
// Yape Email Parser
// ──────────────────────────────────────────────────────────────────────────────
// Parsea facturas emitidas por notificacionesyape@bcp.com.bo
//
// Formato real (referencia: factura del usuario):
//   Razón social:     MIJAEL MERIDA ALVARADO
//   Número documento: 10798440
//   Empresa:          ENTEL S.A. / COMPRA DE PAQUETE
//   Número factura:   63425759||307805
//   Monto:            Bs. 4,0
//   Fecha transacción: 2026-05-16
//
// Estrategia: regex robusta + soporta variaciones de espacios, saltos de línea
// y formato de moneda (Bs., Bs, BOB).
// ──────────────────────────────────────────────────────────────────────────────

export interface YapeTransaction {
  id: string;
  date: string;             // ISO YYYY-MM-DD
  amountBs: number;         // Float en bolivianos
  merchant: string;         // Empresa / comercio
  documentNumber: string;   // Número documento del usuario
  invoiceNumber: string;    // Número factura
  category?: string;        // "telecom", "alimentos", "transporte", etc.
  isIncome: boolean;        // true=ingreso (cobro), false=egreso (gasto)
}

const MONTH_MS = 30 * 24 * 3600 * 1000;

// ── Regex patterns ─────────────────────────────────────────────────────────
const PATTERNS = {
  razonSocial:  /Raz[oó]n\s+social:\s*([^\n\r]+?)(?:\s*\n|$)/i,
  documento:    /N[uú]mero\s+(?:de\s+)?documento:\s*(\d+)/i,
  empresa:      /Empresa:\s*([^\n\r]+?)(?:\s*\n|$)/i,
  factura:      /N[uú]mero\s+factura:\s*([^\n\r]+?)(?:\s*\n|$)/i,
  monto:        /Monto:\s*(?:Bs\.?|BOB)\s*([\d.,]+)/i,
  fecha:        /Fecha\s+transacci[oó]n:\s*(\d{4}-\d{2}-\d{2})/i,
};

// ── Categorización por palabras clave ──────────────────────────────────────
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  telecom:     ["ENTEL", "TIGO", "VIVA", "PAQUETE", "INTERNET", "DATOS"],
  alimentos:   ["MERCADO", "SUPERMERCADO", "KETAL", "HIPERMAXI", "FIDALGA", "RESTAURANTE", "POLLO", "RAPPI"],
  transporte:  ["TAXI", "UBER", "DIDI", "INDRIVE", "TRUFI", "GASOLINA", "YPFB"],
  salud:       ["FARMACIA", "FARMACORP", "HOSPITAL", "CLINICA", "BOTICAS"],
  servicios:   ["AGUA", "LUZ", "ELECTRICIDAD", "CRE", "ELFEC", "DELAPAZ", "SAGUAPAC"],
  comercio:    ["TIENDA", "DISTRIBUIDORA", "MAYORISTA"],
  educacion:   ["UNIVERSIDAD", "COLEGIO", "INSTITUTO", "ACADEMIA"],
  servidor:    ["COMPRA"],
};

function detectCategory(merchant: string): string {
  const upper = merchant.toUpperCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => upper.includes(kw))) return cat;
  }
  return "otros";
}

// ── Parser principal ───────────────────────────────────────────────────────
/**
 * Parsea UN solo email/factura Yape. Devuelve null si el formato no calza.
 */
export function parseYapeInvoice(rawText: string): YapeTransaction | null {
  if (!rawText || rawText.length < 30) return null;

  const razon  = PATTERNS.razonSocial.exec(rawText)?.[1]?.trim();
  const doc    = PATTERNS.documento.exec(rawText)?.[1]?.trim();
  const empresa = PATTERNS.empresa.exec(rawText)?.[1]?.trim();
  const factura = PATTERNS.factura.exec(rawText)?.[1]?.trim();
  const montoStr = PATTERNS.monto.exec(rawText)?.[1]?.trim();
  const fecha = PATTERNS.fecha.exec(rawText)?.[1]?.trim();

  // Mínimo necesario: monto y fecha. Sin esos no es factura válida.
  if (!montoStr || !fecha) return null;

  // Normalizar monto: "4,0" → 4.0, "1.500,50" → 1500.50, "1500" → 1500
  const amountBs = normalizeAmountBs(montoStr);
  if (!Number.isFinite(amountBs) || amountBs <= 0) return null;

  const merchant = empresa ?? "Comercio desconocido";

  return {
    id: `yape_${fecha}_${factura ?? Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    date: fecha,
    amountBs,
    merchant,
    documentNumber: doc ?? "",
    invoiceNumber: factura ?? "",
    category: detectCategory(merchant),
    // Una factura Yape SIEMPRE es un GASTO del usuario (pagó algo)
    // Para historial crediticio nos interesan los gastos también
    isIncome: false,
  };
}

/**
 * Parsea múltiples emails de Yape concatenados.
 * Útil cuando Reclaim devuelve un dump completo del inbox.
 */
export function parseYapeInvoices(rawText: string): YapeTransaction[] {
  if (!rawText) return [];

  // Separar por línea "Factura Yape" o por bloques con la palabra "Razón social"
  const blocks = rawText
    .split(/(?=Raz[oó]n\s+social:)/i)
    .map((b) => b.trim())
    .filter((b) => b.length > 30);

  const txs: YapeTransaction[] = [];
  for (const block of blocks) {
    const tx = parseYapeInvoice(block);
    if (tx) txs.push(tx);
  }
  return txs;
}

// ── Normalización ──────────────────────────────────────────────────────────
function normalizeAmountBs(raw: string): number {
  // Quitar espacios
  let s = raw.replace(/\s/g, "");

  // Determinar separador decimal vs miles
  // Si tiene tanto coma como punto, el que esté al final es el decimal
  const lastComma = s.lastIndexOf(",");
  const lastDot   = s.lastIndexOf(".");

  if (lastComma > -1 && lastDot > -1) {
    // Formato europeo: "1.500,50" → "1500.50"
    if (lastComma > lastDot) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      // Formato US: "1,500.50" → "1500.50"
      s = s.replace(/,/g, "");
    }
  } else if (lastComma > -1) {
    // Solo coma — asumir decimal: "4,0" → "4.0"
    s = s.replace(",", ".");
  }
  // Solo punto: ya está bien

  return parseFloat(s);
}

// ── DPI Score calculation desde transacciones Yape ─────────────────────────
/**
 * Calcula el DPI Score a partir de un historial Yape parseado.
 * Algoritmo: V (volumen) × 0.4 + F (frecuencia) × 0.35 + C (consistencia) × 0.25
 * Rango: 300-850 (mismo que FICO/Equifax)
 */
export function calculateYapeScore(txs: YapeTransaction[]): {
  score: number;
  breakdown: { volume: number; frequency: number; consistency: number };
  totalVolumeBs: number;
  monthsCovered: number;
  txCount: number;
} {
  if (txs.length === 0) {
    return {
      score: 300,
      breakdown: { volume: 0, frequency: 0, consistency: 0 },
      totalVolumeBs: 0,
      monthsCovered: 0,
      txCount: 0,
    };
  }

  // Ordenar por fecha
  const sorted = [...txs].sort((a, b) => a.date.localeCompare(b.date));

  const firstDate = new Date(sorted[0]!.date).getTime();
  const lastDate  = new Date(sorted[sorted.length - 1]!.date).getTime();
  const monthsCovered = Math.max(1, Math.ceil((lastDate - firstDate) / MONTH_MS));

  const totalVolumeBs = sorted.reduce((s, t) => s + t.amountBs, 0);
  const monthlyVolumeBs = totalVolumeBs / monthsCovered;
  const txPerMonth = sorted.length / monthsCovered;

  // V — Volumen: log-scale, target Bs 50.000/mes = 100
  const volume = Math.min(100, Math.round((Math.log2(monthlyVolumeBs + 1) / Math.log2(50_001)) * 100));

  // F — Frecuencia: lineal, target 30 tx/mes = 100
  const frequency = Math.min(100, Math.round((txPerMonth / 30) * 100));

  // C — Consistencia: % de meses con al menos 1 tx
  const monthsWithActivity = new Set(sorted.map((t) => t.date.slice(0, 7))).size;
  const consistency = Math.min(100, Math.round((monthsWithActivity / monthsCovered) * 100));

  // Ponderado y mapeado a 300-850
  const weighted = volume * 0.4 + frequency * 0.35 + consistency * 0.25;
  const score = Math.round(300 + (weighted / 100) * 550);

  return {
    score: Math.max(300, Math.min(850, score)),
    breakdown: { volume, frequency, consistency },
    totalVolumeBs,
    monthsCovered,
    txCount: sorted.length,
  };
}

// ── Mock data realista para demo sin Gmail conectado ───────────────────────
/**
 * Genera un historial Yape sintético creíble basado en el perfil de "Doña María":
 * vendedora de mercado, 6 meses de historial, ~25 tx/mes, varios comercios típicos.
 */
export function generateMockYapeHistory(monthsCovered = 6): YapeTransaction[] {
  const txs: YapeTransaction[] = [];
  const now = Date.now();

  const MERCHANTS: Array<{ name: string; min: number; max: number; weight: number }> = [
    { name: "ENTEL S.A. / COMPRA DE PAQUETE",     min: 4,    max: 25,   weight: 12 },
    { name: "TIGO BOLIVIA / RECARGA",              min: 5,    max: 30,   weight: 10 },
    { name: "SUPERMERCADO KETAL",                   min: 50,   max: 350,  weight: 8 },
    { name: "HIPERMAXI / COMPRA",                   min: 80,   max: 500,  weight: 7 },
    { name: "FARMACORP / VENTA",                    min: 15,   max: 180,  weight: 6 },
    { name: "MERCADO RODRIGUEZ / DISTRIBUIDORA",   min: 100,  max: 800,  weight: 8 },
    { name: "YPFB / GASOLINA",                      min: 50,   max: 200,  weight: 5 },
    { name: "UBER BOLIVIA",                          min: 12,   max: 45,   weight: 6 },
    { name: "RESTAURANTE EL CIPRES",                min: 25,   max: 80,   weight: 4 },
    { name: "POLLOS COPACABANA / COMPRA",           min: 30,   max: 70,   weight: 5 },
    { name: "DELAPAZ / SERVICIO ELECTRICO",        min: 80,   max: 250,  weight: 2 },
    { name: "SAGUAPAC / AGUA",                       min: 25,   max: 80,   weight: 2 },
  ];

  const weighted: typeof MERCHANTS = [];
  MERCHANTS.forEach((m) => {
    for (let i = 0; i < m.weight; i++) weighted.push(m);
  });

  const txPerMonth = 22;
  const total = monthsCovered * txPerMonth;

  for (let i = 0; i < total; i++) {
    const merchant = weighted[Math.floor(Math.random() * weighted.length)]!;
    const amount = Math.round((merchant.min + Math.random() * (merchant.max - merchant.min)) * 10) / 10;
    const daysAgo = Math.floor(Math.random() * monthsCovered * 30);
    const date = new Date(now - daysAgo * 86400_000).toISOString().slice(0, 10);

    txs.push({
      id: `mock_yape_${i}_${Math.random().toString(36).slice(2, 7)}`,
      date,
      amountBs: amount,
      merchant: merchant.name,
      documentNumber: "10798440",
      invoiceNumber: `${60000000 + i}||${300000 + i}`,
      category: detectCategory(merchant.name),
      isIncome: false,
    });
  }

  return txs.sort((a, b) => b.date.localeCompare(a.date));
}
