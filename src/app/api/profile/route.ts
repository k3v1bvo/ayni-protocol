import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/profile?id=<user_id>
 * Fetch a user profile by ID.
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('id');
  if (!userId) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ profile: data });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/profile
 * Crea el perfil si aun no existe (ej. primer login con Google OAuth donde
 * el trigger de auth.users -> profiles no se disparo). No pisa una fila
 * existente.
 * Body: { id, email, full_name, role, avatar_url }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, full_name, role, avatar_url } = body;

    if (!id || !email) {
      return NextResponse.json({ error: 'Missing id or email' }, { status: 400 });
    }

    const validRole = ['client', 'traveler', 'merchant', 'admin'].includes(role) ? role : 'client';
    const supabase = getSupabaseServerClient();

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id,
        email: String(email).toLowerCase().trim(),
        full_name: full_name ? String(full_name).trim().slice(0, 150) : null,
        role: validRole,
        reputation_score: 5.0,
        guarantee_balance: 0.0,
        avatar_url: avatar_url || null,
      }, { onConflict: 'id', ignoreDuplicates: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    return NextResponse.json({ profile: data });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PUT /api/profile
 * Update user profile fields.
 * Body: { id, full_name, phone, country, wallet_address, avatar_url, whatsapp, linkedin, bio, city }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    // Sanitize allowed fields
    const allowed: Record<string, unknown> = {};
    const textFields = ['full_name', 'phone', 'country', 'wallet_address', 'avatar_url', 'whatsapp', 'linkedin', 'bio', 'city'];
    for (const key of textFields) {
      if (fields[key] !== undefined) {
        const val = String(fields[key]).replace(/[<>]/g, '').trim().slice(0, 500);
        allowed[key] = val || null;
      }
    }
    if (fields.role && ['client', 'traveler', 'merchant', 'admin'].includes(fields.role)) {
      allowed.role = fields.role;
    }

    allowed['updated_at'] = new Date().toISOString();

    const supabase = getSupabaseServerClient();
    let { data, error } = await supabase
      .from('profiles')
      .update(allowed)
      .eq('id', id)
      .select()
      .single();

    // Fallback defensivo si columnas opcionales (whatsapp, city, bio, linkedin) no existen aún en la BD
    if (error && error.message?.includes('does not exist')) {
      const coreOnly: Record<string, unknown> = {};
      const coreFields = ['full_name', 'phone', 'country', 'wallet_address', 'avatar_url'];
      for (const k of coreFields) {
        if (allowed[k] !== undefined) coreOnly[k] = allowed[k];
      }
      coreOnly['updated_at'] = new Date().toISOString();

      const retryRes = await supabase
        .from('profiles')
        .update(coreOnly)
        .eq('id', id)
        .select()
        .single();

      data = retryRes.data;
      error = retryRes.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ profile: data });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
