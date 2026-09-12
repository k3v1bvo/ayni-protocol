import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Valida si las credenciales de Google SMTP están presentes en las variables de entorno
 */
export function isSmtpConfigured(): boolean {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return Boolean(user && pass && user !== 'tu-correo@gmail.com' && pass !== 'xxxx xxxx xxxx xxxx');
}

/**
 * Obtiene el transporte de Nodemailer configurado para Google SMTP / Gmail
 */
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    // Compatibilidad TLS
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
}

/**
 * Enviar un correo electrónico a través de Google SMTP
 * Si las credenciales no están configuradas, opera en modo de simulación segura (no rompe el flujo)
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: SendEmailParams): Promise<SendEmailResult> {
  const defaultFrom = process.env.SMTP_FROM || `"AYNI Protocol" <${process.env.SMTP_USER || 'notificaciones@ayni.app'}>`;
  const sender = from || defaultFrom;

  // Validación básica del correo destino
  if (!to || !to.includes('@')) {
    return {
      success: false,
      error: `Dirección de correo inválida: "${to}"`,
    };
  }

  // 1. Si SMTP no está configurado en .env.local -> Modo Simulación
  if (!isSmtpConfigured()) {
    console.log(`[AYNI SMTP SIMULADOR] Correo simulado para <${to}>: "${subject}"`);
    return {
      success: true,
      simulated: true,
      messageId: `sim-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
  }

  // 2. Si SMTP está configurado -> Envío real con Google SMTP
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: sender,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''), // fallback texto plano
      html,
    });

    console.log(`[AYNI SMTP REAL] Correo enviado a <${to}> [ID: ${info.messageId}]`);
    return {
      success: true,
      simulated: false,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('[AYNI SMTP ERROR] Error al despachar correo vía Nodemailer:', error);
    return {
      success: false,
      error: error?.message || 'Error desconocido al enviar correo vía Google SMTP',
    };
  }
}

/**
 * Diagnóstico de conexión en vivo con los servidores de Google SMTP
 */
export async function verifySmtpConnection(): Promise<{ connected: boolean; message: string }> {
  if (!isSmtpConfigured()) {
    return {
      connected: false,
      message: 'SMTP no configurado en .env.local. Faltan SMTP_USER y SMTP_PASS (Contraseña de aplicación de Google).',
    };
  }

  try {
    const transporter = getTransporter();
    await transporter.verify();
    return {
      connected: true,
      message: `Conexión exitosa con Google SMTP (${process.env.SMTP_USER}).`,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Fallo de autenticación con Google SMTP: ${err?.message}`,
    };
  }
}
