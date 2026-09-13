import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_INSTRUCTION = `Eres "AYNI Guardian", el oráculo pericial y asistente de soporte inteligente del Protocolo AYNI (Buildathon ETH Bolivia 2026).
Tu misión es proteger, educar y guiar a compradores (clientes), viajeros de crowdshipping y comerciantes en el ecosistema descentralizado de comercio seguro P2P.

CONOCIMIENTO INTEGRAL DEL PROTOCOLO AYNI:
1. CUSTODIA & ESCROW SMART CONTRACT:
   - Red principal: Base L2 (USDC nativo, gas < $0.01 USD, contrato 0x71C93475A6E46949Cbc4928Eb811b7d566bEB49a).
   - Redes multi-cadena secundarias: Avalanche C-Chain (contrato 0x7A9fe51c8688281Ed66e0A98401B46a277c86D80) y HSK Testnet.
   - Seguridad: El dinero depositado por el comprador queda bloqueado en el contrato inteligente. Nadie (ni los creadores de AYNI, ni el viajero, ni la IA) puede tocar esos fondos hasta la liberación o reembolso.

2. EL CÓDIGO SECRETO OTP (LA REGLA DE ORO):
   - Al depositar el pago en el contrato, el comprador recibe un código OTP confidencial de 6 dígitos.
   - POR QUÉ NUNCA ENTREGARLO ANTES: El OTP es la llave criptográfica de liberación irrevocable en la blockchain. Si el comprador entrega el OTP antes de recibir el producto físicamente y revisar su estado, el Smart Contract transferirá los fondos al viajero de forma irreversible.
   - CUÁNDO ENTREGARLO: Únicamente cuando el viajero te entrega el paquete físico en persona, lo abres y confirmas que coincide con lo solicitado. En ese instante le das el OTP para que el viajero cobre su pago.

3. HARDWARE TANGEM (2FA & CUSTODIA FRÍA):
   - Billetera física oficial con chip de grado militar EAL6+. Sin frases semilla en papel que puedan ser hackeadas o extraviadas.
   - CÓMO USARLA EN CELULAR: Aproximar la tarjeta física NFC a la parte trasera del smartphone.
   - CÓMO USARLA EN COMPUTADORA / LAPTOP WEB: En PC no hay lector NFC en la pantalla. Se genera un Código QR de WalletConnect (tangem://wc?uri=...). El usuario abre su app Tangem en el celular, escanea el QR en la pantalla de su PC y aproxima su tarjeta física al teléfono para autorizar la sesión o el pago.
   - MODO JURADO: Para jueces de ETH Bolivia, existe la pestaña "Simular Tap (Jurado)" para evaluar el flujo 100% interactivo en 1 clic.

4. POLLAR (STELLAR EMBEDDED WALLET & USDC):
   - Billetera embebida no custodial en la red Stellar Testnet.
   - Permite crear una wallet Stellar en 2 segundos iniciando sesión con Google (social login), sin extensiones ni seed phrases.
   - Permite pagar encargos en el checkout de [/marketplace](/marketplace) con USDC en la red Stellar.
   - Faucet gratuito: En Stellar Testnet, cualquier cuenta se fondea gratis con XLM para gas mediante Friendbot (https://friendbot.stellar.org/?addr=DIRECCION_G...).

5. FOOT SHOPPING & MERCADILLOS FÍSICOS:
   - Los compradores pueden encargar compras a pie en mercadillos o ferias (ej. El Rastro de Madrid, Ferias de 16 de Julio en El Alto, tiendas oficiales).
   - El viajero va en persona, adquiere el producto, toma foto del recibo/boleta y la sube a ImgBB.
   - La IA Gemini Vision audita el OCR de la boleta: comercio, fecha, monto en moneda local y conversión a USDC, certificando autenticidad antes de empacar.

6. FONDO DE GARANTÍA COMUNITARIO & SEGURO ADUANERO:
   - Una reserva del 2% cubre incidencias, extravíos o retenciones de aduana imprevistas. Si hay problemas aduaneros, el comprador no pierde su capital.

7. AYNI HERITAGE (BÓVEDAS DE HERENCIA CRIPTO):
   - Smart Contracts con Dead Man's Switch para compatriotas migrantes. Si el titular no emite un latido (Heartbeat) en el plazo configurado (ej. 180 días), los fondos se transfieren automáticamente a los beneficiarios designados sin intermediarios judiciales ni bancarios.

8. DISPUTAS & RESOLUCIÓN FORENSE CON IA (/dashboard/disputes):
   - Si el producto llega roto, incorrecto o no llega, el comprador NO da el OTP y abre una disputa en [/dashboard/disputes](/dashboard/disputes).
   - El sistema activa un pipeline pericial en 4 fases: (1) Ingesta descentralizada en IPFS, (2) Análisis de daño/originalidad con Gemini 3.6 Flash Vision, (3) Cotejo con los SLAs del Smart Contract, y (4) Consenso mediante Chainlink Functions DON.
   - Genera una propuesta de liquidación matemática exacta (ej. 75% reembolso comprador / 25% compensación viajero) y una atestación Keccak-256 ejecutable on-chain en 1 clic.

9. ORÁCULO AÉREO IATA DE BILLETES & RUTAS (/dashboard/trips):
   - Para evitar viajeros fantasmas o perfiles falsos, los viajeros pueden certificar su billete aéreo oficial con el Oráculo IA.
   - Gemini 3.6 Flash extrae: Aerolínea (Iberia, LATAM, BOA), número de vuelo, códigos de aeropuertos IATA (MAD, LPZ, MIA, VVI), fecha de salida y franquicia de equipaje en kg.
   - Sella la ruta con la etiqueta "Verificado IATA" y ancla la prueba en el contrato de Base L2.

10. AUDITORÍA VISUAL DE COMPRAS (/dashboard/orders):
   - En encargos de compra asistida o mercadillos (Foot Shopping), el viajero sube la foto del producto adquirido en tienda.
   - La IA analiza la foto en tiempo real con escaneo láser, coteja que el artículo coincida exactamente con la orden del comprador y sella el estado a "verified_ai".

LÍMITES Y ÉTICA DE LA IA (QUÉ PUEDE Y QUÉ NO PUEDE HACER):
- LO QUE LA IA PUEDE HACER:
  * Explicar cualquier concepto, cálculo de tarifas, paso a paso o estado del protocolo con pedagogía y empatía.
  * Auditar técnicamente fotos de boletas, pasajes aéreos y productos para verificar coincidencia, fechas y normativas IATA.
  * Orientar en caso de disputas, retenciones aduaneras o dudas sobre Tangem y Pollar.
- LO QUE LA IA NUNCA PUEDE HACER (LÍMITES DE SEGURIDAD):
  * NO puede alterar saldos ni ejecutar transferencias en la blockchain por sí misma (requiere la firma criptográfica o el OTP del usuario).
  * NO puede ni debe solicitar contraseñas, claves privadas ni el código secreto OTP.
  * NO puede modificar contratos inteligentes desplegados (las reglas de Base L2 y Avalanche son inmutables).
  * NO emite consejos de inversión financiera ni promesas de rendimiento especulativo.

DIRECTIVAS DE COMUNICACIÓN:
- Tono: Protector, profesional, pedagógico y resolutivo. Habla en español latinoamericano claro.
- Siempre explica el "por qué": no solo des la orden o el dato, explica la razón de seguridad detrás para que el usuario aprenda.
- Si el usuario reporta angustia o problemas: empieza asegurándole con calma: "Tranquilo, tus fondos están 100% resguardados en el Smart Contract y nadie puede cobrarlos sin tu OTP."
- Usa formato markdown limpio: viñetas legibles, negritas en conceptos clave y enlaces internos directos en formato [Texto del enlace](/ruta).
- Si te envían una imagen, haz un análisis pericial estructurado (Comercio, Fecha, Monto, Autenticidad, Dictamen).`;

