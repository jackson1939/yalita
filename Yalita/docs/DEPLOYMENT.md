# Deployment — Yalita

## Prerrequisitos

- Node.js ≥ 20
- pnpm ≥ 9
- Foundry (`curl -L https://foundry.paradigm.xyz | bash`)
- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Neon](https://neon.tech)
- App ID en [Privy](https://dashboard.privy.io)
- AVAX en testnet Fuji ([faucet](https://faucet.avax.network/))

## 1. Setup local

```bash
git clone <repo> && cd team1
pnpm install

cp .env.example .env
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
cp contracts/.env.example contracts/.env
```

Rellenar las variables marcadas con `""`.

## 2. Contratos (Avalanche Fuji)

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts@v5.0.2 --no-commit
forge install foundry-rs/forge-std --no-commit
forge build
forge test -vvv

# Deploy
forge script script/Deploy.s.sol \
  --rpc-url fuji --broadcast --verify
```

Copiar las direcciones desplegadas a los `.env` del root, frontend y backend.

## 3. Base de datos (Neon)

```bash
cd backend
pnpm db:generate
pnpm db:push     # crea tablas en Neon
pnpm db:seed     # opcional: usuario demo
```

## 4. Desarrollo local

```bash
# desde el root
pnpm dev
# → frontend en http://localhost:3000
# → backend  en http://localhost:3001
```

## 5. Deploy a Vercel

### Frontend
1. Importar el repo en Vercel
2. **Root Directory**: `frontend`
3. Variables de entorno → copiar de `frontend/.env.local`
4. Deploy

### Backend
1. Crear un segundo proyecto en Vercel
2. **Root Directory**: `backend`
3. Variables de entorno → copiar de `backend/.env`
4. Asegurar que `vercel.json` está presente (sirve Hono como serverless)
5. Deploy

### Configuración cross-origin
- Backend: `ALLOWED_ORIGIN=https://tu-frontend.vercel.app`
- Frontend: `NEXT_PUBLIC_API_URL=https://tu-backend.vercel.app`

## Troubleshooting

| Error | Solución |
|-------|----------|
| `Module not found: @yalita/shared` | `pnpm install` desde root, no desde subproyecto |
| `Privy: invalid app id` | Verificar `NEXT_PUBLIC_PRIVY_APP_ID` en frontend y backend |
| `Prisma: P1001 can't reach DB` | Activar Neon, copiar `DATABASE_URL` y `DIRECT_URL` |
| `Foundry: forge not found` | Reiniciar shell o `source ~/.bashrc` |
| `Contract revert: NotAuthorized` | Llamar `setScorerAuthorization` con el deployer |
