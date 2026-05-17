import { keccak256, encodePacked, type Address } from "viem";

/**
 * Genera un hash determinístico para una attestation a partir del usuario
 * y un nonce (timestamp). Garantiza unicidad on-chain.
 */
export function generateProofHash(user: Address, nonce: bigint): `0x${string}` {
  return keccak256(encodePacked(["address", "uint256"], [user, nonce]));
}