// Retry con backoff exponencial para manejar rate limits de Gemini
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);

      // Si es rate limit (429) o server overloaded (503), esperar y reintentar
      if (res.status === 429 || res.status === 503) {
        const waitMs = Math.min(1000 * Math.pow(2, attempt), 6000);
        console.warn(`[Gemini] Rate limited (${res.status}), reintentando en ${waitMs}ms (intento ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitMs));
        continue;
      }

      return res;
    } catch (err: any) {
      lastError = err;
      const waitMs = Math.min(1000 * Math.pow(2, attempt), 6000);
      console.warn(`[Gemini] Error de red, reintentando en ${waitMs}ms:`, err.message);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

// Convertir mensajes del chat al formato de Gemini
function buildGeminiContents(
  messages: Array<{ sender: string; text: string; imageUrl?: string }>,
  userRole: string,
  userName?: string,
  currentOrderCode?: string,
  imageUrl?: string,
  imageBase64?: string,
  imageMime?: string
) {
  const recentMessages = messages.slice(-10);
  const contents: any[] = [];

  for (let i = 0; i < recentMessages.length; i++) {
    const msg = recentMessages[i];
    const role = msg.sender === 'user' ? 'user' : 'model';
    const parts: any[] = [];

    if (i === 0 && role === 'user') {
      parts.push({
        text: `[Sesión: Usuario="${userName || 'Compañero'}", Rol="${userRole || 'Cliente'}", Contexto="${currentOrderCode || 'General'}"]\n${msg.text}`
      });
    } else {
      parts.push({ text: msg.text });
    }

    if (i === recentMessages.length - 1 && role === 'user' && imageBase64 && imageMime) {
      parts.push({
        inlineData: { mimeType: imageMime, data: imageBase64 }
      });
      parts.push({
        text: `\n[INSTRUCCIÓN PERICIAL OCR/VISIÓN]: Inspecciona la imagen adjunta.
Si es recibo o boleta de compra: extrae nombre del comercio, fecha, monto en moneda original y dictamina autenticidad.
Si es un producto o empaque: describe qué es, su estado aparente y si es apto para transporte aéreo IATA.
Usa emojis de dictamen: 🧾 (Boleta validada), 📦 (Producto inspeccionado), 🛡️ (Aprobado para Escrow).`
      });
    }

    contents.push({ role, parts });
  }

  const sanitized: any[] = [];
  for (const c of contents) {
    if (sanitized.length === 0) {
      if (c.role === 'user') sanitized.push(c);
      continue;
    }
    const lastRole = sanitized[sanitized.length - 1].role;
    if (c.role !== lastRole) {
      sanitized.push(c);
    } else {
      sanitized[sanitized.length - 1].parts.push(...c.parts);
    }
  }

  if (sanitized.length > 0 && sanitized[sanitized.length - 1].role === 'model') {
    sanitized.push({ role: 'user', parts: [{ text: 'Continúa orientándome sobre AYNI.' }] });
  }

  return sanitized.length > 0 ? sanitized : [{ role: 'user', parts: [{ text: 'Hola, necesito orientación en AYNI Protocol.' }] }];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userRole, userName, currentOrderCode, imageUrl } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Faltan mensajes en la conversación' }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey) {
      try {
        let imageBase64: string | undefined;
        let imageMime: string | undefined;

        if (imageUrl) {
          try {
            const imgRes = await fetch(imageUrl);
            if (imgRes.ok) {
              const arrayBuffer = await imgRes.arrayBuffer();
              imageMime = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0];
              imageBase64 = Buffer.from(arrayBuffer).toString('base64');
            }
          } catch (imgErr) {
            console.warn('[Gemini Chat] Error descargando imagen:', imgErr);
          }
        }

        const contents = buildGeminiContents(messages, userRole, userName, currentOrderCode, imageUrl, imageBase64, imageMime);

        // Modelo prioritario verificado: gemini-3.6-flash, con fallbacks automáticos
        const candidateModels = Array.from(new Set([
          'gemini-3.6-flash',
          process.env.GEMINI_MODEL,
          'gemini-2.0-flash',
          'gemini-1.5-flash',
        ].filter(Boolean))) as string[];

        for (const model of candidateModels) {
          try {
            const geminiRes = await fetchWithRetry(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  systemInstruction: {
                    parts: [{ text: SYSTEM_INSTRUCTION }]
                  },
                  contents,
                  generationConfig: {
                    temperature: 0.35,
                    maxOutputTokens: 4096,
                    topP: 0.9,
                  },
                  safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                  ]
                })
              },
              2
            );

            if (geminiRes.ok) {
              const data = await geminiRes.json();
              const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (responseText) {
                return NextResponse.json({
                  reply: responseText,
                  provider: `gemini (${model})`,
                });
              }

              const blockReason = data.candidates?.[0]?.finishReason;
              if (blockReason === 'SAFETY') {
                return NextResponse.json({
                  reply: '🛡️ Tu consulta fue recibida pero fue filtrada por seguridad. Reformula tu pregunta o abre una consulta en [/dashboard/disputes](/dashboard/disputes).',
                  provider: 'gemini-safety',
                });
              }
            } else {
              console.warn(`[Gemini Chat] Modelo ${model} devolvió ${geminiRes.status}, intentando siguiente...`);
            }
          } catch (modelErr: any) {
            console.warn(`[Gemini Chat] Fallo con modelo ${model}:`, modelErr.message);
          }
        }
      } catch (geminiErr: any) {
        console.warn('[Gemini Chat] Fallback a motor contextual AYNI:', geminiErr.message);
      }
    }

    // ── FALLBACK CONTEXTUAL ENRIQUECIDO (MULTI-INTENT & RESILIENTE) ──
    const lastMsg = (messages[messages.length - 1]?.text || '').toLowerCase().trim();

    // Detección por intenciones temáticas
    if (/tangem|nfc|tarjeta.*fisica|billetera.*fria|card/.test(lastMsg)) {
      return NextResponse.json({
        reply: `💳 **¿Cómo funciona Tangem en AYNI?**\n\n• **En Celular:** Acercas tu tarjeta física a la antena NFC del teléfono para firmar pagos y 2FA con chip militar **EAL6+**.\n• **En Computadora / Web:** Como las pantallas de PC no tienen NFC, AYNI genera un **Código QR WalletConnect**. Abres la app de Tangem en tu smartphone, escaneas el QR en tu monitor y acercas la tarjeta al celular.\n• **Modo Jurado:** Para evaluadores de ETH Bolivia, puedes usar la pestaña de simulación instantánea en 1 clic.\n\nTus claves privadas nunca salen del chip físico.`,
        provider: 'ayni-guardian-context',
      });
    }

    if (/pollar|stellar|usdc.*stellar|wallet.*social/.test(lastMsg)) {
      return NextResponse.json({
        reply: `🪙 **Pagos con Pollar en la red Stellar:**\n\n• **Embedded Wallet en 2 segundos:** Conéctate con tu cuenta de Google desde el botón superior o en el checkout, sin frases semilla ni extensiones.\n• **Pagos directos en USDC:** En el checkout de [/marketplace](/marketplace), selecciona la pestaña **Pollar (Stellar)** para pagar el escrow con comisiones menores a $0.001.\n• **Fondos de prueba gratis:** Puedes recargar tu dirección de Stellar Testnet (G...) instantáneamente con el [Friendbot oficial de Stellar](https://friendbot.stellar.org).`,
        provider: 'ayni-guardian-context',
      });
    }

    if (/otp|codigo|secreto|liberar|clave|password|6 digitos/.test(lastMsg)) {
      return NextResponse.json({
        reply: `🔑 **¿Por qué el código OTP es la regla de oro?**\n\n• **Protección absoluta:** Al depositar en el Smart Contract de Base L2, tus fondos quedan bloqueados en custodia y recibes tu código OTP de 6 dígitos.\n• **¿Por qué NUNCA darlo antes?** El OTP ejecuta la liberación irreversible del dinero al viajero. Si lo entregas antes de tener el paquete en tus manos, pierdes el control de tu dinero.\n• **¿Cuándo entregarlo?** Solo cuando recibas tu paquete físicamente, lo abras y compruebes que todo está en perfecto estado.`,
        provider: 'ayni-guardian-context',
      });
    }

    if (/limite|que puedes hacer|alcance|puedes transferir|capacidades|inteligencia/.test(lastMsg)) {
      return NextResponse.json({
        reply: `🛡️ **Mis Capacidades y Límites de Seguridad como IA:**\n\n✅ **Lo que SÍ puedo hacer:**\n• Guiarte paso a paso en compras, viajes y depósitos en Base L2 o Stellar.\n• Auditar fotos de boletas comerciales (OCR) y verificar sellos aduaneros.\n• Revisar si un producto cumple normativas IATA de equipaje aéreo.\n• Asesorarte en mediación de disputas en [/dashboard/disputes](/dashboard/disputes).\n\n❌ **Lo que NUNCA puedo hacer:**\n• **No puedo mover ni liberar fondos:** Solo tú puedes liberar el dinero introduciendo el OTP o firmando con tu billetera.\n• **No puedo pedirte contraseñas ni frases privadas.**\n• **No puedo alterar las reglas de los contratos inteligentes.**`,
        provider: 'ayni-guardian-context',
      });
    }

    if (/disputa|problema|no llega|roto|dañ|estafa|demor|aduan/.test(lastMsg)) {
      return NextResponse.json({
        reply: `⚖️ **¡Tranquilo! Tus fondos están 100% seguros:**\n\n1. **NO entregues tu código OTP bajo ninguna circunstancia.** Mientras no des el OTP, el viajero no puede cobrar nada.\n2. Ve a [/dashboard/disputes](/dashboard/disputes) y abre una incidencia detallando lo sucedido.\n3. El Smart Contract cuenta con un **Fondo de Garantía del 2%** para seguros aduaneros y extravíos.\n4. La IA auditará las pruebas fotográficas y los mediadores del protocolo dictaminarán el reembolso directo a tu billetera.`,
        provider: 'ayni-guardian-context',
      });
    }

    if (/mercadillo|foot shopping|comprar|rastro|tienda|encarg/.test(lastMsg)) {
      return NextResponse.json({
        reply: `🛍️ **Compras a pie en tiendas específicas (Foot Shopping):**\n\n1. Ve a [/dashboard/orders/new](/dashboard/orders/new) y escribe el producto y la tienda o mercadillo específico que deseas (ej: El Rastro en Madrid, tiendas oficiales, artesanos).\n2. El viajero va en persona a la tienda física, compra el producto y sube la foto del recibo a ImgBB.\n3. El oráculo de IA audita la boleta y el precio en tiempo real.\n4. Recibes tu encargo en mano y recién ahí entregas el OTP.`,
        provider: 'ayni-guardian-context',
      });
    }

    if (/heritage|herencia|fallec|sucesi|dead man|muerte/.test(lastMsg)) {
      return NextResponse.json({
        reply: `🏛️ **Bóvedas de Sucesión Cripto (AYNI Heritage):**\n\nDiseñadas para proteger el patrimonio de migrantes y trabajadores:\n• Configuras un **Dead Man's Switch** con un intervalo de latido (Heartbeat) de por ejemplo 180 días.\n• Si por algún motivo dejas de emitir el latido, el Smart Contract distribuye tus fondos automáticamente a los familiares o billeteras que designaste.\n• **Sin abogados, sin juicios y sin comisiones bancarias abusivas.** Puedes configurarlo en [/dashboard/heritage](/dashboard/heritage).`,
        provider: 'ayni-guardian-context',
      });
    }

    // Saludos y preguntas abiertas
    return NextResponse.json({
      reply: `¡Hola ${userName ? `**${userName}**` : ''}! 👋 Soy **AYNI Guardian**, tu copiloto de seguridad en AYNI Protocol.\n\nPuedo orientarte con:\n• 💳 **Billetera Tangem:** Enlace NFC en móvil o por [Código QR](/auth) en computadoras.\n• 🪙 **Pagos Pollar:** Enlace de wallet Stellar con Google y pagos rápidos en USDC.\n• 🔑 **Código OTP:** Por qué nunca debes darlo antes de recibir tu paquete.\n• 📦 **Foot Shopping:** Cómo encargar compras en mercadillos físicos en [/dashboard/orders/new](/dashboard/orders/new).\n• ⚖️ **Protección:** Qué hacer ante dudas o en [/dashboard/disputes](/dashboard/disputes).\n\n¿Qué te gustaría consultar o revisar hoy?`,
      provider: 'ayni-guardian-welcome',
    });

  } catch (err: any) {
    console.error('Error en /api/ai/chat:', err);
    return NextResponse.json({ error: 'Error procesando consulta' }, { status: 500 });
  }
}

