/**
 * AYNI PROTOCOL - PLANTILLAS DE EMAIL HTML RESPONSIVAS & ELEGANTES
 * Diseñadas con estética premium, compatibilidad para clientes de correo (Gmail, Outlook, Apple Mail)
 */

interface BaseEmailProps {
  recipientName?: string;
  actionUrl?: string;
}

const getEmailHeader = (categoryTag: string = 'NOTIFICACIÓN OFICIAL') => `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AYNI Protocol</title>
    <style>
      body { margin: 0; padding: 0; background-color: #0b132b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      table { border-collapse: collapse; }
      .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #0f172a 0%, #0369a1 100%); padding: 32px 36px; text-align: left; }
      .badge { display: inline-block; padding: 4px 12px; background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; border-radius: 20px; font-size: 11px; font-weight: 700; color: #38bdf8; letter-spacing: 0.08em; text-transform: uppercase; }
      .title { color: #ffffff; font-size: 22px; font-weight: 800; margin: 12px 0 4px 0; letter-spacing: -0.02em; }
      .subtitle { color: #94a3b8; font-size: 13px; margin: 0; }
      .content { padding: 32px 36px; color: #1e293b; font-size: 14px; line-height: 1.6; }
      .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
      .code-box { background: #0f172a; color: #38bdf8; font-family: 'Courier New', monospace; font-size: 28px; font-weight: 800; text-align: center; letter-spacing: 0.25em; padding: 16px; border-radius: 10px; margin: 16px 0; }
      .button { display: inline-block; background: #0284c7; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; margin-top: 12px; }
      .footer { background-color: #f1f5f9; padding: 24px 36px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
    </style>
  </head>
  <body style="background-color: #0b132b; padding: 30px 10px;">
    <div class="container">
      <div class="header">
        <div class="badge">${categoryTag}</div>
        <div class="title">AYNI PROTOCOL</div>
        <div class="subtitle">Ecosistema Global de Custodia Escrow, Crowdshipping y Herencias Cripto</div>
      </div>
      <div class="content">
`;

const getEmailFooter = () => `
      </div>
      <div class="footer">
        <p style="margin: 0 0 6px 0; font-weight: 600; color: #334155;">AYNI Protocol · Seguridad Criptográfica Base L2 & Stellar</p>
        <p style="margin: 0;">Este es un mensaje automático de seguridad. Si no reconoces esta transacción, ingresa al portal y activa el bloqueo de emergencia.</p>
      </div>
    </div>
  </body>
  </html>
`;

/**
 * 1. Plantilla: Código OTP de Entrega de Producto (Ultra confidencial)
 */
export function getOtpDeliveryEmail(props: {
  recipientName: string;
  orderCode: string;
  otpCode: string;
  productTitle: string;
  travelerName: string;
  escrowAmountUsd: number;
}): { subject: string; html: string; text: string } {
  const subject = `🔑 [OTP CONFIDENCIAL] Código de Liberación para Orden #${props.orderCode}`;
  
  const html = `
    ${getEmailHeader('CUSTODIA ESCROW · ENTREGA SEGURA')}
    <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">¡Tu producto está listo para entrega!</h2>
    <p>Hola <strong>${props.recipientName}</strong>,</p>
    <p>El viajero <strong>${props.travelerName}</strong> ha llegado a destino y está listo para entregarte tu paquete: <strong>${props.productTitle}</strong>.</p>
    
    <div class="card" style="border-left: 4px solid #f59e0b;">
      <div style="font-size: 12px; color: #b45309; font-weight: 700; text-transform: uppercase;">⚠️ REGLA DE ORO DE SEGURIDAD AYNI</div>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #78350f;">
        <strong>NO le des este código al viajero</strong> hasta que tengas el producto en tus manos y hayas verificado que se encuentra en perfecto estado. Proporcionar este código libera los <strong>$${props.escrowAmountUsd.toFixed(2)} USDC</strong> de la custodia irreversiblemente.
      </p>
    </div>

    <p style="text-align: center; margin-bottom: 6px; font-weight: 600; color: #475569;">TU CÓDIGO SECRETO DE LIBERACIÓN:</p>
    <div class="code-box">${props.otpCode}</div>

    <table style="width: 100%; font-size: 13px; margin-top: 14px;">
      <tr>
        <td style="color: #64748b; padding: 4px 0;">Código de Orden:</td>
        <td style="text-align: right; font-weight: 700; color: #0f172a;">${props.orderCode}</td>
      </tr>
      <tr>
        <td style="color: #64748b; padding: 4px 0;">Monto en Custodia:</td>
        <td style="text-align: right; font-weight: 700; color: #059669;">$${props.escrowAmountUsd.toFixed(2)} USDC</td>
      </tr>
    </table>
    ${getEmailFooter()}
  `;

  const text = `AYNI PROTOCOL - CÓDIGO OTP DE ENTREGA
Orden: ${props.orderCode}
Producto: ${props.productTitle}
Viajero: ${props.travelerName}
Monto Escrow: $${props.escrowAmountUsd.toFixed(2)} USDC

TU CÓDIGO OTP ES: ${props.otpCode}

IMPORTANTE: No entregues este código hasta tener el producto físico en tus manos.`;

  return { subject, html, text };
}

