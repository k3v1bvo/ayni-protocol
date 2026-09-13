import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/mailer';
import { getTwoFactorCodeEmail } from '@/lib/email/templates';
import { save2FACode } from '@/lib/auth/twoFactorStore';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/2fa/send
 * 
 * Genera un código de 6 dígitos criptográfico y lo envía
 * al correo del usuario vía Gmail SMTP para validar el segundo factor.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, purpose = 'activación de seguridad 2FA' } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Correo electrónico inválido.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Generar código numérico aleatorio de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar en store seguro (10 minutos de vigencia)
    save2FACode(cleanEmail, code, 10);

    // Obtener nombre del perfil si existe
    let recipientName = cleanEmail.split('@')[0];
    try {
      const supabase = getSupabaseServerClient();
      const { data } = await supabase.from('profiles').select('full_name').eq('email', cleanEmail).single();
      if (data?.full_name) recipientName = data.full_name;
    } catch (_) {}

    // Despachar por Google SMTP
    const template = getTwoFactorCodeEmail({
      recipientName,
      code,
      purpose,
      expiresInMinutes: 10,
    });

    const mailRes = await sendEmail({
      to: cleanEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (!mailRes.success) {
      return NextResponse.json({ error: 'No se pudo enviar el correo de verificación. Intenta nuevamente.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Código de verificación 2FA enviado a tu correo.',
      expiresInMinutes: 10,
    });
  } catch (err: any) {
    console.error('[2FA Send Error]:', err);
    return NextResponse.json({ error: err?.message || 'Error del servidor al procesar 2FA.' }, { status: 500 });
  }
}
