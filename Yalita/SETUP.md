# Yalita — Setup para producción real

Esta guía te lleva de "demo simulada" a "todo real" en ~60 minutos.

## TL;DR — modo demo vs modo real

El proyecto ya funciona en **modo demo** out-of-the-box. Las funciones se comportan exactamente igual que en producción, pero usan datos sintéticos:

| Función | Demo (default) | Real (con credenciales) |
|---|---|---|
| Login SMS | OTP = `123456` siempre | SMS real de Twilio via Privy |
| Wallet | Address determinística por teléfono | Wallet embebida Avalanche en Privy |
| Yape parser | Historial sintético de 6 meses | zkTLS proof real de Gmail |
| Score on-chain | txHash mock con link Snowtrace | Tx real firmada por oracle wallet |
| Loan request | Store local actualizado | Tx firmada por user wallet en LendingPool |
| KYC | Validación simulada (1.8s) | Idem (visualmente) — pendiente integrar Sumsub/Persona |

Cada función cae al modo real automáticamente cuando detecta las env vars correspondientes.

---

## 1. Privy — Auth real con SMS y wallet embebida

**Tiempo:** ~15 min

1. Ve a https://dashboard.privy.io/
2. Sign up con email o GitHub
3. Click **"New app"** → name: `Yalita`
4. Una vez creada, copia el **App ID** del header
5. En **Settings → Login Methods**: activa **SMS**
6. En **Settings → Networks**: agrega **Avalanche Fuji** (chainId 43113)
7. En **Settings → Embedded Wallets**: enable, "Create on login: all users"
8. Pega en Vercel → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_PRIVY_APP_ID=clxxxxxxxxxxxxxxxxxxxxx
   ```

---

## 2. Reclaim Protocol — zkTLS para Gmail/Yape

**Tiempo:** ~15 min

1. Ve a https://dev.reclaimprotocol.com/
2. Sign up con GitHub
3. **Create new app** → name: `Yalita`
4. Copia el **App ID** y el **App Secret**
5. En **Providers** → busca y agrega `Google Login` (o `Gmail Inbox` si está disponible)
6. Copia el `providerId` que se asigna (UUID)
7. En Vercel:
   ```
   NEXT_PUBLIC_RECLAIM_APP_ID=0x...
   RECLAIM_APP_SECRET=0x...
   NEXT_PUBLIC_RECLAIM_GMAIL_PROVIDER_ID=<uuid del provider>
   ```

> **Nota técnica:** El provider de Gmail extrae el contenido del último N emails. Para producción Yalita, podrías crear un Reclaim Provider custom que filtre por `notificacionesyape@bcp.com.bo` directamente. Mientras tanto, el parser en `backend/src/services/yape.parser.ts` extrae solo las facturas Yape de cualquier dump.

---

## 3. Neon — PostgreSQL serverless gratis

**Tiempo:** ~5 min

1. Ve a https://neon.tech/
2. Sign up con GitHub
3. **Create Project** → name: `yalita` → región: cualquiera cerca
4. Copia la **Connection String** (la versión **Pooled** que termina en `-pooler`)
5. En Vercel:
   ```
   DATABASE_URL=postgresql://user:pass@xxx-pooler.neon.tech/yalita?sslmode=require
   DIRECT_URL=postgresql://user:pass@xxx.neon.tech/yalita?sslmode=require
   ```
6. Despliega el schema:
   ```powershell
   cd C:\YALITA\Yalita\backend
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

---

## 4. Smart Contracts — Deploy a Avalanche Fuji

**Tiempo:** ~20 min

### 4.1 Crear la deployer wallet
```powershell
# Si no tienes una wallet, créala en MetaMask y exporta la private key
# Pégala en contracts/.env
DEPLOYER_PRIVATE_KEY=0x<tu_private_key>
```

### 4.2 Fondear con AVAX testnet
- Ve a https://faucet.avax.network/
- Selecciona **Fuji (C-Chain)**
- Pega la address pública de tu deployer wallet
- Recibirás 2 AVAX gratis (suficiente para deploy + 100s de txs)

### 4.3 Deploy
```powershell
cd C:\YALITA\Yalita
pnpm contracts:deploy:fuji
```

