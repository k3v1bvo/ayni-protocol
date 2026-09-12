# 🚀 AYNI / MINKA Protocol

> **Ecosistema P2P Descentralizado de Crowdshipping, Comercio y Remesas**
> *Buildathon ETH Bolivia 2026 — Cochabamba*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: Base L2](https://img.shields.io/badge/Network-Base%20L2-blue.svg)](https://base.org)
[![Network: Avalanche](https://img.shields.io/badge/Network-Avalanche-E84142.svg)](https://www.avax.network/)
[![Network: HSK Chain](https://img.shields.io/badge/Network-HSK%20Chain-7B3FE4.svg)](https://hskchain.net)
[![Network: Stellar](https://img.shields.io/badge/Network-Stellar%20(Pollar)-08B5E5.svg)](https://pollar.xyz)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E.svg)](https://supabase.com)

---

## 🏔️ 1. Fundamentación Filosófica y Visión

El protocolo AYNI / MINKA transforma la logística y el comercio transfronterizo en economías emergentes aprovechando la capacidad ociosa de equipaje de miles de viajeros:

- **Ayni (Reciprocidad y Mutualismo)**: Correspondencia simétrica. Equilibrio justo entre el esfuerzo del transportista y el beneficio del solicitante (*"hoy por ti, mañana por mí"*).
- **Minka (Trabajo Colaborativo)**: Esfuerzo comunitario enfocado en resolver fallas estructurales del entorno (barreras arancelarias, costos abusivos de courier corporativo y comisiones bancarias).
- **Vínculo Social Protector**: Garantía mutua mediante contratos inteligentes (Escrow) y un fondo comunitario de reserva del 2% contra siniestros.

---

## ⚡ 2. Módulos del Sistema

1. **Módulo A: Gestión de Rutas y Capacidad Física**: Declaración de itinerarios multi-escala, peso disponible (kg) y volumen cúbico con evidencia fotográfica.
2. **Módulo B: Marketplace y "Compra a Pie" (Personal Shopper P2P)**: Encargo de compras presenciales en mostrador con verificación táctil y visual, insumos médicos y nichos de asimetría transfronteriza.
3. **Módulo C: Seguridad, Verificación e Inspección con OTP**: Custodia de fondos en Escrow y liberación garantizada únicamente cuando el comprador revela y el transportista ingresa el código OTP alfanumérico de 6 dígitos.
4. **Módulo D: Auditoría y Supervisión con IA Multimodal**: Validación automática de comprobantes, facturas legales y coincidencia de producto con visión artificial (Google Gemini).
5. **Módulo E: Remesas P2P**: Traslado físico de efectivo con liquidación paralela en stablecoins (USDC/USDT) sobre múltiples redes (Base L2, Avalanche, HSK Chain, Stellar vía Pollar).
6. **Módulo F: Membresías Premium Token-Gated**: Beneficios exclusivos (comisión reducida, acceso anticipado, soporte prioritario) desbloqueados por una llave NFT (Unlock Protocol) verificada 100% on-chain.

---

## 📊 3. Matriz de Comisiones y Regla de Competitividad

| Comisión Total | Viajero | Sistema (Mantenimiento) | Fondo de Reserva Mutua |
| :--- | :---: | :---: | :---: |
| **10%** del pedido (< $100) | 5% | 3% | 2% (Fondo siniestros) |
| **7%** del pedido ($100–$499) | 4% | 3% | 0% |
| **5%** del pedido ($500–$1,499) | 3% | 2% | 0% |
| **4%** del pedido ($1,500+) | 3% | 1% | 0% |

> **Regla de Alto Valor**: Para pedidos de alto costo, la tarifa de traslado se topa automáticamente:
> $$\text{Tarifa Traslado} = \min(\text{Monto} \times \%\text{tarifa}, \$50.00\text{ USD})$$

Comparado con courier tradicional (DHL/FedEx: 15–30%) o remesas clásicas (Western Union: 5–10% + tipo de cambio desfavorable), AYNI queda por debajo del mercado en todos los rangos, y la mayor parte de la comisión va al viajero, no a la plataforma.

---

## 🔌 4. Integraciones Multi-Chain (Buildathon ETH Bolivia 2026)

AYNI compite en varios bounties del buildathon con el mismo proyecto, cada uno resolviendo una parte real del producto — no integraciones "de relleno".

### 💳 Pollar — Pagos reales en USDC vía Stellar

**Por qué lo usamos:** Pollar resuelve exactamente el mismo problema que AYNI — pagos y remesas para Latam sin que el usuario tenga que entender blockchain. Lo integramos como un **segundo motor de pagos** (junto a Base L2, Avalanche y HSK), usando Stellar por sus comisiones casi nulas.

**Cómo está integrado:**
- `@pollar/react` envuelve toda la app en [`src/app/layout.tsx`](src/app/layout.tsx) vía `PollarProvider`
- **Login social/correo → wallet automática**: al iniciar sesión (Google o email con código OTP), Pollar crea una wallet Stellar custodial para el usuario sin fricción — ver el botón "Login with Pollar" en el header de [`src/app/page.tsx`](src/app/page.tsx)
- **Pago real dentro del flujo de Escrow**: en [`src/components/checkout/PaymentModal.tsx`](src/components/checkout/PaymentModal.tsx), la pestaña **"Pollar (Stellar)"** ejecuta `runTx('payment', ...)` para enviar USDC real al momento de bloquear un pedido en custodia — reemplaza la simulación que existía antes en ese flujo
- La verificación de membresía y saldo se hace 100% vía el SDK oficial, sin backend propio

**Estado:** Integración completa y probada de punta a punta en testnet (login real, wallet creada, intento de pago real contra la API de Pollar). La transacción de 1 USDC en **mainnet** que pide el bounty está sujeta a la aprobación de acceso del equipo de Pollar (formulario + reunión obligatoria, requisito de sus propias reglas).

### 🔗 HSK Chain (HashKey Chain) — `AyniEscrow.sol` desplegado y verificado

**Por qué lo usamos:** HSK Chain es EVM-compatible, lo que permite desplegar el mismo contrato de Escrow sin cambios — parte de la estrategia multi-chain de AYNI para no depender de una sola red.

- **Contrato**: [`contracts/AyniEscrow.sol`](contracts/AyniEscrow.sol) — custodia con cláusulas configurables (inspección, hitos de pago, seguro de aduana), oráculo de IA para verificación de disputas
- **Desplegado en testnet**: `0x872660b3324236c306b539f90a02f8b8D019E9Ea`
- **Verificado públicamente**: https://testnet-explorer.hskchain.net/address/0x872660b3324236c306b539f90a02f8b8D019E9Ea#code
- Como HSK Chain aún no tiene un USDC oficial de Circle, se desplegó [`contracts/mocks/MockUSDC.sol`](contracts/mocks/MockUSDC.sol) (`0x7A9fe51c8688281Ed66e0A98401B46a277c86D80`), un ERC20 de 6 decimales idéntico en interfaz al USDC real, solo para pruebas

### 🔺 Avalanche — `AyniEscrow.sol` desplegado en mainnet real

**Por qué lo usamos:** Avalanche encaja en la categoría de "Pagos institucionales y liquidación en blockchain" del bounty — un Escrow multi-chain con liquidación casi gratuita (gas menor a $0.001) es un caso de uso real de pagos, no un agregado cosmético.

- **Desplegado en Avalanche C-Chain mainnet**: `0x7A9fe51c8688281Ed66e0A98401B46a277c86D80`
- **Verificado públicamente**: https://snowtrace.io/address/0x7A9fe51c8688281Ed66e0A98401B46a277c86D80#code
- Usa el **USDC oficial de Circle** en Avalanche (`0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E`), no un token de prueba
- Mismo contrato que HSK Chain y Base L2 — demuestra la arquitectura multi-chain real de AYNI, no una copia aislada

### 🔓 Unlock Protocol — Membresía Premium Token-Gated

**Por qué lo usamos:** En vez de construir un sistema propio de membresías/suscripciones, usamos Unlock como capa de acceso — más simple, auditable y reutilizable.

- **Página**: [`/dashboard/premium`](src/app/dashboard/premium/page.tsx) (visible en el menú lateral como "Membresía Premium")
- **Verificación on-chain directa**: [`src/lib/web3/unlock.ts`](src/lib/web3/unlock.ts) usa `viem` para leer `getHasValidKey(address)` del contrato `PublicLock` en Base Sepolia — sin backend, sin base de datos, la fuente de verdad es la blockchain
- **Compra de membresía**: usa el checkout oficial `@unlock-protocol/paywall` (`loadCheckoutModal`) para adquirir la llave NFT
- **Beneficios desbloqueados**: comisión de Escrow reducida (4% en vez de 5%), acceso anticipado al marketplace, soporte prioritario, reportes financieros avanzados

**Estado:** Código completo y probado (detecta correctamente la ausencia de wallet/Lock, sin errores). Pendiente desplegar el Lock en Base Sepolia — bounty con fecha de entrega propia hasta el **18 de septiembre**.

---

## 🛠️ 5. Estructura del Proyecto

```
├── contracts/
│   ├── AyniEscrow.sol                         # Escrow multi-chain (HSK, Avalanche, Base L2)
│   └── mocks/MockUSDC.sol                     # USDC de prueba para redes sin USDC oficial
├── scripts/
│   └── deploy.js                              # Deploy automatizado multi-red (Hardhat)
├── hardhat.config.js                          # Redes: HSK testnet/mainnet, Avalanche testnet/mainnet
├── deployments/                               # Direcciones de contratos ya desplegados por red
├── supabase/
│   ├── migrations/                            # Tablas, RLS, triggers y funciones
│   └── seed.sql                               # Datos de prueba
├── src/
│   ├── app/
│   │   ├── auth/page.tsx                      # Login y registro
│   │   ├── dashboard/premium/page.tsx         # Portal token-gated (Unlock Protocol)
│   │   ├── layout.tsx                         # Root Layout + PollarProvider
│   │   └── page.tsx                           # Landing + botón "Login with Pollar"
│   ├── components/
│   │   ├── checkout/PaymentModal.tsx          # Escrow: Tangem + Pollar (pago real)
│   │   ├── calculator/FeeCalculator.tsx       # Simulador de tarifas y comisiones
│   │   └── layout/Navbar.tsx, Sidebar.tsx     # Navegación con roles y sesión
│   ├── context/AuthContext.tsx                # Sesión y perfil (Supabase)
│   └── lib/
│       ├── constants/fees.ts                  # Comisiones escalonadas y tope $50
│       ├── web3/contracts.ts                  # ABI y helpers del Escrow (EVM)
│       ├── web3/unlock.ts                     # Lectura on-chain de membresías (Unlock)
│       └── supabase/                          # Clientes SSR y Browser
└── package.json
```

---

## 🚀 6. Puesta en Marcha

### Prerrequisitos
- Node.js >= 18
- Cuenta en [Supabase](https://supabase.com) (opcional para desarrollo local; incluye modo demo integrado)

### Instalación
```bash
npm install
```

### Variables de Entorno
Copia `.env.example` a `.env.local` y completa según qué integración quieras probar (Supabase, Pollar, Unlock). Ver comentarios en el propio archivo para dónde obtener cada valor.

### Ejecutar en Desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000).

### Desplegar contratos (HSK Chain / Avalanche)
```bash
npm run deploy:hsk-testnet
npm run deploy:avalanche-fuji
npm run deploy:avalanche-mainnet
```
Requiere `DEPLOYER_PRIVATE_KEY` en `.env.local` (una wallet con gas en la red destino).

---

## 🌐 7. Demo en Vivo

**URL pública**: https://ayni-protocool.vercel.app/
