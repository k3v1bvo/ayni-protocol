import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/mailer';
import { getWelcomeEmail } from '@/lib/email/templates';

/**
 * POST /api/auth/register
 * 
 * Registro seguro en Supabase con auto-confirmación (email_confirm: true)
 * para EVITAR el rate limit de 3-4 correos/hora del tier gratuito de Supabase.
 * El envío del correo de bienvenida se gestiona directamente a través de
 * nuestro propio servidor SMTP de Google Gmail (ayniprotocol@gmail.com).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, role = 'client' } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: email, password y fullName son requeridos.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanName = String(fullName).trim().slice(0, 150);
    const validRole = ['client', 'traveler', 'merchant', 'admin'].includes(role) ? role : 'client';

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseServerClient();

    // 1. Crear el usuario en auth.users con email_confirm: true (Sin pasar por el SMTP limitado de Supabase)
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true, // Cuenta activada inmediatamente
      user_metadata: {
        full_name: cleanName,
        role: validRole,
      },
    });

    if (createError) {
      // Si el usuario ya existe
      if (createError.message?.toLowerCase().includes('already') || createError.status === 422) {
        return NextResponse.json(
          { error: 'El correo electrónico ya está registrado. Por favor inicia sesión.', code: 'USER_EXISTS' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: `Error creando usuario en Supabase: ${createError.message}` },
        { status: 400 }
      );
    }

    const userId = createData.user.id;

    // 2. Crear o actualizar perfil en public.profiles
    const profilePayload: Record<string, unknown> = {
      id: userId,
      email: cleanEmail,
      full_name: cleanName,
      role: validRole,
      reputation_score: 5.0,
      guarantee_balance: validRole === 'traveler' ? 50.0 : 0.0,
      country: 'Bolivia',
      verified_id: true,
      updated_at: new Date().toISOString(),
    };

    await supabaseAdmin.from('profiles').upsert(profilePayload);

    // 3. Crear espejo en public.users
    try {
      await supabaseAdmin.from('users').upsert({
        id: userId,
        email: cleanEmail,
        full_name: cleanName,
        role: validRole,
        reputation_score: 5.0,
        guarantee_balance: validRole === 'traveler' ? 50.0 : 0.0,
      });
    } catch (_) {}

    // 4. Crear notificación interna de bienvenida
    try {
      await supabaseAdmin.from('notifications').insert({
        user_id: userId,
        type: 'system',
        title: '¡Bienvenido a AYNI Protocol!',
        body: `Tu cuenta ha sido activada exitosamente con el rol de ${validRole}. Tus compras y envíos están resguardados por Smart Contracts Escrow.`,
      });
    } catch (_) {}

    // 5. Enviar correo de bienvenida a través de nuestro propio SMTP de Gmail (Cero fricción, sin rate limits)
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ayni-protocol.vercel.app';
      const welcomeTemplate = getWelcomeEmail({
        recipientName: cleanName,
        email: cleanEmail,
        role: validRole,
        loginUrl: `${appUrl}/auth?mode=signin`,
      });

      await sendEmail({
        to: cleanEmail,
        subject: welcomeTemplate.subject,
        html: welcomeTemplate.html,
        text: welcomeTemplate.text,
      });
    } catch (mailErr) {
      console.warn('[Register API] Error enviando correo de bienvenida:', mailErr);
      // No bloqueamos el registro si el correo fallara
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado y activado exitosamente.',
      user: {
        id: userId,
        email: cleanEmail,
        full_name: cleanName,
        role: validRole,
      },
    });
  } catch (err: any) {
    console.error('[Register API Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Error interno del servidor al procesar el registro.' },
      { status: 500 }
    );
  }
}
