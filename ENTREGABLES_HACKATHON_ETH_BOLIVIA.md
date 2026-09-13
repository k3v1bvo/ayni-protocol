# 📦 PAQUETE COMPLETO DE ENTREGABLES — AYNI PROTOCOL
### *Buildathon ETH Bolivia 2026 — Cochabamba*
*(Documento listo para copiar y pegar en la plataforma de entrega, diapositivas y guion de presentación)*

---

# 📑 SECCIÓN 1: Formulario de Registro y Envío (Devfolio / Taikai / DoraHacks)

Copia y pega estos campos directamente en el formulario de entrega del hackathon:

### 1. Información General
* **Project Name (Nombre del Proyecto):** `AYNI Protocol` (también conocido como *MINKA*)
* **Tagline (Lema en 1 línea):**  
  > *Ecosistema P2P Descentralizado de Crowdshipping, Comercio Transfronterizo y Herencias Cripto con Escrow Inteligente y Oráculo IA.*
* **Category / Track Principal:** `DeFi & Real-World Assets (RWA) / Infraestructura P2P & Pagos`
* **Website / Demo en Vivo:** `https://ayni-protocool.vercel.app/` (o `http://localhost:3000`)
* **GitHub Repository:** `https://github.com/k3v1bvo/ayni-protocol`

---

### 2. Descripción Corta (Short Description — 200 caracteres)
> AYNI conecta a compradores con viajeros para traer productos sin intermediarios abusivos, resguardando los fondos en Smart Contracts Escrow con OTP, Oráculo Pericial de IA y Bóvedas Sucesiorias.

---

### 3. Descripción Detallada (Long Description — Formato Markdown para la plataforma)

```markdown
## 🏔️ La Problemática Real en Bolivia y Latam
En economías emergentes como Bolivia, la escasez de divisas y las comisiones bancarias abusivas (Western Union: 8-12%, DHL/FedEx: hasta 30% en fletes e intermediarios) asfixian el comercio y las remesas familiares. Al mismo tiempo, miles de personas viajan a diario con maletas vacías o capacidad de equipaje ociosa.

## ⚡ La Solución: AYNI / MINKA Protocol
Inspirado en la reciprocidad andina (*"Ayni"*: hoy por ti, mañana por mí), AYNI descentraliza la logística internacional convirtiendo a cualquier viajero verificado en un transportista de confianza, respaldado por contratos inteligentes inmutables:

1. **Custodia Escrow Criptográfica (Avalanche Mainnet & HSK Chain):** Los fondos en USDC del comprador quedan bloqueados en el contrato `AyniEscrow`. Ni la plataforma ni el viajero pueden tocarlos.
2. **La Regla de Oro del OTP:** El comprador recibe un código secreto alfanumérico de 6 dígitos. El viajero únicamente cobra su recompensa cuando entrega el producto en mano y el comprador le revela el OTP para liberar el contrato on-chain.
3. **Oráculo Pericial IA Multimodal (Google Gemini 3.6 Flash):** Audita recibos de compra física (Foot Shopping), certifica pasajes aéreos bajo estándar IATA y resuelve disputas analizando evidencia fotográfica de paquetes dañados con atestaciones Keccak-256.
4. **Onboarding Invisible con Pollar (Stellar):** Inicio de sesión social con Google que crea una wallet Stellar automática y permite pagar en USDC sin fricción de frases semilla.
5. **AYNI Heritage (Dead Man's Switch Sucesorio):** Bóvedas de herencia para familias migrantes. Si el titular no emite un pulso de vida periódico (firmado con tarjeta física Tangem NFC o web), los fondos se transfieren automáticamente a sus herederos sin juicios ni notarios.
6. **Membresías VIP Token-Gated (Unlock Protocol):** Verificación on-chain de llaves NFT que reducen la comisión del escrow al 4%.
```

---

### 4. Bounties / Premios Seleccionados y Justificación