Esto despliega los 4 contratos y los verifica en Snowtrace (con el `SNOWTRACE_API_KEY` que ya está en `contracts/.env`).

El script imprime las 4 addresses. Cópialas a:

- **`contracts/deployments/fuji.json`** — reemplaza los `0x000...`
- **Vercel env vars**:
  ```
  NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS=0x...
  NEXT_PUBLIC_ATTESTATION_REGISTRY_ADDRESS=0x...
  NEXT_PUBLIC_SCORING_ENGINE_ADDRESS=0x...
  NEXT_PUBLIC_LENDING_POOL_ADDRESS=0x...
  ```

### 4.4 Oracle wallet (backend para escribir scores)
Crea OTRA wallet (separada del deployer) para que el backend la use para escribir scores on-chain:
```
ORACLE_PRIVATE_KEY=0x<otra_private_key>
```
Fondéala con AVAX del faucet también (necesita gas para cada tx de score).

Luego autoriza esa wallet en ScoreRegistry como scorer:
```powershell
cd C:\YALITA\Yalita\contracts
forge script script/Deploy.s.sol --sig "authorizeScorer(address)" <ORACLE_WALLET_ADDRESS> --rpc-url fuji --broadcast
```

### 4.5 Fondear el LendingPool con MockUSDC
Para que haya liquidez para los préstamos:
```powershell
# Mint 50,000 MockUSDC y depositarlos en el pool
cd C:\YALITA\Yalita\contracts
forge script script/SeedPool.s.sol --rpc-url fuji --broadcast
```
(Si este script no existe, créalo o haz `addLiquidity()` manualmente desde tu wallet)

---

## 5. Variables completas en Vercel

Vercel Dashboard → tu proyecto → Settings → Environment Variables:

```bash
# Privy
NEXT_PUBLIC_PRIVY_APP_ID=

# Reclaim
NEXT_PUBLIC_RECLAIM_APP_ID=
RECLAIM_APP_SECRET=
NEXT_PUBLIC_RECLAIM_GMAIL_PROVIDER_ID=
RECLAIM_MOCK=false

# Database
DATABASE_URL=
DIRECT_URL=

# Blockchain
ORACLE_PRIVATE_KEY=
NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS=
NEXT_PUBLIC_ATTESTATION_REGISTRY_ADDRESS=
NEXT_PUBLIC_SCORING_ENGINE_ADDRESS=
NEXT_PUBLIC_LENDING_POOL_ADDRESS=

# Wavy Node (opcional — $200 prize)
WAVY_NODE_API_KEY=
WAVY_NODE_MOCK=false

# Defaults (ya en vercel.json)
NEXT_PUBLIC_CHAIN_ID=43113
NEXT_PUBLIC_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
```

---

## 6. Verificar que todo funciona

1. Despliega en Vercel (auto al hacer push)
2. Abre la URL → onboarding
3. Ingresa tu celular real → debes recibir SMS de Privy
4. Verifica → debe crearse wallet
5. Conecta Gmail → flow Reclaim debe abrirse en ventana nueva
6. Espera el análisis → debes ver el txHash real apuntando a Snowtrace
7. Click en el txHash → debes ver la tx en https://testnet.snowtrace.io/

Si **CUALQUIER** paso falla, la app degrada graciosamente al modo demo automáticamente. Nunca queda en blanco o con error fatal.

---

## 7. Demo day — guión rápido

```
1. Abrir https://yalita-demo.vercel.app
2. "Empieza gratis"
3. Tu celular real (+591 7XXXXXXX) → recibe SMS → ingresa OTP
4. Ingresa nombre + 4 dígitos CI
5. "Conectar Gmail" → flow Reclaim abre Gmail
6. Volvés a la app → animación de análisis
7. Score reveal con número animado + txHash on-chain (CLICK!)
8. Click en txHash → ¡jurado ve la tx real en Snowtrace! 🔥
9. Dashboard con saldo, score y crédito disponible
10. "Pedir préstamo" → slider → calculadora vs alternativas
11. Confirmar → firma con Privy → tx en LendingPool
12. Saldo actualizado, préstamo activo, cuota visible
```

Si algo falla en vivo, el modo demo te salva — la UX es idéntica.
