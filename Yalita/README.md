# Yalita — Decentralized Payment Identity Protocol

> _"Hace 600 años los incas registraban deudas y transacciones en nudos de colores sin necesidad de bancos. Hoy lo hacemos con criptografía."_

Yalita convierte el historial de pagos QR de los **210M de latinos sin acceso a crédito formal** en una identidad financiera on-chain verificable. Sin banco. Sin colateral. En 3 minutos desde un celular.

[![Built on Avalanche](https://img.shields.io/badge/Built%20on-Avalanche-E84142?style=flat-square)](https://avax.network)
[![Hackathon 2026](https://img.shields.io/badge/Hackathon-2026-22c55e?style=flat-square)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](#)

---

## 🏗️ Arquitectura

```
┌────────────────────────────────────────────────────────────────┐
│              frontend/  ── Next.js 14 + Privy + Wagmi          │
│              (deploy: Vercel)                                  │
└────────────────────────────┬───────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼───────────────────────────────────┐
│              backend/   ── Hono API + Prisma + Neon            │
│              (deploy: Vercel Serverless)                       │
└────────────┬───────────────────────────────┬───────────────────┘
             │                               │
             ▼                               ▼
   ┌──────────────────┐          ┌────────────────────────┐
   │  Reclaim zkTLS   │          │  Avalanche Fuji L1    │
   │  Oracle Provider │          │  (4 smart contracts)  │
   └──────────────────┘          └────────────────────────┘
```

## 📁 Estructura del repositorio

```
team1/
├── frontend/         → Next.js 14 + Tailwind + Privy + Wagmi
├── backend/          → Hono + Prisma + Neon Postgres
├── contracts/        → Foundry: ScoreRegistry, AttestationRegistry, ScoringEngine, LendingPool
├── shared/           → Tipos TypeScript + ABIs compartidos
├── docs/             → Arquitectura, deployment, demo script
├── scripts/          → Generador de datos sintéticos, helpers
```

## 🎬 Demo en vivo

- Frontend: [https://yalita.vercel.app](https://yalita.vercel.app)
- Video: [pendiente - grabar antes del demo day]
- Contratos en Fuji:
  - ScoreRegistry: [https://testnet.snowtrace.io/address/0x<ADDRESS_1>](https://testnet.snowtrace.io/address/0x<ADDRESS_1>)
  - AttestationRegistry: [https://testnet.snowtrace.io/address/0x<ADDRESS_2>](https://testnet.snowtrace.io/address/0x<ADDRESS_2>)
  - ScoringEngine: [https://testnet.snowtrace.io/address/0x<ADDRESS_3>](https://testnet.snowtrace.io/address/0x<ADDRESS_3>)
  - LendingPool: [https://testnet.snowtrace.io/address/0x<ADDRESS_4>](https://testnet.snowtrace.io/address/0x<ADDRESS_4>)

## 🚀 Setup local

```bash
git clone <repo> && cd team1
pnpm install
cp .env.example .env.local && cp backend/.env.example backend/.env
pnpm --filter @yalita/backend db:push
pnpm --filter @yalita/backend db:seed
pnpm dev
```

## 🎯 Diferenciadores técnicos

1. **zkTLS en vivo** — extracción de datos de Tigo Money / SIMPLE sin API oficial, con privacidad criptográfica vía Reclaim Protocol.
2. **Subnet justificada** — datos sensibles en L1 propia (futuro KYC compliant); liquidez en C-Chain.
3. **Repago automático** — % de cada cobro QR va al pool. Intercepta el flujo en el origen.

## 🧪 Tests

```bash
pnpm contracts:test       # Foundry forge test
pnpm --filter @yalita/backend test
pnpm --filter @yalita/frontend test
```

## 🚢 Deploy

Ver [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) para instrucciones completas.

- **frontend** → Vercel
- **backend** → Vercel serverless
- **contracts** → Avalanche Fuji (testnet) / C-Chain (mainnet)

## 📚 Documentación

- [Arquitectura técnica](docs/ARCHITECTURE.md)
- [Guía de deployment](docs/DEPLOYMENT.md)
- [Script del demo](docs/DEMO_SCRIPT.md)

## 📄 Licencia

MIT

## 🧑‍⚖️ Para el jurado

- Cómo ver el frontend: `pnpm dev` → `http://localhost:3000`
- Cómo simular un pago QR: `npx tsx scripts/simulate-qr-payment.ts 0xDEMO000000000000000000000000000000000001 500`
- Usuario demo pre-cargado: María, score 720, préstamo activo Bs 1,043
