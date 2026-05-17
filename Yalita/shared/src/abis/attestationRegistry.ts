export const ATTESTATION_REGISTRY_ABI = [
  {
    type: "function", name: "submitAttestation", stateMutability: "nonpayable",
    inputs: [
      { name: "proofHash", type: "bytes32" },
      { name: "source", type: "uint8" },
      { name: "user", type: "address" },
      { name: "txCount", type: "uint32" },
      { name: "totalVolumeBs", type: "uint64" },
      { name: "monthsCovered", type: "uint8" },
    ],
    outputs: [],
  },
  {
    type: "function", name: "getLatestAttestation", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{
      type: "tuple",
      components: [
        { name: "proofHash", type: "bytes32" },
        { name: "source", type: "uint8" },
        { name: "user", type: "address" },
        { name: "timestamp", type: "uint48" },
        { name: "txCount", type: "uint32" },
        { name: "totalVolumeBs", type: "uint64" },
        { name: "monthsCovered", type: "uint8" },
        { name: "valid", type: "bool" },
      ],
    }],
  },
  {
    type: "event", name: "AttestationSubmitted",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "proofHash", type: "bytes32", indexed: true },
      { name: "source", type: "uint8", indexed: false },
      { name: "txCount", type: "uint32", indexed: false },
      { name: "totalVolumeBs", type: "uint64", indexed: false },
    ],
  },
] as const;
