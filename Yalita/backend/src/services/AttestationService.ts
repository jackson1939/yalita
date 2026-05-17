import { walletClient, contractAddresses } from "../lib/blockchain";
import { db } from "../lib/db";
import { ATTESTATION_REGISTRY_ABI, SCORING_ENGINE_ABI } from "@yalita/shared";
import { generateProofHash } from "../utils/crypto";
import type { Address, DataSource } from "@yalita/shared";

type PrismaDataSource =
  | "TIGO_MONEY"
  | "SIMPLE_BANK"
  | "BANCO_UNION"
  | "BELVO"
  | "SELF_ATTESTED";

const DATA_SOURCE_TO_ENUM: Record<DataSource, number> = {
  TIGO_MONEY: 0,
  SIMPLE_BANK: 1,
  BANCO_UNION: 2,
  BELVO: 3,
  SELF_ATTESTED: 4,
};

export class AttestationService {
  /**
   * Submitea una attestation on-chain y dispara el cálculo del score.
   * Requiere walletClient (oracle key configurada).
   */
  async submit(input: {
    user: Address;
    dataSource: DataSource;
    txCount: number;
    totalVolumeBs: number;
    monthsCovered: number;
  }) {
    if (!walletClient) throw new Error("Oracle wallet not configured");

    const proofHash = generateProofHash(input.user, BigInt(Date.now()));

    // 1. Submit attestation
    const submitTx = await walletClient.writeContract({
      address: contractAddresses.attestationRegistry,
      abi: ATTESTATION_REGISTRY_ABI,
      functionName: "submitAttestation",
      args: [
        proofHash,
        DATA_SOURCE_TO_ENUM[input.dataSource],
        input.user,
        input.txCount,
        BigInt(Math.round(input.totalVolumeBs * 100)),
        input.monthsCovered,
      ],
    });

    // 2. Trigger score calculation
    const scoreTx = await walletClient.writeContract({
      address: contractAddresses.scoringEngine,
      abi: SCORING_ENGINE_ABI,
      functionName: "computeAndIssueScore",
      args: [input.user],
    });

    // 3. Persistir en la DB
    const user = await db.user.findUnique({ where: { walletAddress: input.user } });
    if (user) {
      await db.attestation.create({
        data: {
          userId: user.id,
          walletAddress: input.user,
          proofHash,
          dataSource: input.dataSource as PrismaDataSource,
          txCount: input.txCount,
          totalVolumeBs: BigInt(Math.round(input.totalVolumeBs * 100)),
          monthsCovered: input.monthsCovered,
          txHashOnChain: submitTx,
        },
      });
    }

    return { proofHash, attestationTx: submitTx, scoreTx };
  }

  async getByUser(walletAddress: Address) {
    return db.attestation.findMany({
      where: { walletAddress, valid: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