| Bounty / Track | Justificación Técnica & Prueba de Trabajo | Enlaces y Contratos |
|---|---|---|
| **🔺 Avalanche Track** | Contrato `AyniEscrow.sol` desplegado y verificado en **Avalanche C-Chain Mainnet real**, liquidando con el contrato oficial de **USDC de Circle** (`0xB97...`). Gas < $0.001 por custodia. | [SnowTrace Explorer](https://snowtrace.io/address/0x7A9fe51c8688281Ed66e0A98401B46a277c86D80#code) |
| **💳 Pollar Track (Stellar)** | SDK `@pollar/react` integrado en el root layout. Login social con creación de wallet Stellar custodial y flujo de checkout real `runTx('payment')` para bloquear fondos en USDC. | [PaymentModal.tsx](https://github.com/k3v1bvo/ayni-protocol/blob/main/src/components/checkout/PaymentModal.tsx) |
| **🔗 HSK Chain Track** | Contrato `AyniEscrow.sol` y `MockUSDC.sol` desplegados y verificados en **HashKey Testnet**, expandiendo la interoperabilidad multi-chain. | [HSK Explorer](https://testnet-explorer.hskchain.net/address/0x872660b3324236c306b539f90a02f8b8D019E9Ea#code) |
| **🔓 Unlock Protocol Track** | Portal `/dashboard/premium` con verificación on-chain mediante `viem` de `getHasValidKey(address)` y checkout modal con `@unlock-protocol/paywall` para llaves NFT. | [unlock.ts](https://github.com/k3v1bvo/ayni-protocol/blob/main/src/lib/web3/unlock.ts) |
| **👑 Track Principal ETH Bolivia** | Solución integral con impacto social directo en la crisis cambiaria boliviana, fondo de reserva mutua del 2%, hardware Tangem y seguridad A+ bancaria. | [Repo GitHub](https://github.com/k3v1bvo/ayni-protocol) |

---

# 🎤 SECCIÓN 2: Guion de Presentación / Pitch Deck (3 Minutos)

Estructura diapositiva por diapositiva para el proyector:

```
[ Diapo 1: Portada ] ──> [ Diapo 2: El Dolor ] ──> [ Diapo 3: AYNI ] ──> [ Diapo 4: Demo ] ──> [ Diapo 5: Multi-Chain ] ──> [ Diapo 6: Cierre ]
```

### Diapositiva 1: Portada e Introducción (15 segundos)
* **Título:** AYNI Protocol — Ecosistema P2P de Crowdshipping, Comercio y Herencias Cripto.
* **Orador:** *"Buenas tardes, jurados de ETH Bolivia. Hoy les presentamos AYNI, un protocolo que rescata el principio andino de reciprocidad mutua para resolver uno de los problemas más graves que enfrentamos hoy en el país: la logística y las remesas sin dólares."*

### Diapositiva 2: El Dolor del Mercado Boliviano (30 segundos)
* **Puntos clave en pantalla:**
  * Enviar dinero o importar por courier tradicional cuesta hasta 30% en comisiones abusivas.
  * Escasez crítica de dólares e inflación de intermediarios.
  * Miles de viajeros vuelan a diario entre La Paz, Santa Cruz, Miami o Madrid con maletas a medio llenar.
* **Orador:** *"Si quieres traer un repuesto médico o una cámara de Estados Unidos, los couriers te cobran el triple o te retienen el paquete. Mientras tanto, un compatriota viaja en el mismo vuelo con espacio de sobra en su maleta. ¿Por qué no conectarlos con seguridad criptográfica?"*

### Diapositiva 3: La Arquitectura de Confianza Cero (35 segundos)
* **Puntos clave en pantalla:**
  * Smart Contract Escrow (Avalanche Mainnet + HSK Chain).
  * Código Secreto OTP de 6 dígitos.
  * Oráculo Pericial IA Multimodal (Gemini 3.6 Flash).
* **Orador:** *"En AYNI no necesitas confiar en extraños. El comprador deposita USDC en nuestro contrato inteligente. El dinero queda blindado. Al comprador le llega un código OTP confidencial. El viajero viaja, entrega el producto físico, el comprador verifica que está intacto y recién le comparte el OTP. Al ingresar el OTP, el contrato inteligente liquida el pago al viajero de forma instantánea e irreversible."*

### Diapositiva 4: Demo en Vivo (60 segundos — ¡El Momento Clave!)
* **Acción en pantalla:**
  1. Muestra la landing con el radar 3D de rutas.
  2. Muestra un encargo en `/dashboard/orders` y el correo real que llegó con el OTP de Gmail.
  3. Abre `/dashboard/disputes`: muestra cómo el Oráculo de IA analiza una foto pericial con visión computacional y emite un dictamen con split 50/50 o reembolso.
  4. Abre `/dashboard/heritage`: muestra la bóveda con Dead Man's Switch para familias migrantes.
* **Orador:** *"Todo lo que ven está funcionando en vivo. Integramos Pollar para que cualquier persona pueda pagar en Stellar con su cuenta de Google sin saber qué es una wallet. Si el producto se daña, nuestro Oráculo IA audita las fotos y la metadata pericial en 4 fases, proponiendo una atestación ejecutable on-chain."*

### Diapositiva 5: Modelo de Negocio y Bounties Reales (25 segundos)
* **Puntos clave en pantalla:**
  * Comisión justa: 4% a 10% (con tope máximo de $50 USD).
  * 2% al Fondo Comunitario de Reserva contra siniestros aduaneros.
  * Desplegado en Avalanche Mainnet real con USDC de Circle y HSK Testnet.
* **Orador:** *"A diferencia de plataformas Web2 que cobran 20%, AYNI cobra una fracción mínima y asigna el 2% a un fondo comunitario de siniestros. Nuestros contratos no son simulaciones: están verificados en SnowTrace en la Mainnet de Avalanche y en HSK Chain."*

### Diapositiva 6: Cierre y Preguntas (15 segundos)
* **Orador:** *"AYNI devuelve el poder a la comunidad: hoy por ti, mañana por mí. Muchas gracias y estamos listos para sus preguntas."*

---

# 📹 SECCIÓN 3: Guion para Video Demo (2 a 3 minutos)

Si la plataforma pide un video subido a YouTube o Loom, graba la pantalla siguiendo estos tiempos:

* **0:00 – 0:30 (Landing & Visión):**
  * Graba el scroll de la landing page.
  * Muestra el radar de vuelos y la calculadora interactiva de comisiones.
  * Voz en off: Explicar el problema de importaciones/remesas en Bolivia y la propuesta de valor de AYNI.
* **0:30 – 1:00 (Onboarding & Pollar Stellar):**
  * Clic en "Login with Pollar" o Google en `/auth`.
  * Mostrar cómo se genera la dirección de wallet sin pedir frases semilla.
  * Voz en off: Resaltar la adopción masiva y el uso de Stellar vía el SDK de Pollar para gas casi nulo.
* **1:00 – 1:40 (Crear Encargo, Escrow & OTP Real):**
  * Ve a `/dashboard/orders/new`, selecciona un encargo y confirma el depósito en Escrow.
  * Abre la pestaña de correo electrónico y muestra el email real despachado por Google SMTP con el código OTP y las advertencias de seguridad.
  * Ve a `/dashboard/orders`, introduce el código OTP y muestra la animación de fondos liberados al viajero.
* **1:40 – 2:20 (Tribunal Forense con Oráculo IA):**
  * Ve a `/dashboard/disputes`.
  * Presiona "Analizar con Oráculo IA" en un caso abierto.
  * Muestra cómo Gemini 3.6 Flash analiza la evidencia fotográfica y genera el desglose de reembolso/compensación.
* **2:20 – 2:50 (Herencias Heritage & Tangem):**
  * Entra a `/dashboard/heritage`.
  * Muestra la bóveda sucesoria familiar, los porcentajes de los hijos y haz clic en "Emitir Pulso de Vida".
  * Muestra el modal de enlace con tarjeta física Tangem NFC.
* **2:50 – 3:00 (Cierre y Explorers):**
  * Muestra en una pestaña el contrato verificado en SnowTrace (Avalanche Mainnet) y despídete con el logo de AYNI Protocol.

---

# 🛡️ SECCIÓN 4: Cheat Sheet de Preguntas Capciosas de los Jueces

Ten estas respuestas preparadas cuando el jurado te ponga a prueba:

#### 1. *"¿Por qué usar Blockchain y no simplemente una base de datos con Stripe o QR bancario?"*
> **Respuesta:** *"Por dos razones críticas: en Bolivia el sistema bancario tiene bloqueado el acceso a dólares oficiales y pasarelas como Stripe no operan en el país. Además, un escrow tradicional requiere confiar ciegamente en una empresa intermediaria que puede congelar cuentas. En AYNI el escrow es no-custodial: los fondos residen en un contrato inmutable de Avalanche/HSK y se liquidan en USDC sin depender de la banca local."*

#### 2. *"¿Qué evita que el viajero se quede con el producto y no lo entregue?"*
> **Respuesta:** *"Tres barreras de seguridad: Primero, para aceptar encargos de alto valor, el viajero debe bloquear una garantía en el contrato (`guarantee_balance`). Segundo, el viajero no cobra ni un solo centavo hasta que entrega el paquete y el comprador le da el OTP. Tercero, validamos sus pasajes aéreos oficiales con código IATA mediante IA para certificar su itinerario real."*

#### 3. *"¿La Inteligencia Artificial puede mover fondos o alterar contratos por su cuenta?"*
> **Respuesta:** *"No, bajo ningún concepto. Diseñamos una arquitectura estricta de 'Separación de Poderes'. La IA actúa únicamente como perito oráculo (emite una atestación criptográfica hash Keccak-256 evaluando daños o boletas). La ejecución final de mover dinero solo puede ser activada por la firma de las partes o el tribunal arbitral on-chain."*

#### 4. *"¿Por qué tienen contratos en Avalanche y además integración en Stellar con Pollar?"*
> **Respuesta:** *"Es una arquitectura modular multi-chain pensada para dos públicos distintos: Avalanche C-Chain la usamos para liquidación institucional de alto volumen con el USDC nativo de Circle, mientras que Stellar vía Pollar la usamos para el comercio minorista del día a día, permitiendo que personas sin conocimientos Web3 paguen con su cuenta de Google sin pagar comisiones de gas perceptibles."*

#### 5. *"¿Cómo funciona legalmente la herencia cripto en Heritage?"*
> **Respuesta:** *"Funciona como un fideicomiso programable descentralizado (Dead Man's Switch). No sustituye trámites registrales de bienes físicos, sino que garantiza que los activos líquidos y ahorros en stablecoins no queden en el limbo digital si el titular sufre un siniestro, ejecutando la voluntad del propietario de forma directa y matemática."*

---

### ✅ Checklist Final para Mañana
- [x] Contrato Avalanche Mainnet verificado (`0x7A9fe51...`)
- [x] Contrato HSK Testnet verificado (`0x872660...`)
- [x] Pollar SDK integrado y testeado
- [x] Unlock Protocol en `/dashboard/premium`
- [x] Gemini 3.6 Flash respondiendo completo (4096 tokens)
- [x] Google SMTP enviando correos reales (`ayniprotocol@gmail.com`)
- [x] Seguridad de cabeceras A+ y CSP corregido
- [x] Entregable y Pitch Deck listos en este documento
