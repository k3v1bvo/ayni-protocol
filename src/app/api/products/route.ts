import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/products?store_id=...&category=...&search=...&limit=...&offset=...
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const params = req.nextUrl.searchParams;
    const storeId = params.get('store_id');
    const category = params.get('category');
    const search = params.get('search');
    const limit = parseInt(params.get('limit') || '50', 10);
    const offset = parseInt(params.get('offset') || '0', 10);

    let query = supabase
      .from('products')
      .select('*, stores(name, slug, location_city, location_country, rating, owner_id)', { count: 'exact' })
      .eq('in_stock', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (storeId) query = query.eq('store_id', storeId);
    if (category && category !== 'all') query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ products: data || [], total: count || 0 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/products
 * Body: { store_id, title, description, category, price_usd, weight_kg, origin_country, image_url, images, tags }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { store_id, title, description, category, price_usd, weight_kg, origin_country, image_url, images, tags } = body;

    if (!store_id || !title || !price_usd) {
      return NextResponse.json({ error: 'Missing required fields: store_id, title, price_usd' }, { status: 400 });
    }

    const code = `AYNI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('products')
      .insert({
        store_id,
        code,
        title: String(title).replace(/[<>]/g, '').trim().slice(0, 200),
        description: description ? String(description).replace(/[<>]/g, '').trim().slice(0, 2000) : null,
        category: category || 'general',
        price_usd: Math.max(0.01, parseFloat(price_usd) || 0),
        weight_kg: Math.max(0.01, parseFloat(weight_kg) || 0.2),
        origin_country: origin_country || 'Bolivia',
        image_url: image_url || (images?.[0] || null),
        tags: tags || [],
        in_stock: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PUT /api/products
 * Body: { id, ...fields }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
    }

    const allowed: Record<string, unknown> = {};
    if (fields.title !== undefined) allowed.title = String(fields.title).replace(/[<>]/g, '').trim().slice(0, 200);
    if (fields.description !== undefined) allowed.description = String(fields.description).replace(/[<>]/g, '').trim().slice(0, 2000);
    if (fields.category !== undefined) allowed.category = fields.category;
    if (fields.price_usd !== undefined) allowed.price_usd = Math.max(0.01, parseFloat(fields.price_usd) || 0);
    if (fields.weight_kg !== undefined) allowed.weight_kg = Math.max(0.01, parseFloat(fields.weight_kg) || 0.2);
    if (fields.in_stock !== undefined) allowed.in_stock = Boolean(fields.in_stock);
    if (fields.image_url !== undefined) allowed.image_url = fields.image_url;
    if (fields.tags !== undefined) allowed.tags = fields.tags;
    allowed.updated_at = new Date().toISOString();

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('products')
      .update(allowed)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ product: data });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/products?id=...
 */
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
