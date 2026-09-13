import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/mailer';
import { getPasswordResetEmail } from '@/lib/email/templates';

/**
 * POST /api/auth/reset-password
 * 
 * Genera enlace de restablecimiento seguro vía Supabase Admin
 * y lo envía por nuestro servidor SMTP Google Gmail para evitar
 * el límite de 3 correos/hora de Supabase Auth.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ingresa un correo electrónico válido.' }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const supabaseAdmin = getSupabaseServerClient();

    // 1. Generar enlace criptográfico de recuperación sin enviar email con Supabase
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ayni-protocol.vercel.app';
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: cleanEmail,
      options: {
        redirectTo: `${appUrl}/reset-password`,
      },
    });

    if (error) {
      console.warn('[Reset Password API] Error generando enlace:', error.message);
      // Por seguridad estándar, no revelar si el correo existe o no
      return NextResponse.json({
        success: true,
        message: 'Si el correo está registrado, recibirás un enlace de restablecimiento en breve.',
      });
    }

    const actionLink = data?.properties?.action_link;

    // 2. Obtener el nombre del perfil
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('email', cleanEmail)
      .single();

    const recipientName = profile?.full_name || cleanEmail.split('@')[0];

    // 3. Enviar correo usando nuestro propio Google SMTP
    if (actionLink) {
      const resetTemplate = getPasswordResetEmail({
        recipientName,
        resetUrl: actionLink,
      });

      await sendEmail({
        to: cleanEmail,
        subject: resetTemplate.subject,
        html: resetTemplate.html,
        text: resetTemplate.text,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Si el correo está registrado, recibirás un enlace de restablecimiento en breve.',
    });
  } catch (err: any) {
    console.error('[Reset Password API Error]:', err);
    return NextResponse.json({ error: 'Error procesando solicitud de recuperación.' }, { status: 500 });
  }
}
