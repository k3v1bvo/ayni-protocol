import { NextRequest, NextResponse } from 'next/server';
import { verify2FACode } from '@/lib/auth/twoFactorStore';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/2fa/verify
 * 
 * Valida el código 2FA ingresado por el usuario con protección anti-fuerza bruta.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json({ error: 'Faltan campos obligatorios: email y código son requeridos.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const result = verify2FACode(cleanEmail, String(code));

    if (!result.valid) {
      return NextResponse.json({ error: result.error || 'Código inválido o expirado.' }, { status: 400 });
    }

    // Opcional: Registrar evento de seguridad en notifications
    try {
      const supabase = getSupabaseServerClient();
      const { data: profile } = await supabase.from('profiles').select('id').eq('email', cleanEmail).single();
      if (profile?.id) {
        await supabase.from('notifications').insert({
          user_id: profile.id,
          type: 'system',
          title: '🛡️ Verificación 2FA Exitosa',
          body: 'Has confirmado tu identidad mediante el Doble Factor de Autenticación (2FA).',
        });
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'Segundo factor de autenticación verificado exitosamente.',
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[2FA Verify Error]:', err);
    return NextResponse.json({ error: 'Error del servidor validando 2FA.' }, { status: 500 });
  }
}
