import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/orders?client_id=...&traveler_id=...&store_owner_id=...&status=...
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const params = req.nextUrl.searchParams;
    const clientId = params.get('client_id');
    const travelerId = params.get('traveler_id');
    const storeOwnerId = params.get('store_owner_id');
    const status = params.get('status');
    const limit = parseInt(params.get('limit') || '50', 10);
    const offset = parseInt(params.get('offset') || '0', 10);

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (clientId) query = query.eq('client_id', clientId);
    if (travelerId) query = query.eq('traveler_id', travelerId);
    if (status && status !== 'all') query = query.eq('status', status);

    // For merchants, we need to filter by store ownership
    if (storeOwnerId) {
      const { data: stores } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', storeOwnerId);
      
      if (stores && stores.length > 0) {
        const storeIds = stores.map(s => s.id);
        query = query.in('store_id', storeIds);
      } else {
        return NextResponse.json({ orders: [], total: 0 });
      }
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ orders: data || [], total: count || 0 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/orders
 * Creates a new order with escrow state.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      client_id, traveler_id, store_id, product_id, order_type, description,
      product_price_usd, traveler_fee_usd, platform_fee_usd, guarantee_fund_usd
    } = body;

    if (!client_id || !description || !product_price_usd) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const price = Math.max(0.01, parseFloat(product_price_usd) || 0);
    const travelerFee = Math.max(0, parseFloat(traveler_fee_usd) || 0);
    const platformFee = Math.max(0, parseFloat(platform_fee_usd) || price * 0.05);
    const guaranteeFund = Math.max(0, parseFloat(guarantee_fund_usd) || 0);
    const totalEscrow = price + travelerFee + platformFee + guaranteeFund;

    // Generate OTP (6 chars alphanumeric)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let otp = '';
    for (let i = 0; i < 6; i++) otp += chars[Math.floor(Math.random() * chars.length)];

    // Simple hash for demo (in production, use keccak256)
    const encoder = new TextEncoder();
    const data = encoder.encode(otp);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const otpHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const orderCode = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

    const supabase = getSupabaseServerClient();
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_code: orderCode,
        client_id,
        traveler_id: traveler_id || null,
        store_id: store_id || null,
        product_id: product_id || null,
        order_type: order_type || 'foot_shopping',
        description: String(description).replace(/[<>]/g, '').trim().slice(0, 500),
        product_price_usd: price,
        traveler_fee_usd: travelerFee,
        platform_fee_usd: platformFee,
        guarantee_fund_usd: guaranteeFund,
        total_escrow_usd: totalEscrow,
        otp_hash: otpHash,
        otp_plain_simulated: otp, // Only for testnet
        status: 'funded',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ order, otp_code: otp }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PUT /api/orders
 * Update order status, assign traveler, etc.
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing order id' }, { status: 400 });
    }

    const allowed: Record<string, unknown> = {};
    if (fields.status) allowed.status = fields.status;
    if (fields.traveler_id) allowed.traveler_id = fields.traveler_id;
    if (fields.delivered_at) allowed.delivered_at = fields.delivered_at;

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('orders')
      .update(allowed)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ order: data });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
