// Auto-sincronizado desde contracts/out tras forge build
// Ver scripts/sync-abis.ts

export const SCORE_REGISTRY_ABI = [
  { type: "constructor", inputs: [{ name: "initialOwner", type: "address" }], stateMutability: "nonpayable" },
  {
    type: "function", name: "mintScore", stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "score", type: "uint16" },
      { name: "totalTxs", type: "uint32" },
      { name: "volumeBs", type: "uint64" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    type: "function", name: "updateScore", stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "newScore", type: "uint16" },
      { name: "totalTxs", type: "uint32" },
      { name: "volumeBs", type: "uint64" },
    ],
    outputs: [],
  },
  {
    type: "function", name: "getScore", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{
      type: "tuple",
      components: [
        { name: "score", type: "uint16" },
        { name: "updatedAt", type: "uint48" },
        { name: "totalTxs", type: "uint32" },
        { name: "volumeBs", type: "uint64" },
      ],
    }],
  },
  {
    type: "function", name: "hasScore", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "event", name: "ScoreMinted",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "score", type: "uint16", indexed: false },
    ],
  },
  {
    type: "event", name: "ScoreUpdated",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "newScore", type: "uint16", indexed: false },
    ],
  },
] as const;
