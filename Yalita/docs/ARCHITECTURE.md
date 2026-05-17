# Arquitectura — Yalita Protocol

## Vista general

```
┌─────────────────────────────────────────────────────────────┐
│   USUARIO (Doña María — celular)                           │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────────┐
│   frontend/  ── Next.js 14 + Tailwind + Privy + Wagmi      │
│   - Auth SMS (Privy)                                        │
│   - Wallet embebida (sin user-managed keys)                 │
│   - UI 100% "Modo Doña" (sin jerga cripto)                  │
└──────┬──────────────────────────────────┬──────────────────┘
       │ REST                              │ Reads on-chain
       ▼                                   ▼
┌──────────────────────────┐    ┌──────────────────────────────┐
│   backend/  ── Hono API  │    │   Avalanche Fuji L1          │
│   - Privy JWT auth       │    │   - ScoreRegistry (SBT)      │
│   - Prisma + Neon        │    │   - AttestationRegistry      │
│   - Oracle wallet        │◄───┤   - ScoringEngine            │
│   - Reclaim integration  │    │   - LendingPool              │
└──────────┬───────────────┘    └──────────────────────────────┘
           │
           ▼
   ┌───────────────┐
   │  Reclaim      │
   │  Protocol     │
   │  (zkTLS)      │
   └───────────────┘
```

## Componentes

### frontend/
- **Next.js 14 App Router** — `/`, `/onboarding/*`, `/dashboard`, `/score`, `/credito/*`, `/repagar`, `/perfil`
- **Privy** — Auth por SMS + wallet embebida
- **Wagmi + Viem** — Lectura on-chain directa (score, loans)
- **TanStack Query** — Cache de llamadas al backend
- **Zustand** — Estado UI (sidebar, modo Doña, toasts)
- **Design System** — Button, Card, Badge, Input, Slider, Modal, Toast, Skeleton, Spinner

### backend/
- **Hono** — Framework HTTP edge-compatible (Vercel Serverless)
- **Prisma + Neon Postgres** — DB de usuarios, scores, loans, attestations
- **Privy server SDK** — Verificar JWT del frontend
- **Viem wallet** — Oracle wallet que firma attestations on-chain
- **Reclaim SDK** — Procesar pruebas zkTLS y submitearlas

### contracts/
- **Foundry** — Build, test, deploy
- **4 contratos principales** + interfaces + mock USDC
- **OpenZeppelin v5** — ERC721, Ownable, ReentrancyGuard, SafeERC20

### shared/
- Tipos TypeScript + ABIs + constantes
- Importado por frontend y backend con `@yalita/shared`

## Flujos críticos

### Onboarding (Doña María entra por primera vez)
1. `/onboarding` → login SMS con Privy
2. `/onboarding/conectar` → elige Tigo Money
3. Backend genera URL de Reclaim → usuario abre Tigo en su celular
4. Reclaim devuelve proof zkTLS → backend lo procesa
5. Backend submitea `AttestationRegistry.submitAttestation()` on-chain
6. Backend llama `ScoringEngine.computeAndIssueScore()` → emite SBT
7. `/score` muestra el gauge animado

### Solicitud de crédito
1. `/credito/solicitar` → user elige monto + plazo
2. Frontend lee `LendingPool.getQuote()` (no firma)
3. User confirma → backend firma `LendingPool.requestLoan()` con oracle wallet
4. USDC transferido a la wallet del user
5. DB: nuevo `Loan` con status ACTIVE

### Repago automático (loop genial)
1. Webhook desde Tigo Money: "usuario recibió Bs 200"
2. `POST /webhooks/qr-payment` → backend calcula 8% = Bs 16 ≈ $2.3
3. `LendingPool.repayLoan()` con la oracle wallet
4. Si totalDue == 0 → status REPAID, score sube

## Decisiones técnicas

| Decisión | Justificación |
|----------|---------------|
| Hono vs Express | Edge-compatible, mejor en Vercel Serverless |
| Privy vs RainbowKit | UX no-cripto crítica para Doña María |
| Neon vs RDS | Branching de DB para PRs, serverless |
| Foundry vs Hardhat | Tests 100x más rápidos, mejor DX |
| SBT vs ERC721 | Score no debe ser transferible (es identidad) |
| C-Chain vs Subnet | C-Chain ahora; subnet en roadmap (regulatory) |
| Reclaim vs Belvo | zkTLS funciona donde no hay Open Banking (BO) |
