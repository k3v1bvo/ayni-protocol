# 📋 AYNI — Avances y Pendientes (Buildathon ETH Bolivia 2026)

> Última actualización: 12 de septiembre, 2026

---

## ✅ Completado

### 💳 Pollar (Stellar)
- SDK `@pollar/react` integrado en toda la app (`PollarProvider`)
- Login social/correo con wallet Stellar automática (botón "Login with Pollar")
- Pago real (`runTx`) conectado dentro del flujo de Escrow, pestaña dedicada en el checkout
- Probado de punta a punta en testnet (login real, wallet creada, llamada real a la API)
- Dominios y tokens (USDC) configurados en el dashboard de Pollar

### 🔗 HSK Chain
- `AyniEscrow.sol` desplegado y **verificado** en testnet: `0x872660b3324236c306b539f90a02f8b8D019E9Ea`
- `MockUSDC.sol` desplegado como token de prueba: `0x7A9fe51c8688281Ed66e0A98401B46a277c86D80`
- Explorer: https://testnet-explorer.hskchain.net/address/0x872660b3324236c306b539f90a02f8b8D019E9Ea#code

### 🔺 Avalanche
- `AyniEscrow.sol` desplegado y **verificado** en **mainnet real**: `0x7A9fe51c8688281Ed66e0A98401B46a277c86D80`
- Usa el USDC oficial de Circle: `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E`
- Explorer: https://snowtrace.io/address/0x7A9fe51c8688281Ed66e0A98401B46a277c86D80#code

### 🔓 Unlock Protocol
- Página `/dashboard/premium` con verificación on-chain (viem + `getHasValidKey`)
- Checkout oficial (`@unlock-protocol/paywall`) conectado
- Código probado, falta solo desplegar el Lock (ver Pendientes)

### 🐛 Bugs corregidos
- Disputas: la IA ahora sí analiza la foto de evidencia (antes solo leía texto)
- Modelo de Gemini actualizado (`1.5-flash` descontinuado → `3.6-flash`) en los 4 endpoints que lo usan
- Menú móvil (hamburguesa): quedaba invisible detrás del fondo oscuro por un z-index viejo — arreglado
- Header de la landing y pestañas de Smart Contracts Studio: se cortaban en pantallas angostas — arreglado
- Cabeceras de seguridad HTTP agregadas (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)

### 📄 Documentación
- README reescrito documentando las 4 integraciones (Pollar, HSK, Avalanche, Unlock) con direcciones y justificación de cada una

---

## ❌ Pendiente

### 🔴 Urgente (antes del cierre del hackathon)
- [ ] **Reunión con Pollar** (mañana 11 AM) — obligatoria para habilitar mainnet
- [ ] Transacción real de 1 USDC en Pollar mainnet (después de la reunión)
- [ ] Confirmar registro en Devfolio EAG Global (aparte del de Ethereum Bolivia, ya hecho)

### 🟡 Configuración pendiente (acción en paneles externos)
- [ ] Agregar `GEMINI_API_KEY` en Vercel → Settings → Environment Variables
- [ ] Correr la migración `002_notifications_heartbeats_profile.sql` en el SQL Editor de Supabase (falta la tabla `notifications` en producción)
- [ ] Corregir el precio del producto "Sal Rosada Ancestral..." en Supabase (está en $0.00)

### 🟢 Sin apuro (Unlock Protocol vence el 18 de septiembre)
- [ ] Conseguir ETH de testnet en Base Sepolia (los faucets gratis han estado fallando, se intentó varias veces)
- [ ] Desplegar el Lock de membresía en Base Sepolia
- [ ] Agregar `NEXT_PUBLIC_UNLOCK_LOCK_ADDRESS` en Vercel

### 📹 Entregables finales
- [ ] Grabar video demo (máximo 3 minutos)
- [ ] Descripción de 300 palabras para Pollar

---

## 💰 Wallets usadas

| Wallet | Dirección | Red | Uso |
|---|---|---|---|
| Deployer (EVM) | `0x53a97d2f0DAE06cDE58a89bEEb0FbcA98Cf98ad8` | HSK, Avalanche, Ethereum | Despliegue de contratos. Tiene 0.665 AVAX + 0.0019 ETH reales |
| Pollar (Stellar) | Ver dashboard.pollar.xyz | Stellar testnet | Wallet de la app AYNI en Pollar |
