// Genera un dataset sintético y lo guarda en JSON.
// Uso: npx tsx scripts/generate-synthetic.ts [count]

import { writeFileSync } from "node:fs";
import { generateDataset } from "../backend/src/data/synthetic";

const count = Number(process.argv[2] ?? 100);
const dataset = generateDataset(count);

const path = `./data-synthetic-${count}.json`;
writeFileSync(
  path,
  JSON.stringify(dataset, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2)
);

const byProfile = dataset.reduce<Record<string, number>>((acc, u) => {
  acc[u.profile] = (acc[u.profile] ?? 0) + 1;
  return acc;
}, {});

const avgScore = Math.round(dataset.reduce((sum, u) => sum + u.expectedScore, 0) / dataset.length);

console.info(`✅ ${count} usuarios generados → ${path}`);
console.info(`   Perfiles: ${JSON.stringify(byProfile)}`);
console.info(`   Score promedio: ${avgScore}`);
