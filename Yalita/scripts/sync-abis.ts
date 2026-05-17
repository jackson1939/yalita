// Lee los artefactos de Foundry (contracts/out/*) y actualiza shared/src/abis/*.ts
// Uso: npx tsx scripts/sync-abis.ts

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CONTRACTS = [
  { src: "ScoreRegistry.sol/ScoreRegistry.json", out: "scoreRegistry.ts", name: "SCORE_REGISTRY_ABI" },
  { src: "AttestationRegistry.sol/AttestationRegistry.json", out: "attestationRegistry.ts", name: "ATTESTATION_REGISTRY_ABI" },
  { src: "ScoringEngine.sol/ScoringEngine.json", out: "scoringEngine.ts", name: "SCORING_ENGINE_ABI" },
  { src: "LendingPool.sol/LendingPool.json", out: "lendingPool.ts", name: "LENDING_POOL_ABI" },
];

const ROOT = process.cwd();

for (const { src, out, name } of CONTRACTS) {
  const artifactPath = join(ROOT, "contracts", "out", src);
  try {
    const artifact = JSON.parse(readFileSync(artifactPath, "utf-8")) as { abi: unknown };
    const tsContent = `// Auto-generado desde contracts/out/${src}\n// Ejecutar: npx tsx scripts/sync-abis.ts\n\nexport const ${name} = ${JSON.stringify(artifact.abi, null, 2)} as const;\n`;
    writeFileSync(join(ROOT, "shared", "src", "abis", out), tsContent);
    console.info(`✓ ${out}`);
  } catch (err) {
    console.warn(`✗ ${src}: ${(err as Error).message}`);
  }
}
