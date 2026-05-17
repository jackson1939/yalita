// Seed mínimo para tener datos en desarrollo.
// Ejecutar: pnpm db:seed

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const walletAddress = "0xDEMO000000000000000000000000000000000001";
  const now = new Date();

  const maria = await db.user.upsert({
    where: { walletAddress },
    update: {
      firstName: "María",
      phoneNumber: "+59171234567",
      email: "maria.demo@yalita.app",
    },
    create: {
      walletAddress,
      phoneNumber: "+59171234567",
      firstName: "María",
      email: "maria.demo@yalita.app",
    },
  });

  const existingScore = await db.score.findFirst({
    where: { walletAddress },
    orderBy: { createdAt: "desc" },
  });
  if (!existingScore) {
    await db.score.create({
      data: {
        userId: maria.id,
        walletAddress,
        score: 720,
        totalTxs: 47,
        volumeBs: 34_500n,
        txHash: "0xdemo_score_tx_hash",
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const existingAttestation = await db.attestation.findFirst({
    where: { walletAddress, valid: true },
  });
  if (!existingAttestation) {
    await db.attestation.create({
      data: {
        userId: maria.id,
        walletAddress,
        proofHash: "demo_proof_hash_tigo_money",
        dataSource: "TIGO_MONEY",
        txCount: 47,
        totalVolumeBs: 34_500n,
        monthsCovered: 8,
        txHashOnChain: "0xdemo_attestation_tx_hash",
        valid: true,
      },
    });
  }

  let activeLoan = await db.loan.findFirst({
    where: { walletAddress, status: "ACTIVE" },
    include: { payments: true },
  });

  if (!activeLoan) {
    activeLoan = await db.loan.create({
      data: {
        userId: maria.id,
        walletAddress,
        principal: 150_000_000n,
        totalDue: 162_000_000n,
        paidAmount: 54_000_000n,
        annualRateBps: 1200,
        durationDays: 90,
        dueTimestamp: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
        txHash: "0xdemo_loan_tx_hash",
      },
    });
  }

  const hasManualDemoPayment = await db.payment.findFirst({
    where: { loanId: activeLoan.id, txHash: "0xdemo_payment_tx_hash" },
  });
  if (!hasManualDemoPayment) {
    await db.payment.create({
      data: {
        loanId: activeLoan.id,
        amount: 54_000_000n,
        txHash: "0xdemo_payment_tx_hash",
        source: "MANUAL",
      },
    });
  }

  console.info("✅ Demo seed completado: María, score 720, préstamo Bs 1043 activo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void db.$disconnect());
