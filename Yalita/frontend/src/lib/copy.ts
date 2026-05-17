// "Modo Doña" — Diccionario para mostrar lenguaje no-cripto al usuario final.
// Toggle invisible que cambia entre modo simple (default) y técnico (para el pitch).

export const COPY = {
  simple: {
    wallet: "Tu cuenta digital",
    contract: "Acuerdo automático",
    usdc: "dólares digitales",
    blockchain: "sistema verificado",
    nft: "Tu reputación es tu mayor activo",
    signTx: "Confirmar con tu PIN",
    gasFee: "", // oculto en simple
    score: "Tu puntaje Yalita",
    attestation: "Verificación de pagos",
  },
  advanced: {
    wallet: "Wallet address",
    contract: "Smart contract",
    usdc: "USDC",
    blockchain: "Avalanche L1",
    nft: "Soulbound NFT",
    signTx: "Sign transaction",
    gasFee: "Gas fee",
    score: "DPI Score",
    attestation: "zkTLS Attestation",
  },
} as const;

export type UiMode = keyof typeof COPY;
export type CopyKey = keyof typeof COPY["simple"];
