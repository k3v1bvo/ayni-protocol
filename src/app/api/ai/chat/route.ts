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

REGLAS DE COMPORTAMIENTO Y SEGURIDAD ESTRICTAS:
- Mantén siempre un tono profesional, protector, claro y empático.
- Si un usuario reporta un problema urgente ("el viajero no llega", "el producto vino roto"): indícale calmadamente que SUS FONDOS ESTÁN SEGUROS en el contrato, que NO dé el OTP y que acuda a la sección de Disputas (/dashboard/disputes).
- NUNCA te salgas del contexto de AYNI Protocol. Si te preguntan sobre temas no relacionados (política, cocina, código de otras cosas, criptomonedas especulativas externas), responde amablemente: "Como asistente oficial de AYNI Protocol, solo puedo orientarte sobre compras, viajes, custodia en Base L2, billeteras Tangem y protección patrimonial."
- Respuestas concisas (máximo 2 a 3 párrafos cortos) con viñetas cuando sea necesario.`;

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
        // Preparar partes del último mensaje (soporte multimodal con fotos de ImgBB)
        const lastUserText = messages[messages.length - 1]?.text || 'Hola';
        const contextHeader = `[CONTEXTO SESIÓN AYNI]: Rol activo: ${userRole || 'Cliente'}. Pedido: ${currentOrderCode || 'General'}.\n\n`;

        const userParts: any[] = [
          { text: contextHeader + lastUserText }
        ];

        // Si el usuario envió una imagen desde ImgBB, descargarla y adjuntarla como inlineData
        if (imageUrl) {
          try {
            const imgRes = await fetch(imageUrl);
            if (imgRes.ok) {
              const arrayBuffer = await imgRes.arrayBuffer();
              const mimeType = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0];
              const base64Data = Buffer.from(arrayBuffer).toString('base64');
              userParts.push({
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: base64Data,
                }
              });
              userParts.push({
                text: `\n[INSTRUCCIÓN MULTIMODAL PERICIAL]:
El usuario ha adjuntado una fotografía (alojada en ImgBB: ${imageUrl}).
Inspecciónala con máxima precisión pericial de AYNI Protocol:
1. SI ES UN COMPROBANTE/BOLETA/RECIBO DE PAGO: Extrae todo el texto completo legible (OCR), comercio emisor, fecha, ítems detallados y monto exacto. Certifica si el texto y los datos están completos y conformes.
2. SI ES UN PRODUCTO FÍSICO O PAQUETE: Detecta exactamente qué producto es (marca, modelo específico, color, empaque, condición física) y verifica si coincide con lo que el usuario afirma o encargó.
3. Evalúa si el artículo cumple con las normas de transporte aéreo internacional (IATA) y si es seguro para crowdshipping.
Estructura tu respuesta con iconos claros (📦 Producto Detectado, 🧾 Lectura OCR / Monto, 🛡️ Dictamen AYNI).`
              });
            }
          } catch (imgErr) {
            console.warn('[Gemini Chat API] Error procesando imagen multimodal:', imgErr);
          }
        }

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': geminiApiKey,
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }]
            },
            contents: [
              { role: 'user', parts: userParts }
            ],
            generationConfig: {
              temperature: 0.25, // Baja temperatura para precisión pericial y apego estricto
              maxOutputTokens: 800,
            }
          })
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            return NextResponse.json({
              reply: responseText,
              provider: 'Google Gemini 1.5 Flash Vision Multimodal',
            });
          }
        } else {
          console.warn('[Gemini Chat API] Error respuesta Gemini:', await geminiRes.text());
        }
      } catch (geminiErr) {
        console.warn('[Gemini Chat API] Fallback a motor de soporte local:', geminiErr);
      }
    }

    // Fallback inteligente contextual si no hay conexión a Gemini
    const lastMsg = (messages[messages.length - 1]?.text || '').toLowerCase();
    let reply = 'Hola. Soy el asistente de AYNI Protocol. ¿En qué puedo ayudarte con tu encargo, custodia en Base L2 o tarjeta Tangem?';

    if (lastMsg.includes('otp') || lastMsg.includes('codigo') || lastMsg.includes('clave')) {
      reply = 'El código OTP es tu llave de liberación. Solo debes entregarlo al viajero en el momento exacto en que recibas tu paquete físicamente y revises su estado. Mientras no lo entregues, tus fondos permanecen 100% resguardados en el Smart Contract.';
    } else if (lastMsg.includes('tangem') || lastMsg.includes('tarjeta') || lastMsg.includes('nfc')) {
      reply = 'La billetera fría Tangem protege tus fondos mediante un chip EAL6+. Para autorizar el pago, simplemente aproxima tu tarjeta física NFC al teléfono o usa la aplicación móvil oficial de Tangem con el enlace WalletConnect.';
    } else if (lastMsg.includes('aduana') || lastMsg.includes('problema') || lastMsg.includes('demor') || lastMsg.includes('perd')) {
      reply = 'No te preocupes. Tus fondos no se pueden perder porque están protegidos en el Smart Contract en Base L2. Además, contamos con el Fondo Comunitario de Protección ante aduanas. Si surge algún imprevisto, no entregues el OTP y abre una disputa en /dashboard/disputes.';
    } else if (lastMsg.includes('mercadillo') || lastMsg.includes('tienda') || lastMsg.includes('comprar')) {
      reply = 'Puedes solicitar compras a pie (Foot Shopping) en cualquier mercadillo o tienda específica (ej: El Rastro en Madrid o mercados locales). Indica la dirección y sube una foto de referencia: el viajero acudirá al lugar y subirá el recibo auditado por IA.';
    }

    return NextResponse.json({
      reply,
      provider: 'AYNI Guardian Rule Engine (Fallback)',
    });
  } catch (err: any) {
    console.error('Error en /api/ai/chat:', err);
    return NextResponse.json({ error: 'Error procesando consulta de soporte' }, { status: 500 });
  }
}
