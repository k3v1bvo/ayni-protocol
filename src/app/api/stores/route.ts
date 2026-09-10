import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/stores?owner_id=...&category=...&search=...
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const params = req.nextUrl.searchParams;
    const ownerId = params.get('owner_id');
    const category = params.get('category');
    const search = params.get('search');

    let query = supabase
      .from('stores')
      .select('*, profiles!owner_id(full_name, reputation_score)')
      .order('created_at', { ascending: false });

    if (ownerId) query = query.eq('owner_id', ownerId);
    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ stores: data || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/stores
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { owner_id, name, category, description, location_city, location_country, banner_url } = body;

    if (!owner_id || !name || !category || !location_city) {
      return NextResponse.json({ error: 'Missing required fields: owner_id, name, category, location_city' }, { status: 400 });
    }

    const slug = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);

    const supabase = getSupabaseServerClient();

    // Check if owner already has a store
    const { data: existing } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', owner_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Ya tienes una tienda registrada. Usa PUT para editarla.' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('stores')
      .insert({
        owner_id,
        name: String(name).replace(/[<>]/g, '').trim().slice(0, 120),
        slug: `${slug}-${Date.now().toString(36)}`,
        category,
        description: description ? String(description).replace(/[<>]/g, '').trim().slice(0, 1000) : null,
        location_city: String(location_city).trim().slice(0, 100),
        location_country: (location_country || 'Bolivia').trim().slice(0, 60),
        banner_url: banner_url || null,
        is_verified: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ store: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PUT /api/stores
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing store id' }, { status: 400 });
    }

    const allowed: Record<string, unknown> = {};
    const textFields = ['name', 'description', 'category', 'location_city', 'location_country', 'banner_url'];
    for (const key of textFields) {
      if (fields[key] !== undefined) {
        allowed[key] = String(fields[key]).replace(/[<>]/g, '').trim().slice(0, 1000);
      }
    }
    allowed.updated_at = new Date().toISOString();

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('stores')
      .update(allowed)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ store: data });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
