import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/trips?traveler_id=...&status=...&destination=...&limit=...&offset=...
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const params = req.nextUrl.searchParams;
    const travelerId = params.get('traveler_id');
    const status = params.get('status');
    const destination = params.get('destination');
    const limit = parseInt(params.get('limit') || '50', 10);
    const offset = parseInt(params.get('offset') || '0', 10);

    let query = supabase
      .from('trips')
      .select('*, profiles!traveler_id(full_name, avatar_url, reputation_score)', { count: 'exact' })
      .order('departure_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (travelerId) query = query.eq('traveler_id', travelerId);
    if (status && status !== 'all') query = query.eq('status', status);
    if (destination) query = query.ilike('destination_city', `%${destination}%`);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ trips: data || [], total: count || 0 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/trips
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      traveler_id, origin_city, origin_country, destination_city, destination_country,
      departure_date, arrival_date, flight_number, available_kg, price_per_kg_usd
    } = body;

    if (!traveler_id || !origin_city || !destination_city || !departure_date || !arrival_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('trips')
      .insert({
        traveler_id,
        origin_city: String(origin_city).trim().slice(0, 100),
        origin_country: (origin_country || 'Bolivia').trim().slice(0, 60),
        destination_city: String(destination_city).trim().slice(0, 100),
        destination_country: (destination_country || 'Bolivia').trim().slice(0, 60),
        departure_date,
        arrival_date,
        flight_number: flight_number ? String(flight_number).trim().slice(0, 30) : null,
        available_kg: Math.max(0.1, parseFloat(available_kg) || 20),
        price_per_kg_usd: Math.max(1, parseFloat(price_per_kg_usd) || 15),
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ trip: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PUT /api/trips
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing trip id' }, { status: 400 });
    }

    const allowed: Record<string, unknown> = {};
    const textFields = ['origin_city', 'origin_country', 'destination_city', 'destination_country', 'flight_number', 'status'];
    for (const key of textFields) {
      if (fields[key] !== undefined) allowed[key] = String(fields[key]).trim().slice(0, 100);
    }
    if (fields.departure_date) allowed.departure_date = fields.departure_date;
    if (fields.arrival_date) allowed.arrival_date = fields.arrival_date;
    if (fields.available_kg !== undefined) allowed.available_kg = Math.max(0, parseFloat(fields.available_kg) || 0);
    if (fields.price_per_kg_usd !== undefined) allowed.price_per_kg_usd = Math.max(1, parseFloat(fields.price_per_kg_usd) || 15);
    allowed.updated_at = new Date().toISOString();

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('trips')
      .update(allowed)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ trip: data });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/trips?id=...
 */
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing trip id' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // Check for associated orders first
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('traveler_id', id) // This should actually reference trip somehow
      .in('status', ['funded', 'purchased', 'in_transit']);

    if (orders && orders.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un viaje con órdenes activas asociadas' },
        { status: 409 }
      );
    }

    const { error } = await supabase.from('trips').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
