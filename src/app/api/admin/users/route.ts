import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/users?search=...&role=...&limit=...&offset=...
 * Admin-only: List all users with filtering.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const params = req.nextUrl.searchParams;
    const search = params.get('search');
    const role = params.get('role');
    const limit = parseInt(params.get('limit') || '50', 10);
    const offset = parseInt(params.get('offset') || '0', 10);

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (role && role !== 'all') query = query.eq('role', role);
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ users: data || [], total: count || 0 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/users
 * Admin-only: Update user role, suspend, etc.
 * Body: { id, role?, suspended? }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, role, suspended } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    const allowed: Record<string, unknown> = {};
    if (role) allowed.role = role;
    if (suspended !== undefined) allowed.verified_id = !suspended; // Using verified_id as active flag
    allowed.updated_at = new Date().toISOString();

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

    return NextResponse.json({ user: data });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
