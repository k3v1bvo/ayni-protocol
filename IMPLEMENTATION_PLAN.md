# 🏆 Estrategia Multi-Bounty: AYNI × ETH Bolivia Buildathon 2026

> [!CAUTION]
> **DEADLINE: 13 de septiembre, 8:30 AM (hora Bolivia)**
> Quedan ~36 horas. Cada minuto cuenta.

---

## Vista General: TODOS los Bounties Disponibles

AYNI puede competir en **6 bounties simultáneamente** con el mismo proyecto. Regla confirmada: *"Puedes competir en otros bounties con el mismo proyecto."*

| # | Bounty | Premio Máx | ¿AYNI encaja? | Prioridad | Esfuerzo |
|---|--------|-----------|---------------|-----------|----------|
| 1 | 🔓 **Unlock Protocol** — Token-Gated Portal | $250/$150 | ✅ SÍ | 🟡 Media | ~4h |
| 2 | 💳 **Pollar** — Pagos Reales en Mainnet | $120/$80 | ✅ **PERFECTO** | 🔴 **ALTA** | ~3h |
| 3 | 🔺 **Avalanche** — Smart Contract en AVAX | $200 | ✅ SÍ | 🟡 Media | ~2h |
| 4 | 🔗 **HSK Chain** — Deploy en HSK Mainnet | $500/$300/$200 | ✅ SÍ | 🔴 **ALTA** | ~2h |
| 5 | ✈️ **Road to ShanhaiWoo** — Scholarship Shenzhen | $800 beca | ✅ SÍ | 🔴 **ALTA** | ~30min (registro) |
| 6 | 🐮 **Vaquita Protocol** | $100 | ❓ Ver | 🟢 Baja | TBD |

**Potencial máximo: ~$2,050 USD en premios directos + $800 en beca a Shenzhen**

---

## Análisis Detallado por Bounty

### 1. 💳 Pollar Track — $200 (1ro: $120, 2do: $80)

> [!IMPORTANT]
> **ESTE ES EL QUE MÁS ENCAJA CON AYNI.** Pollar es un SDK de pagos sobre Stellar. AYNI ya hace exactamente lo que piden: envío de dinero entre países, pagos para tiendas, freelancers con clientes de afuera. ES LITERALMENTE NUESTRO CASO DE USO.

**¿Qué piden?**
- App real que resuelva un problema del día a día en Bolivia/Latam ✅ (AYNI = crowdshipping + remesas)
- Pollar integrado en al menos un flujo (wallet, cobro, pago o rampa) 
- UNA transacción real en mainnet (con 1 USDC alcanza)
- Repo público + README + demo de 3 min

**Integración técnica:**
```
npm install @pollar/react
```
- Envolver la app en `PollarProvider`
- Usar `usePollar()` para login social + wallet Stellar
- Usar `runTx('payment', ...)` para pagos USDC en el flujo de Escrow
- Hacer 1 transacción real en mainnet Stellar

**Lo que AYNI gana:** Un segundo motor de pagos (Stellar) además de Base L2. Pagos instantáneos con USDC sin que el usuario sepa de blockchain.

**Requisito URGENTE:** Enviar el formulario de acceso a mainnet de Pollar HOY. Sin eso no se puede ir a mainnet.

---

### 2. 🔗 HSK Chain — $1,000 (1ro: $500, 2do: $300, 3ro: $200)

> [!IMPORTANT]
> **PREMIO MÁS GRANDE.** Solo necesitamos desplegar `AyniEscrow.sol` en HSK Chain Mainnet (o testnet si hay poco tiempo). El contrato ya existe y está listo.

**¿Qué piden?**
- Proyecto desplegado en HSK Chain Mainnet ✅ (AyniEscrow.sol ya existe)
- Contratos verificados ✅
- Demo funcional ✅ (AYNI ya tiene web)
- GitHub repo ✅
- Participar en Demo Day

**Integración técnica:**
- HSK Chain es EVM-compatible → el contrato Solidity funciona sin cambios
- Desplegar con Hardhat/Foundry apuntando al RPC de HSK
- Verificar contrato en el explorer de HSK
- Agregar HSK Chain como red alternativa en la config de AYNI

