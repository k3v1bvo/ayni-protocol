import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_INSTRUCTION = `Eres "AYNI Guardian", el oráculo y asistente de soporte oficial del Protocolo AYNI (Buildathon ETH Bolivia 2026).
Tu misión es guiar a compradores, viajeros de crowdshipping y comerciantes en el ecosistema descentralizado de comercio seguro en la red Base L2.

CONOCIMIENTO OPERATIVO DEL PROTOCOLO AYNI:
1. CUSTODIA SMART CONTRACT (Base L2): Los fondos se depositan en el contrato AyniEscrow (0x71C93475A6E46949Cbc4928Eb811b7d566bEB49a) en USDC. Costo de transacción menor a $0.01 USD.
2. BILLETERA FRÍA TANGEM: Es la única billetera de hardware oficial del protocolo. Usa chips EAL6+ con aproximación NFC o WalletConnect. No requiere frases semilla en papel y previene hackeos de fondos en tránsito.
3. CÓDIGO SECRETO OTP: El comprador recibe un código de 6 caracteres al depositar en el contrato. NUNCA debe dar este código hasta recibir el producto físicamente y verificar que está en orden. Al introducir el OTP, el contrato libera el pago al viajero.
4. COMPRAS EN MERCADILLOS Y TIENDAS ESPECÍFICAS (Foot Shopping): Los compradores pueden encargar productos de tiendas o mercadillos específicos (ej. El Rastro en Madrid, tiendas oficiales, mercados locales). El viajero va a pie a la tienda, sube la foto del recibo a ImgBB y la IA Gemini Vision audita la boleta.
5. FONDO DE GARANTÍA Y ADUANAS: Existe una reserva del 2% y una cláusula de seguro aduanero en el Smart Contract que reembolsa automáticamente en caso de retención o extravío.
6. AYNI HERITAGE (Bóvedas de Sucesión): Smart Contracts con Dead Man's Switch para compatriotas migrantes. Si el titular no emite un latido (Heartbeat) en el plazo fijado (ej. 180 días), los fondos se distribuyen de forma autónoma a los beneficiarios designados sin trámites judiciales.
7. DISPUTAS: Si hay problemas, el comprador NO debe entregar el OTP y debe abrir una disputa en /dashboard/disputes.

REGLAS DE COMPORTAMIENTO:
- Tono profesional, protector, claro y empático. Responde en el idioma del usuario.
- Si un usuario reporta un problema urgente: indica que SUS FONDOS ESTÁN SEGUROS y que NO dé el OTP.
- NUNCA te salgas del contexto de AYNI Protocol. Para temas externos responde: "Como asistente de AYNI Protocol, solo puedo orientarte sobre compras, viajes, custodia en Base L2, billeteras Tangem y protección patrimonial."
- Respuestas concisas (máximo 3 párrafos cortos). Usa viñetas y emojis para claridad.
- Si te envían una imagen, analízala pericialmente (OCR si es recibo, identificación si es producto).`;

