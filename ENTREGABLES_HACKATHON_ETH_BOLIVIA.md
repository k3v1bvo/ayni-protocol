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

# 📹 SECCIÓN 3: Guion Literal Teleprompter para el Video Demo (Exactamente 3 Minutos)

*(Usa este guion palabra por palabra cuando grabes con Loom u OBS. No tienes que improvisar nada).*

```
[ PANTALLA 1: Landing (0:00 - 0:35) ]
[ PANTALLA 2: Auth con Pollar (0:35 - 1:05) ]
[ PANTALLA 3: Escrow & Correo OTP (1:05 - 1:45) ]
[ PANTALLA 4: Liberación de Fondos (1:45 - 2:05) ]
[ PANTALLA 5: Oráculo IA de Disputas (2:05 - 2:35) ]
[ PANTALLA 6: Bóveda Heritage & SnowTrace (2:35 - 3:00) ]
```

---

### [0:00 – 0:35] Escena 1: Landing Page & Problemática
* **Qué tener en pantalla:** La landing page en `http://localhost:3000` (o Vercel). Haz scroll suave hacia la calculadora de tarifas y el radar 3D interactivo.
* **Texto a leer en voz alta:**
  > *"En Bolivia y Latinoamérica, importar un repuesto o enviar dinero a tu familia cuesta hasta un 30% en comisiones bancarias o couriers tradicionales. Al mismo tiempo, miles de personas viajan a diario con maletas a medio llenar.*
  > 
  > *Bienvenidos a **AYNI Protocol**, el ecosistema descentralizado que conecta a compradores con viajeros para mover productos y remesas persona a persona, con custodia en contratos inteligentes y comisiones justas de solo el 4 al 10% con tope de 50 dólares."*

---

### [0:35 – 1:05] Escena 2: Onboarding Invisible con Pollar (Stellar)
* **Qué tener en pantalla:** Haz clic en el botón superior **"Login with Pollar"** o ve a `/auth`.
* **Qué hacer con el mouse:** Muestra el modal de inicio de sesión con Google.
* **Texto a leer en voz alta:**
  > *"El usuario común no sabe qué es una seed phrase. Gracias al SDK de Pollar sobre Stellar, cualquier persona inicia sesión con su cuenta de Google y obtiene una billetera custodial en dos segundos, lista para transaccionar en USDC con comisiones de gas prácticamente nulas."*

---

### [1:05 – 1:45] Escena 3: Creación de Encargo, Escrow y OTP Real
* **Qué tener en pantalla:** Entra a `/dashboard/orders/new` o `/dashboard/trips`.
* **Qué hacer con el mouse:**
  1. Elige una ruta (ejemplo: *Miami ➔ La Paz*).
  2. Dale a **"Bloquear Fondos en Escrow"**.
  3. Cambia de pestaña a tu Gmail (`ayniprotocol@gmail.com` o tu correo) y muestra el correo oficial de AYNI recién llegado con el código secreto OTP en pantalla grande.
* **Texto a leer en voz alta:**
  > *"Aquí ocurre la magia: el comprador deposita sus fondos, los cuales quedan resguardados en nuestro Smart Contract `AyniEscrow` en Avalanche Mainnet. Ni la plataforma ni el viajero pueden tocar el dinero.*
  > 
  > *El comprador recibe este correo confidencial con un código OTP de seis dígitos. La regla de oro es simple: jamás entregues este código hasta tener el paquete físico en tus manos."*

---

### [1:45 – 2:05] Escena 4: Entrega Física y Liberación Inmediata
* **Qué tener en pantalla:** Ve a `/dashboard/orders` o `/dashboard/tracking/AY-8492`.
* **Qué hacer con el mouse:** Escribe el código OTP (ej. `582910`) y haz clic en **"Verificar y Liberar Pago"**. Observa la animación verde de éxito.
* **Texto a leer en voz alta:**
  > *"Cuando el viajero llega a destino, entrega el encargo y el comprador valida el producto, le comparte el OTP. El viajero lo ingresa y el Smart Contract liquida el pago de forma instantánea e irreversible en la blockchain."*

---

### [2:05 – 2:35] Escena 5: Tribunal Forense con Oráculo IA (Gemini 3.6 Flash)
* **Qué tener en pantalla:** Ve a `/dashboard/disputes`.
* **Qué hacer con el mouse:** Abre una disputa abierta y presiona el botón **"Analizar con Oráculo IA"**. Muestra el desglose generado en pantalla.
* **Texto a leer en voz alta:**
  > *"¿Qué pasa si el paquete llega roto o no coincide? El comprador no entrega el OTP y abre una disputa. Nuestro Oráculo pericial con Gemini 3.6 Flash inspecciona las fotografías de evidencia con visión computacional, extrae boletas con OCR y genera una atestación criptográfica Keccak-256 para ejecutar un reembolso o una compensación mutua justa."*

---

