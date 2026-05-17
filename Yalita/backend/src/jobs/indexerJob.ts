// Job de indexación: escucha eventos de los contratos y los persiste en la DB.
// Corre como worker separado o como cron en Vercel (vercel.json).
//
// Para el hackathon es un stub. En producción se reemplaza por Ponder o The Graph.

import { publicClient, contractAddresses } from "../lib/blockchain";
import { LENDING_POOL_ABI, SCORE_REGISTRY_ABI } from "@yalita/shared";
import { db } from "../lib/db";
import { logger } from "../lib/logger";

export async function pollContractEvents() {
  const fromBlock = await getLastIndexedBlock();
  const toBlock = await publicClient.getBlockNumber();

  if (fromBlock >= toBlock) return;

  // Eventos del LendingPool
  const loanLogs = await publicClient.getContractEvents({
    address: contractAddresses.lendingPool,
    abi: LENDING_POOL_ABI,
    eventName: "LoanOriginated",
    fromBlock,
    toBlock,
  });

  for (const log of loanLogs) {
    logger.info({ log }, "LoanOriginated event indexed");
    // TODO: upsert loan
  }

  // Eventos del ScoreRegistry
  const scoreLogs = await publicClient.getContractEvents({
    address: contractAddresses.scoreRegistry,
    abi: SCORE_REGISTRY_ABI,
    eventName: "ScoreMinted",
    fromBlock,
    toBlock,
  });

  for (const log of scoreLogs) {
    logger.info({ log }, "ScoreMinted event indexed");
    // TODO: upsert score record
  }

  await setLastIndexedBlock(toBlock);
}

async function getLastIndexedBlock(): Promise<bigint> {
  // TODO: persistir en una tabla "indexer_state"
  return 0n;
}

async function setLastIndexedBlock(_block: bigint): Promise<void> {
  // TODO
  await db.$queryRaw`SELECT 1`;
}
