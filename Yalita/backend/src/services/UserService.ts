import { db } from "../lib/db";
import type { Address } from "@yalita/shared";

export class UserService {
  async registerOrGet(input: {
    walletAddress: Address;
    phoneNumber?: string;
    email?: string;
    firstName?: string;
    ci?: string;
  }) {
    return db.user.upsert({
      where: { walletAddress: input.walletAddress },
      create: input,
      update: {
        ...(input.phoneNumber && { phoneNumber: input.phoneNumber }),
        ...(input.email && { email: input.email }),
        ...(input.firstName && { firstName: input.firstName }),
        ...(input.ci && { ci: input.ci }),
      },
    });
  }

  async getByWallet(walletAddress: Address) {
    const user = await db.user.findUnique({
      where: { walletAddress },
      include: {
        scores: { orderBy: { createdAt: "desc" }, take: 1 },
        loans: { where: { status: "ACTIVE" } },
        attestations: { where: { valid: true }, orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    if (!user) return null;

    return {
      ...user,
      latestScore: user.scores[0] ?? null,
      activeLoan: user.loans[0] ?? null,
      latestAttestation: user.attestations[0] ?? null,
    };
  }
}
