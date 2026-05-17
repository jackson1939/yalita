export const SCORING_ENGINE_ABI = [
  {
    type: "function", name: "computeAndIssueScore", stateMutability: "nonpayable",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "score", type: "uint16" }],
  },
  {
    type: "function", name: "previewScore", stateMutability: "view",
    inputs: [
      { name: "txCount", type: "uint32" },
      { name: "volumeBs", type: "uint64" },
      { name: "months", type: "uint8" },
    ],
    outputs: [{ type: "uint16" }],
  },
  {
    type: "event", name: "ScoreCalculated",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "score", type: "uint16", indexed: false },
    ],
  },
] as const;