/**
 * 2. Plantilla: Nueva Orden Creada & Fondos en Custodia
 */
export function getNewOrderEmail(props: {
  recipientName: string;
  orderCode: string;
  productTitle: string;
  totalAmountUsd: number;
  routeText: string;
  dashboardUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `📦 Orden #${props.orderCode} Confirmada — Fondos Asegurados en Escrow`;

  const html = `
    ${getEmailHeader('NUEVA ORDEN ASEGURADA')}
    <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Depósito en Custodia Confirmado</h2>
    <p>Hola <strong>${props.recipientName}</strong>,</p>
    <p>Tu orden ha sido registrada exitosamente en el protocolo AYNI. Los fondos se encuentran asegurados mediante el Smart Contract de custodia.</p>
    
    <div class="card">
      <div style="font-size: 11px; color: #0284c7; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">Detalles de la Transacción</div>
      <table style="width: 100%; font-size: 13px;">
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Producto:</td>
          <td style="text-align: right; font-weight: 700; color: #0f172a;">${props.productTitle}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Ruta de Envío:</td>
          <td style="text-align: right; font-weight: 600; color: #0f172a;">${props.routeText}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Monto Total Escrow:</td>
          <td style="text-align: right; font-weight: 800; color: #059669; font-size: 15px;">$${props.totalAmountUsd.toFixed(2)} USDC</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${props.dashboardUrl}" class="button">Ver Estado en el Dashboard</a>
    </div>
    ${getEmailFooter()}
  `;

  const text = `AYNI PROTOCOL - ORDEN CONFIRMADA
Orden #${props.orderCode}
Producto: ${props.productTitle}
Ruta: ${props.routeText}
Total Escrow: $${props.totalAmountUsd.toFixed(2)} USDC
Ver en: ${props.dashboardUrl}`;

  return { subject, html, text };
}

/**
 * 3. Plantilla: Alerta de Dead Man's Switch (Bóveda de Herencias)
 */
export function getHeritageHeartbeatEmail(props: {
  ownerName: string;
  vaultName: string;
  daysRemaining: number;
  totalStakedUsd: number;
  checkInUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `⚠️ [URGENTE] Verificación de Vida requerida para tu Bóveda AYNI (${props.daysRemaining} días restantes)`;

  const html = `
    ${getEmailHeader('DEAD MAN\'S SWITCH · PROTOCOLO HERENCIAS')}
    <h2 style="color: #b91c1c; margin-top: 0; font-size: 18px;">Confirmación de Pulso de Vida Requerida</h2>
    <p>Hola <strong>${props.ownerName}</strong>,</p>
    <p>El Smart Contract de tu bóveda <strong>"${props.vaultName}"</strong> ha detectado inactividad reciente. Restan exactamente <strong>${props.daysRemaining} días</strong> antes de que se considere un evento de sucesión y se proceda con la distribución automática a tus beneficiarios.</p>
    
    <div class="card" style="border-left: 4px solid #ef4444; background: #fff5f5;">
      <table style="width: 100%; font-size: 13px;">
        <tr>
          <td style="color: #7f1d1d; padding: 4px 0;">Patrimonio en Bóveda:</td>
          <td style="text-align: right; font-weight: 800; color: #991b1b; font-size: 15px;">$${props.totalStakedUsd.toLocaleString()} USDC</td>
        </tr>
        <tr>
          <td style="color: #7f1d1d; padding: 4px 0;">Plazo Máximo:</td>
          <td style="text-align: right; font-weight: 700; color: #b91c1c;">${props.daysRemaining} días</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #475569;">Para renovar el temporizador por otro ciclo completo, simplemente ingresa al sistema y firma un nuevo pulso (Heartbeat) con tu wallet o clave de acceso.</p>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${props.checkInUrl}" class="button" style="background: #dc2626;">Confirmar Pulso de Vida Ahora</a>
    </div>
    ${getEmailFooter()}
  `;

  const text = `AYNI PROTOCOL - ALERTA DE HERENCIA CRIPTO
Bóveda: ${props.vaultName}
Patrimonio: $${props.totalStakedUsd} USDC
Días restantes antes de sucesión: ${props.daysRemaining} días

Renueva tu pulso de vida en: ${props.checkInUrl}`;

  return { subject, html, text };
}

/**
 * 4. Plantilla: Notificación Genérica del Sistema
 */
export function getSystemNotificationEmail(props: {
  recipientName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}): { subject: string; html: string; text: string } {
  const subject = `🔔 AYNI Protocol: ${props.title}`;

  const html = `
    ${getEmailHeader('ACTUALIZACIÓN DE CUENTA')}
    <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">${props.title}</h2>
    <p>Hola <strong>${props.recipientName}</strong>,</p>
    <div class="card">
      <p style="margin: 0; font-size: 13.5px; color: #334155;">${props.message}</p>
    </div>
    ${props.actionUrl ? `
      <div style="text-align: center; margin-top: 20px;">
        <a href="${props.actionUrl}" class="button">${props.actionText || 'Ver en la Plataforma'}</a>
      </div>
    ` : ''}
    ${getEmailFooter()}
  `;

  const text = `AYNI PROTOCOL\n\n${props.title}\n${props.message}\n${props.actionUrl ? props.actionUrl : ''}`;

  return { subject, html, text };
}