**⚠️ DOBLE POSTULACIÓN OBLIGATORIA:**
1. Devfolio Ethereum Bolivia → Seleccionar "Bolivia Hackathon" + "HSK Chain"
2. Devfolio EAG Global → [Registrar aquí](https://eag-global-buildathon.devfolio.co/overview)

**HSK Chain Faucet (testnet):** https://hskchain.net/faucet

---

### 3. 🔺 Avalanche — $200

**¿Qué piden?**
- Smart contract desplegado y verificado en Avalanche ✅
- Integración relevante (no solo cumplir) ✅
- MVP/demo funcional ✅

**Integración técnica:**
- Avalanche C-Chain es EVM-compatible → `AyniEscrow.sol` funciona directo
- Desplegar con Hardhat apuntando al RPC de Avalanche
- Usar Avalanche Faucet para testnet
- Agregar Avalanche como red alternativa

**Recursos:**
- Faucet: https://build.avax.network/console/primary-network/faucet
- Console: https://build.avax.network/console

---

### 4. 🔓 Unlock Protocol — $800 (WordPress $400, Token-Gated $250/$150)

**Análisis:**
- ❌ WordPress Plugin ($400): Descartado. Stack incompatible, otro mundo.
- ✅ Token-Gated Portal ($250/$150): Crear `/dashboard/premium` con contenido exclusivo desbloqueado por membresía Unlock.

**Integración técnica:**
```
npm install @unlock-protocol/unlock.js
```
- Desplegar un Lock (contrato de membresía) en Base Sepolia
- Verificar membresía con `hasValidKey()`
- Paywall con Unlock Checkout para comprar la Key

---

### 5. ✈️ Road to ShanhaiWoo — Scholarship $800

> [!TIP]
> **ESFUERZO MÍNIMO, PREMIO MÁXIMO.** Solo requiere registrar el proyecto en ambos Devfolio. No hay código extra — gana el "proyecto Web3 más destacado" seleccionado por EAG.

**Acción:** Registrar en ambos:
1. Devfolio Ethereum Bolivia
2. [Devfolio EAG Global](https://eag-global-buildathon.devfolio.co/overview)

---

### 6. Vaquita Protocol — $100

Necesitamos más info sobre los requisitos específicos.

---

## 🎯 Estrategia de Ejecución Priorizada (36 horas)

### BLOQUE 1 — AHORA (Noche del 11 sept) — Registros y Setup

| Tarea | Tiempo | Bounty |
|-------|--------|--------|
| ⬜ Registrar en Devfolio Ethereum Bolivia (Bolivia Hackathon + HSK Chain) | 15 min | HSK + ShanhaiWoo |
| ⬜ Registrar en Devfolio EAG Global Buildathon | 15 min | ShanhaiWoo |
| ⬜ Enviar formulario de acceso a mainnet de Pollar | 10 min | Pollar |
| ⬜ Unirse al grupo Telegram de Pollar | 5 min | Pollar |
| ⬜ Crear cuenta en Pollar Dashboard y obtener API Keys | 15 min | Pollar |

### BLOQUE 2 — Mañana Temprano (12 sept AM) — Integraciones Core

| Tarea | Tiempo | Bounty |
|-------|--------|--------|
| ⬜ Instalar `@pollar/react` y configurar `PollarProvider` | 30 min | Pollar |
| ⬜ Integrar flujo de pago Pollar en el Escrow de AYNI | 1.5h | Pollar |
| ⬜ Desplegar `AyniEscrow.sol` en HSK Chain (mainnet o testnet) | 1h | HSK Chain |
| ⬜ Verificar contrato en explorer de HSK | 30 min | HSK Chain |

### BLOQUE 3 — Mediodía (12 sept PM) — Más Cadenas + Unlock

| Tarea | Tiempo | Bounty |
|-------|--------|--------|
| ⬜ Desplegar `AyniEscrow.sol` en Avalanche C-Chain | 45 min | Avalanche |
| ⬜ Verificar contrato en Snowtrace | 30 min | Avalanche |
| ⬜ Crear sección Token-Gated (`/dashboard/premium`) con Unlock | 2h | Unlock |
| ⬜ Hacer 1 transacción real en mainnet Pollar (1 USDC) | 30 min | Pollar |

### BLOQUE 4 — Noche (12 sept PM-Noche) — Polish y Entregables

| Tarea | Tiempo | Bounty |
|-------|--------|--------|
| ⬜ Grabar video demo de 3 minutos | 30 min | TODOS |
| ⬜ Actualizar README con todas las integraciones | 1h | TODOS |
| ⬜ Preparar descripción de 300 palabras | 20 min | Pollar |
| ⬜ Deploy en Vercel (URL pública) | 30 min | TODOS |
| ⬜ Enviar entregas por Telegram de cada bounty | 30 min | TODOS |

### BLOQUE 5 — Madrugada (13 sept antes de 8:30 AM) — Buffer

| Tarea | Tiempo | Bounty |
|-------|--------|--------|
| ⬜ Verificación final de todas las entregas | 1h | TODOS |
| ⬜ Confirmar que todos los registros en Devfolio están completos | 30 min | HSK + EAG |

---

## ¿Por qué AYNI es perfecto para TODOS estos bounties?

AYNI ya tiene:
- ✅ **Smart Contract** (`AyniEscrow.sol`) → desplegable en HSK Chain + Avalanche + Base
- ✅ **Caso de uso real** → Crowdshipping transfronterizo Bolivia/Latam (Pollar, HSK, EAG)
- ✅ **IA integrada** → Gemini para verificación de productos (AI x Web3 track)
- ✅ **Pagos USDC** → Escrow con stablecoins (Pollar, EAG tracks)
- ✅ **Marketplace funcional** → Web app completa con auth, dashboard, etc.
- ✅ **Repo público** → `k3v1bvo/ayni-protocol`

### Tracks EAG que aplican a AYNI:
1. **"Real-World Ethereum Applications"** → Pagos, comercio local, regiones emergentes ✅
2. **"AI x Ethereum & Agent Economy"** → Oráculo IA para verificación ✅
3. **"AI-Native Creator Economy & Digital Rights"** → Contenido token-gated con Unlock ✅

---

## Arquitectura Multi-Chain Final

```
                         AYNI PROTOCOL
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────▼─────┐      ┌─────▼─────┐      ┌─────▼─────┐
    │  Base L2  │      │ HSK Chain │      │ Avalanche │
    │ (Primary) │      │ (Bounty)  │      │ (Bounty)  │
    │           │      │           │      │           │
    │AyniEscrow│      │AyniEscrow│      │AyniEscrow│
    │ .sol      │      │ .sol      │      │ .sol      │
    └─────┬─────┘      └─────┬─────┘      └─────┬─────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Pollar (Stellar) │
                    │   Pagos USDC       │
                    │   Wallet Social    │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Unlock Protocol   │
                    │  Membresías NFT    │
                    │  Contenido Premium │
                    └───────────────────┘
```

---

## Open Questions (REQUIEREN TU RESPUESTA URGENTE)

> [!CAUTION]
> **1. ¿Ya te registraste en Devfolio?** Necesitas estar registrado en ambos:
> - https://ethereum-bolivia-buildathon.devfolio.co/
> - https://eag-global-buildathon.devfolio.co/overview

> [!CAUTION]
> **2. ¿Puedes enviar AHORA el formulario de acceso a mainnet de Pollar?** Sin esto no podemos hacer la transacción real que piden. Está en la página principal de Pollar.

> [!IMPORTANT]
> **3. ¿Tienes una wallet con fondos reales?** Para Pollar mainnet necesitamos hacer al menos 1 transacción de 1 USDC real. ¿Tienes USDC en Stellar?

> [!IMPORTANT]
> **4. ¿Tienes cuenta de Vaquita?** El premio de Pollar se entrega ahí.

> [!IMPORTANT]
> **5. ¿Quieres que empecemos con el BLOQUE 1 (registros) mientras decides?** Podemos avanzar con la integración de Pollar y el deploy en HSK Chain en paralelo.