// Retry con backoff exponencial para manejar rate limits de Gemini
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);

      // Si es rate limit (429) o server overloaded (503), esperar y reintentar
      if (res.status === 429 || res.status === 503) {
        const waitMs = Math.min(1000 * Math.pow(2, attempt), 8000); // 1s, 2s, 4s, max 8s
        console.warn(`[Gemini] Rate limited (${res.status}), retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitMs));
        continue;
      }

      return res;
    } catch (err: any) {
      lastError = err;
      const waitMs = Math.min(1000 * Math.pow(2, attempt), 8000);
      console.warn(`[Gemini] Network error, retrying in ${waitMs}ms:`, err.message);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

// Convertir mensajes del chat al formato de Gemini (con historial completo)
function buildGeminiContents(
  messages: Array<{ sender: string; text: string; imageUrl?: string }>,
  userRole: string,
  currentOrderCode?: string,
  imageUrl?: string,
  imageBase64?: string,
  imageMime?: string
) {
  // Tomar los últimos 10 mensajes para contexto (evitar tokens excesivos)
  const recentMessages = messages.slice(-10);
  const contents: any[] = [];

  for (let i = 0; i < recentMessages.length; i++) {
    const msg = recentMessages[i];
    const role = msg.sender === 'user' ? 'user' : 'model';
    const parts: any[] = [];

    // Al primer mensaje del user, agregar contexto de sesión
    if (i === 0 && role === 'user') {
      parts.push({ text: `[Contexto: Rol=${userRole || 'Cliente'}, Pedido=${currentOrderCode || 'General'}]\n${msg.text}` });
    } else {
      parts.push({ text: msg.text });
    }

    // Si es el último mensaje y trae imagen, adjuntarla
    if (i === recentMessages.length - 1 && role === 'user' && imageBase64 && imageMime) {
      parts.push({
        inlineData: { mimeType: imageMime, data: imageBase64 }
      });
      parts.push({
        text: `\n[INSTRUCCIÓN PERICIAL]: Inspecciona la imagen adjunta. Si es recibo/boleta: extrae texto OCR, comercio, fecha, monto. Si es producto: identifica marca/modelo/estado. Dictamina con 📦/🧾/🛡️.`
      });
    }

    contents.push({ role, parts });
  }

  // Gemini requiere que los turnos alternen user/model. Asegurar eso.
  const sanitized: any[] = [];
  for (const c of contents) {
    if (sanitized.length === 0) {
      // El primer turno debe ser user
      if (c.role === 'user') sanitized.push(c);
      continue;
    }
    const lastRole = sanitized[sanitized.length - 1].role;
    if (c.role !== lastRole) {
      sanitized.push(c);
    }
    // Si mismo rol, fusionar texto
    else {
      const lastParts = sanitized[sanitized.length - 1].parts;
      lastParts.push(...c.parts);
    }
  }

  // Si el último turno es model, agregar un user dummy para que Gemini responda
  if (sanitized.length > 0 && sanitized[sanitized.length - 1].role === 'model') {
    sanitized.push({ role: 'user', parts: [{ text: 'Continúa.' }] });
  }

  return sanitized.length > 0 ? sanitized : [{ role: 'user', parts: [{ text: 'Hola, necesito ayuda.' }] }];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userRole, currentOrderCode, imageUrl } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Faltan mensajes en la conversación' }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey) {
      try {
        // Si hay imagen, descargarla y convertir a base64
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

        const contents = buildGeminiContents(messages, userRole, currentOrderCode, imageUrl, imageBase64, imageMime);

        const geminiRes = await fetchWithRetry(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: SYSTEM_INSTRUCTION }]
              },
              contents,
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 600,
                topP: 0.85,
              },
              safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
              ]
            })
          },
          3
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            return NextResponse.json({
              reply: responseText,
              provider: 'gemini',
            });
          }

          // Si Gemini respondió pero sin texto (blocked por safety?)
          const blockReason = data.candidates?.[0]?.finishReason;
          if (blockReason === 'SAFETY') {
            return NextResponse.json({
              reply: '🛡️ Tu consulta fue procesada pero no pude generar una respuesta por filtros de seguridad. Reformula tu pregunta o contacta soporte en /dashboard/disputes.',
              provider: 'gemini-safety',
            });
          }
        } else {
          const errBody = await geminiRes.text();
          console.warn(`[Gemini Chat] Error ${geminiRes.status}:`, errBody);

          // Si es quota exceeded, dar un mensaje específico
          if (geminiRes.status === 429) {
            return NextResponse.json({
              reply: '⏳ El servicio de IA está procesando muchas solicitudes en este momento. Tus fondos siguen 100% seguros en el Smart Contract. Intenta de nuevo en unos segundos.',
              provider: 'rate-limited',
              retryAfter: 5,
            });
          }
        }
      } catch (geminiErr: any) {
        console.warn('[Gemini Chat] Fallback a motor local:', geminiErr.message);
      }
    }

    // ── Fallback inteligente contextual ──
    const lastMsg = (messages[messages.length - 1]?.text || '').toLowerCase();
    let reply = '¡Hola! Soy AYNI Guardian. ¿En qué puedo ayudarte? Puedo orientarte sobre encargos, custodia en Base L2, tu tarjeta Tangem o herencias cripto.';

    const rules: [RegExp, string][] = [
      [/otp|codigo|clave|contraseña|password/, '🔑 El código OTP es tu llave de liberación. **Solo** entrégalo cuando recibas tu paquete físicamente y verifiques que está en orden. Mientras no lo entregues, tus fondos permanecen 100% resguardados en el Smart Contract de Base L2.'],
      [/tangem|tarjeta|nfc|billetera|wallet/, '💳 La billetera fría Tangem protege tus fondos con chip EAL6+. Para autorizar pagos, aproxima tu tarjeta NFC al teléfono o usa WalletConnect desde la app oficial. No necesitas frases semilla.'],
      [/aduana|retención|retener|confisca/, '✈️ Tus fondos están protegidos. El Smart Contract incluye un Fondo de Garantía del 2% que reembolsa automáticamente en caso de retención aduanera. No entregues el OTP y abre una disputa.'],
      [/problema|roto|dañ|no llega|demor|perd|robo/, '🛡️ Tus fondos están 100% seguros en el Smart Contract. **No entregues el OTP** y abre una disputa en /dashboard/disputes. El equipo AYNI mediará la resolución.'],
      [/mercadillo|tienda|comprar|rastro|shopping|pie/, '🛍️ Puedes solicitar compras a pie (Foot Shopping) en cualquier mercadillo o tienda. Indica la dirección exacta, el viajero irá al lugar y subirá foto del recibo para auditoría con IA.'],
      [/herencia|sucesión|dead man|bóveda|heritage|fallec/, '🏛️ AYNI Heritage protege el patrimonio cripto de migrantes. Configura un Dead Man\'s Switch: si no emites un heartbeat en el plazo fijado, los fondos se distribuyen automáticamente a tus beneficiarios sin trámites judiciales.'],
      [/precio|costo|comisión|fee|gas/, '💰 Las transacciones en Base L2 cuestan menos de $0.01 USD en gas. AYNI cobra una comisión mínima del 2% que alimenta el Fondo de Garantía comunitario.'],
      [/disputa|queja|reclamar|denuncia/, '⚖️ Para abrir una disputa, ve a /dashboard/disputes. NO entregues el OTP mientras la disputa esté abierta. El equipo AYNI mediará entre comprador y viajero.'],
      [/hola|buenas|hey|saludos|q tal/, '¡Hola! 👋 Soy AYNI Guardian, tu asistente de soporte. Puedo ayudarte con:\n• 📦 Estado de tus pedidos\n• 🔑 Dudas sobre el código OTP\n• 💳 Billetera Tangem\n• 🏛️ Herencias cripto\n• ⚖️ Disputas\n\n¿Qué necesitas?'],
      [/gracias|thanks|thx|genial|perfecto/, '¡De nada! 🙌 Estoy aquí para proteger tus transacciones. Si necesitas algo más, no dudes en preguntar.'],
    ];

    for (const [pattern, response] of rules) {
      if (pattern.test(lastMsg)) {
        reply = response;
        break;
      }
    }

    return NextResponse.json({
      reply,
      provider: 'fallback',
    });
  } catch (err: any) {
    console.error('Error en /api/ai/chat:', err);
    return NextResponse.json({ error: 'Error procesando consulta' }, { status: 500 });
  }
}
