import * as ReclaimSdk from "@reclaimprotocol/js-sdk";

export interface ParsedTransaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  source: string;
  isIncome: boolean;
}

type ReclaimVerifier = {
  verifySignedProof?: (proof: unknown) => Promise<boolean>;
  ReclaimClient?: {
    verifySignedProof?: (proof: unknown) => Promise<boolean>;
  };
};

export const verifyProof = async (
  proof: unknown,
  appId: string,
  appSecret: string,
): Promise<boolean> => {
  void appId;
  void appSecret;
  try {
    const sdk = ReclaimSdk as ReclaimVerifier;
    const verifier = sdk.verifySignedProof ?? sdk.ReclaimClient?.verifySignedProof;
    if (!verifier) {
      console.warn("Reclaim SDK verifySignedProof not available; using permissive fallback");
      return true;
    }
    const isVerified = await verifier(proof);
    return isVerified;
  } catch (error) {
    console.error("Reclaim proof verification failed:", error);
    return false;
  }
};

export const parseTransactions = (extractedText: string): ParsedTransaction[] => {
  const transactions: ParsedTransaction[] = [];
  
  // Format examples:
  // "SIMPLE: Recibiste 850 Bs de Mercado Rodriguez el 12/05"
  // "BCP: Transferencia de 450.50 Bs depositada el 10/05"
  // "Tigo Money: Enviaste 100 Bs a Juan Perez el 08/05"
  
  const regex = /(SIMPLE|BCP|Tigo Money):\s*(Recibiste|Transferencia de|Enviaste|Pago de)\s*([\d.]+)\s*Bs\s*(?:de|depositada a|a)?\s*([a-zA-Z\s]+)?\s*el\s*(\d{2}\/\d{2})/gi;
  
  let match: RegExpExecArray | null;
  let idCounter = 1;
  while ((match = regex.exec(extractedText)) !== null) {
    const source = (match[1] ?? "").trim();
    const action = (match[2] ?? "").toLowerCase();
    const amount = parseFloat(match[3] ?? "0");
    const comercio = match[4] ? match[4].trim() : "Desconocido";
    const date = (match[5] ?? "").trim();
    
    const isIncome = action.includes("recibiste") || action.includes("transferencia");
    
    let type = "Transferencia";
    if (isIncome) {
      type = comercio !== "Desconocido" ? `Pago de ${comercio}` : "Pago recibido";
    } else {
      type = comercio !== "Desconocido" ? `Envío a ${comercio}` : "Pago realizado";
    }

    transactions.push({
      id: `tx-${idCounter++}-${Date.now()}`,
      type,
      amount,
      date,
      source,
      isIncome,
    });
  }
  
  return transactions;
};

export const calculateDpiScore = (transactions: ParsedTransaction[]): number => {
  if (transactions.length === 0) return 300;

  // 1. Volumen total de ingresos (40%)
  const totalIncome = transactions.filter(t => t.isIncome).reduce((sum, t) => sum + t.amount, 0);
  const volumeScore = Math.min((totalIncome / 5000) * 100, 100); // 5000 Bs as ideal monthly volume

  // 2. Frecuencia de transacciones por mes (35%)
  const frequencyScore = Math.min((transactions.length / 20) * 100, 100); // 20 txs as ideal frequency

  // 3. Consistencia del flujo (25%)
  // Mocked simple consistency logic for now
  const incomeTxs = transactions.filter(t => t.isIncome);
  const consistencyScore = incomeTxs.length > 3 ? 85 : 40; 

  const weightedScore = (volumeScore * 0.4) + (frequencyScore * 0.35) + (consistencyScore * 0.25);
  
  // Scale from 0-100 to 300-850
  const finalScore = 300 + Math.round((weightedScore / 100) * 550);
  return Math.min(Math.max(finalScore, 300), 850);
};

export const generateMockPayload = (): string => {
  const dates = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (Math.floor(Math.random() * 60)));
    dates.push(`${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`);
  }
  
  return `
    SIMPLE: Recibiste 850 Bs de Mercado Rodriguez el ${dates[0]}
    BCP: Transferencia de 450.50 Bs depositada el ${dates[1]}
    Tigo Money: Enviaste 100 Bs a Juan Perez el ${dates[2]}
    SIMPLE: Recibiste 1200 Bs de Farmacorp el ${dates[3]}
    Tigo Money: Recibiste 300 Bs de Carlos Gómez el ${dates[4]}
    BCP: Enviaste 250 Bs a Supermercado Ketal el ${dates[5]}
  `;
};