### [2:35 – 3:00] Escena 6: Bóveda Heritage & Exploradores Oficiales
* **Qué tener en pantalla:** Abre `/dashboard/heritage` (muestra el Dead Man's Switch y el botón de pulso Tangem), y luego cambia a la pestaña del navegador con **SnowTrace** (`0x7A9fe51...`).
* **Texto a leer en voz alta:**
  > *"Además, protegemos a las familias migrantes con **AYNI Heritage**, un Dead Man's Switch que transfiere los fondos a sus herederos si el titular no emite un pulso de vida con su tarjeta Tangem.*
  > 
  > *Nuestros contratos inteligentes están desplegados y verificados en **Avalanche C-Chain Mainnet** con el USDC oficial de Circle y en **HashKey Chain**. AYNI es reciprocidad andina llevada a la máxima expresión de Web3. ¡Muchas gracias!"*

---

# ✍️ SECCIÓN 4: Descripción de 300 Palabras para Pollar Track

*(Copia y pega este texto exacto si la postulación del bounty de Pollar te pide el resumen del caso de uso)*:

> **AYNI Protocol: Descentralizando el Comercio Transfronterizo y las Remesas en Latam con Pollar SDK y Stellar**
> 
> En economías emergentes como Bolivia, la severa escasez de divisas y las comisiones bancarias tradicionales asfixian a familias y comerciantes. Enviar remesas cuesta entre el 8% y el 12% en agencias tradicionales, mientras que importar insumos o tecnología mediante couriers multinacionales puede sumar hasta un 30% en fletes e intermediarios.
> 
> AYNI resuelve esta problemática conectando a compradores locales con viajeros que tienen capacidad de equipaje ociosa (*crowdshipping* P2P), resguardando cada transacción mediante contratos inteligentes de custodia (Escrow). Sin embargo, el principal obstáculo para la adopción masiva en Latinoamérica es la complejidad de la experiencia de usuario en Web3: frases semilla, gas en tokens volátiles y extensiones de navegador.
> 
> Aquí es donde **Pollar SDK** se convierte en el motor fundamental de AYNI. Al integrar `@pollar/react`, implementamos una experiencia de *onboarding invisible*: cualquier usuario puede iniciar sesión en un segundo utilizando su cuenta de Google existente, generando automáticamente una billetera Stellar no custodial y segura. 
> 
> Dentro de nuestro flujo de custodia, los usuarios pueden seleccionar la pestaña de pago **Pollar (Stellar)** para bloquear depósitos en USDC nativo con comisiones de red inferiores a $0.001 USD y confirmación en segundos. Esto permite que una persona en Santa Cruz o La Paz pueda encargar compras en el exterior o transferir valor a sus allegados sin necesidad de conocimientos técnicos previos.
> 
> AYNI y Pollar comparten la misma misión: bancarizar y habilitar pagos transfronterizos sin fricción para millones de latinoamericanos, sustituyendo la burocracia financiera tradicional por rieles de pago rápidos, seguros y transparentes sobre la red Stellar.

---

# 🚀 SECCIÓN 5: Instrucciones para la Doble Postulación en Devfolio

Para maximizar premios, recuerda que debes tener el proyecto registrado en ambas convocatorias de Devfolio:

### 1. Convocatoria Local: Ethereum Bolivia 2026
* **Plataforma:** Devfolio ETH Bolivia
* **Tracks a seleccionar:**
  * ✅ *Track General / Bolivia Hackathon*
  * ✅ *Avalanche Track*
  * ✅ *Pollar Track*
  * ✅ *Unlock Protocol Track*
* **Link de repositorio:** `https://github.com/k3v1bvo/ayni-protocol`
* **Demo URL:** `https://ayni-protocool.vercel.app/`

### 2. Convocatoria Internacional: EAG Global Buildathon (HSK Chain & ShanhaiWoo)
* **Plataforma:** [EAG Global Buildathon en Devfolio](https://eag-global-buildathon.devfolio.co/overview)
* **Tracks a seleccionar:**
  * ✅ *HSK Chain Bounty ($1,000 USD)*
  * ✅ *Road to ShanhaiWoo (Beca Shenzhen $800 USD)*
* **Contrato a reportar para HSK:**  
  `0x872660b3324236c306b539f90a02f8b8D019E9Ea` (Verificado en testnet-explorer.hskchain.net)
* **Token MockUSDC reportado:**  
  `0x7A9fe51c8688281Ed66e0A98401B46a277c86D80`

---

# 🛡️ SECCIÓN 6: Cheat Sheet de Preguntas Capciosas de los Jueces

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

### ✅ Checklist Operativo Final para Mañana
- [x] Contrato Avalanche Mainnet verificado (`0x7A9fe51...`)
- [x] Contrato HSK Testnet verificado (`0x872660...`)
- [x] Pollar SDK integrado y testeado
- [x] Unlock Protocol en `/dashboard/premium`
- [x] Gemini 3.6 Flash respondiendo completo (4096 tokens)
- [x] Google SMTP enviando correos reales (`ayniprotocol@gmail.com`)
- [x] Seguridad de cabeceras Calificación A sin bloqueos
- [x] Presentación LaTeX Beamer compilada en PDF (`presentacion_ayni_protocol.pdf`)
- [x] Guion literal teleprompter para video de 3 minutos
- [x] Ensayo de 300 palabras para Pollar Track

