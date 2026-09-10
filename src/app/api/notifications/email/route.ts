import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, type, data } = body;

    if (!to || !subject) {
      return NextResponse.json({ error: 'Missing to or subject' }, { status: 400 });
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // Generar plantilla HTML según tipo de notificación
    let htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #050810; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
        <div style="background: linear-gradient(135deg, #00cfff22, #00d68f22); padding: 24px; border-bottom: 1px solid #1e293b;">
          <h1 style="color: #00cfff; font-size: 22px; margin: 0; font-weight: 800; letter-spacing: 1px;">AYNI PROTOCOL</h1>
          <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Ecosistema Descentralizado de Comercio Seguro & Escrow</p>
        </div>
        <div style="padding: 24px;">
    `;

    if (type === 'order_funded') {
      htmlContent += `
        <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">¡Pago Asegurado en Escrow!</h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
          Tus fondos para el pedido <strong>#${data?.orderCode || 'ORD-2609'}</strong> están salvaguardados en el Smart Contract en Base L2.
        </p>
        <div style="background: #0f172a; border: 2px dashed #00cfff; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0;">
          <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Tu Código OTP de Entrega</div>
          <div style="font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #00cfff; font-family: monospace; margin: 8px 0;">
            ${data?.otp || '774411'}
          </div>
          <div style="color: #f5a623; font-size: 12px;">⚠️ Importante: Solo entrega este código al recibir físicamente tu producto.</div>
        </div>
        <div style="font-size: 13px; color: #94a3b8;">
          Monto en custodia: <strong>$${data?.amount || '0.00'} USDC</strong>
        </div>
      `;
    } else if (type === 'heritage_alert') {
      htmlContent += `
        <h2 style="color: #ef4444; font-size: 18px; margin-top: 0;">Alerta de Presencia — AYNI Heritage</h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
          Este es un recordatorio del Smart Contract Dead Man's Switch para tu bóveda de herencia en Base L2.
        </p>
        <div style="background: #0f172a; border: 1px solid #ef4444; border-radius: 12px; padding: 16px; margin: 18px 0;">
          <div style="color: #ef4444; font-weight: 700; font-size: 14px;">Plazo restante: ${data?.daysRemaining || 30} días</div>
          <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">
            Por favor ingresa a la plataforma y confirma que sigues activo para reiniciar el temporizador.
          </p>
        </div>
      `;
    } else {
      htmlContent += `
        <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">${subject}</h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
          ${data?.message || 'Tienes una nueva actualización en tu cuenta de AYNI Protocol.'}
        </p>
      `;
    }

    htmlContent += `
        </div>
        <div style="background: #030712; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b;">
          AYNI Protocol • Buildathon ETH Bolivia 2026 • Base L2
        </div>
      </div>
    `;

    // Si existen credenciales reales de Google SMTP, enviar por nodemailer
    if (smtpUser && smtpPassword) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });

      await transporter.sendMail({
        from: `"AYNI Protocol" <${smtpUser}>`,
        to,
        subject,
        html: htmlContent,
      });

      return NextResponse.json({ success: true, delivered: true });
    }

    // Fallback: modo simulación si no se configuraron credenciales
    console.log(`[SMTP SIMULATED] Correo preparado para: ${to} | Asunto: ${subject}`);
    return NextResponse.json({
      success: true,
      delivered: false,
      simulated: true,
      notice: 'Correo simulado con éxito. Para envío real de Gmail, configure SMTP_USER y SMTP_PASSWORD en las variables de entorno.',
    });
  } catch (error: any) {
    console.error('Error enviando email SMTP:', error);
    return NextResponse.json({ error: error.message || 'Error en servidor de correos' }, { status: 500 });
  }
}
