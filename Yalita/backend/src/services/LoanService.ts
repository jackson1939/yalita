import { db } from "../lib/db";
import { publicClient, walletClient, contractAddresses } from "../lib/blockchain";
import { LENDING_POOL_ABI } from "@yalita/shared";
import type { Address, LoanStatus as SharedLoanStatus } from "@yalita/shared";
import { WavyNodeService } from "./WavyNodeService";

type LoanStatus = "ACTIVE" | "REPAID" | "OVERDUE" | "DEFAULTED";
type PaymentSource = "MANUAL" | "AUTO_QR";

export class LoanService {
  private readonly wavyNodeService = new WavyNodeService();

  async getActive(walletAddress: Address) {
    return db.loan.findFirst({
      where: { walletAddress, status: "ACTIVE" },
      include: { payments: { orderBy: { createdAt: "desc" }, take: 10 } },
    });
  }

  async getHistory(walletAddress: Address) {
    return db.loan.findMany({
      where: { walletAddress },
      orderBy: { createdAt: "desc" },
      include: { payments: true },
    });
  }

  async getQuote(user: Address, principalUsdc: bigint, durationDays: number) {
    const [annualRateBps, totalDue, monthlyPayment] = await publicClient.readContract({
      address: contractAddresses.lendingPool,
      abi: LENDING_POOL_ABI,
      functionName: "getQuote",
      args: [user, principalUsdc, durationDays],
    });
    return {
      annualRateBps: Number(annualRateBps),
      totalDue: totalDue.toString(),
      monthlyPayment: monthlyPayment.toString(),
      originationFee: ((principalUsdc * 150n) / 10_000n).toString(),
    };
  }

  /**
   * Origina un préstamo on-chain firmando con el oracle (en producción esto
   * sería iniciado por el usuario, pero para demo el backend coordina).
   */
  async request(input: { walletAddress: Address; principalUsd: number; durationDays: number }) {
    if (!walletClient) throw new Error("Oracle wallet not configured");

    const user = await db.user.findUnique({ where: { walletAddress: input.walletAddress } });
    if (!user) throw new Error("User not found");

    const principalUsdc = BigInt(Math.round(input.principalUsd * 1e6));

    // Quote para conocer la tasa
    const quote = await this.getQuote(input.walletAddress, principalUsdc, input.durationDays);

    const risk = await this.wavyNodeService.getRiskScore(input.walletAddress);
    if (risk.riskScore < 30) {
      throw new Error("RISK_TOO_HIGH: Wavy Node risk score below threshold");
    }

    const txHash = await walletClient.writeContract({
      address: contractAddresses.lendingPool,
      abi: LENDING_POOL_ABI,
      functionName: "requestLoan",
      args: [principalUsdc, input.durationDays],
    });

    return db.loan.create({
      data: {
        userId: user.id,
        walletAddress: input.walletAddress,
        principal: principalUsdc,
        totalDue: BigInt(quote.totalDue),
        annualRateBps: quote.annualRateBps,
        durationDays: input.durationDays,
        dueTimestamp: new Date(Date.now() + input.durationDays * 24 * 3600 * 1000),
        txHash,
        status: "ACTIVE",
      },
    });
  }

  async repay(input: {
    walletAddress: Address;
    amountUsd: number;
    source: PaymentSource;
  }) {
    if (!walletClient) throw new Error("Oracle wallet not configured");

    const loan = await db.loan.findFirst({
      where: { walletAddress: input.walletAddress, status: "ACTIVE" },
    });
    if (!loan) throw new Error("No active loan");

    const amountUsdc = BigInt(Math.round(input.amountUsd * 1e6));

    const txHash = await walletClient.writeContract({
      address: contractAddresses.lendingPool,
      abi: LENDING_POOL_ABI,
      functionName: "repayLoan",
      args: [amountUsdc],
    });

    const newPaid = loan.paidAmount + amountUsdc;
    const newStatus: LoanStatus = newPaid >= loan.totalDue ? "REPAID" : "ACTIVE";

    const [, updated] = await db.$transaction([
      db.payment.create({
        data: { loanId: loan.id, amount: amountUsdc, txHash, source: input.source },
      }),
      db.loan.update({
        where: { id: loan.id },
        data: { paidAmount: newPaid, status: newStatus },
      }),
    ]);

    return { txHash, newStatus: updated.status as SharedLoanStatus };
  }
}
