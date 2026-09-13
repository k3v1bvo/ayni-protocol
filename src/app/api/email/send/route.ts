import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, isSmtpConfigured, verifySmtpConnection } from '@/lib/email/mailer';
import {
  getOtpDeliveryEmail,
  getNewOrderEmail,
  getHeritageHeartbeatEmail,
  getSystemNotificationEmail,
  getWelcomeEmail,
  getPasswordResetEmail,
  getDisputeVerdictEmail,
  getPayoutReleasedEmail,
  getRemittanceLockedEmail,
  getTwoFactorCodeEmail,
} from '@/lib/email/templates';

/**
 * GET /api/email/send
 * Verifica el estado y conexión en vivo con Google SMTP
 */
export async function GET() {
  try {
    const configured = isSmtpConfigured();
    if (!configured) {
      return NextResponse.json({
        configured: false,
        status: 'simulated',
        message: 'Modo simulación activo. Para envíos reales, agrega SMTP_USER y SMTP_PASS en .env.local',
      });
    }

    const test = await verifySmtpConnection();
    return NextResponse.json({
      configured: true,
      connected: test.connected,
      message: test.message,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/email/send
 * Envío de correos transaccionales
 * 
 * Body:
 * {
 *   to: string,
 *   type: 'otp' | 'new_order' | 'heritage' | 'notification' | 'custom',
 *   data: { ...params según tipo }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, type = 'notification', data = {} } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'El campo "to" (correo de destino) es obligatorio.' },
        { status: 400 }
      );
    }

    let emailContent: { subject: string; html: string; text: string };

    switch (type) {
      case 'otp':
      case 'otp_delivery': {
        const {
          recipientName = 'Usuario AYNI',
          orderCode = 'AY-8492',
          otpCode = '000000',
          productTitle = 'Producto en Custodia',
          travelerName = 'Viajero Certificado',
          escrowAmountUsd = 0,
        } = data;

        emailContent = getOtpDeliveryEmail({
          recipientName,
          orderCode,
          otpCode,
          productTitle,
          travelerName,
          escrowAmountUsd: Number(escrowAmountUsd),
        });
        break;
      }

      case 'new_order':
      case 'order': {
        const {
          recipientName = 'Usuario AYNI',
          orderCode = 'AY-8492',
          productTitle = 'Producto Internacional',
          totalAmountUsd = 0,
          routeText = 'Origen ➔ Destino',
          dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/orders`,
        } = data;

        emailContent = getNewOrderEmail({
          recipientName,
          orderCode,
          productTitle,
          totalAmountUsd: Number(totalAmountUsd),
          routeText,
          dashboardUrl,
        });
        break;
      }

      case 'heritage':
      case 'dead_man_switch': {
        const {
          ownerName = 'Titular de Bóveda',
          vaultName = 'Bóveda Familiar Principal',
          daysRemaining = 15,
          totalStakedUsd = 0,
          checkInUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/heritage`,
        } = data;

        emailContent = getHeritageHeartbeatEmail({
          ownerName,
          vaultName,
          daysRemaining: Number(daysRemaining),
          totalStakedUsd: Number(totalStakedUsd),
          checkInUrl,
        });
        break;
      }

      case 'welcome':
      case 'register': {
        const {
          recipientName = 'Usuario AYNI',
          email = to,
          role = 'client',
          loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ayni-protocol.vercel.app'}/login`,
        } = data;

        emailContent = getWelcomeEmail({
          recipientName,
          email,
          role,
          loginUrl,
        });
        break;
      }

      case 'reset_password':
      case 'recovery': {
        const {
          recipientName = 'Usuario AYNI',
          resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ayni-protocol.vercel.app'}/reset-password`,
        } = data;

        emailContent = getPasswordResetEmail({
          recipientName,
          resetUrl,
        });
        break;
      }

      case 'dispute':
      case 'dispute_verdict': {
        const {
          recipientName = 'Usuario AYNI',
          orderCode = 'AY-8492',
          verdict = 'REEMBOLSO_COMPLETO',
          rationale = 'Dictamen arbitral emitido conforme.',
          refundAmountUsd = 0,
          travelerAmountUsd = 0,
          disputeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ayni-protocol.vercel.app'}/dashboard/disputes`,
        } = data;

        emailContent = getDisputeVerdictEmail({
          recipientName,
          orderCode,
          verdict,
          rationale,
          refundAmountUsd: Number(refundAmountUsd),
          travelerAmountUsd: Number(travelerAmountUsd),
          disputeUrl,
        });
        break;
      }

      case 'payout':
      case 'payout_released': {
        const {
          travelerName = 'Viajero Certificado',
          orderCode = 'AY-8492',
          productTitle = 'Encargo',
          payoutAmountUsd = 0,
          txHash = '0x0000000000000000000000000000000000000000',
        } = data;

        emailContent = getPayoutReleasedEmail({
          travelerName,
          orderCode,
          productTitle,
          payoutAmountUsd: Number(payoutAmountUsd),
          txHash,
        });
        break;
      }

      case 'remittance': {
        const {
          recipientName = 'Beneficiario',
          senderName = 'Familiar AYNI',
          amountUsd = 100,
          occasion = 'Apoyo familiar',
          releaseDateText = 'Inmediato',
          claimUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ayni-protocol.vercel.app'}/dashboard/remesas`,
        } = data;

        emailContent = getRemittanceLockedEmail({
          recipientName,
          senderName,
          amountUsd: Number(amountUsd),
          occasion,
          releaseDateText,
          claimUrl,
        });
        break;
      }

      case 'two_factor':
      case '2fa': {
        const {
          recipientName = 'Usuario AYNI',
          code = '849201',
          purpose = 'verificación de seguridad 2FA',
          expiresInMinutes = 10,
        } = data;

        emailContent = getTwoFactorCodeEmail({
          recipientName,
          code: String(code),
          purpose,
          expiresInMinutes: Number(expiresInMinutes),
        });
        break;
      }

      case 'custom': {
        const { subject, html, text } = data;
        if (!subject || !html) {
          return NextResponse.json(
            { error: 'Para tipo custom, "subject" y "html" son obligatorios.' },
            { status: 400 }
          );
        }
        emailContent = { subject, html, text: text || '' };
        break;
      }

      case 'notification':
      default: {
        const {
          recipientName = 'Usuario AYNI',
          title = 'Actualización de tu cuenta',
          message = 'Tienes una nueva actualización en la plataforma AYNI.',
          actionUrl,
          actionText,
        } = data;

        emailContent = getSystemNotificationEmail({
          recipientName,
          title,
          message,
          actionUrl,
          actionText,
        });
        break;
      }
    }

    const result = await sendEmail({
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Fallo al enviar correo electrónico' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      simulated: result.simulated ?? false,
      messageId: result.messageId,
      recipient: to,
      type,
    });
  } catch (err: any) {
    console.error('[API /api/email/send error]:', err);
    return NextResponse.json(
      { error: err.message || 'Error interno del servidor de correo' },
      { status: 500 }
    );
  }
}
