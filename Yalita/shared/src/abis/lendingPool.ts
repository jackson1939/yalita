export const LENDING_POOL_ABI = [
  {
    type: "function", name: "addLiquidity", stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint128" }],
    outputs: [],
  },
  {
    type: "function", name: "removeLiquidity", stateMutability: "nonpayable",
    inputs: [{ name: "shares", type: "uint128" }],
    outputs: [],
  },
  {
    type: "function", name: "requestLoan", stateMutability: "nonpayable",
    inputs: [
      { name: "principal", type: "uint128" },
      { name: "durationDays", type: "uint32" },
    ],
    outputs: [],
  },
  {
    type: "function", name: "repayLoan", stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint128" }],
    outputs: [],
  },
  {
    type: "function", name: "getQuote", stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "principal", type: "uint128" },
      { name: "durationDays", type: "uint32" },
    ],
    outputs: [
      { name: "annualRateBps", type: "uint16" },
      { name: "totalDue", type: "uint128" },
      { name: "monthlyPayment", type: "uint128" },
    ],
  },
  {
    type: "function", name: "loans", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "principal", type: "uint128" },
      { name: "totalDue", type: "uint128" },
      { name: "dueTimestamp", type: "uint32" },
      { name: "annualRateBps", type: "uint16" },
      { name: "active", type: "bool" },
    ],
  },
  {
    type: "event", name: "LoanOriginated",
    inputs: [
      { name: "borrower", type: "address", indexed: true },
      { name: "principal", type: "uint128", indexed: false },
      { name: "annualRateBps", type: "uint16", indexed: false },
      { name: "dueDate", type: "uint32", indexed: false },
    ],
  },
  {
    type: "event", name: "LoanRepaid",
    inputs: [
      { name: "borrower", type: "address", indexed: true },
      { name: "amount", type: "uint128", indexed: false },
    ],
  },
] as const;
