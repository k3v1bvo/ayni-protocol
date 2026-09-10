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

    allowed['updated_at'] = new Date().toISOString();

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('profiles')
      .update(allowed)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ profile: data });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
