import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/notifications?user_id=...&unread_only=true
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const userId = req.nextUrl.searchParams.get('user_id');
    const unreadOnly = req.nextUrl.searchParams.get('unread_only') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (unreadOnly) query = query.eq('is_read', false);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ notifications: data || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/notifications
 * Create a notification for a user.
 * Body: { user_id, type, title, body, trade_id? }
 */
export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { user_id, type, title, body: notifBody, trade_id } = reqBody;

    if (!user_id || !title) {
      return NextResponse.json({ error: 'Missing required fields: user_id, title' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        type: type || 'system',
        title: String(title).trim().slice(0, 200),
        body: notifBody ? String(notifBody).trim().slice(0, 1000) : null,
        trade_id: trade_id || null,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ notification: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PUT /api/notifications
 * Mark notification(s) as read.
 * Body: { id } or { user_id, mark_all_read: true }
 */
export async function PUT(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { id, user_id, mark_all_read } = reqBody;

    const supabase = getSupabaseServerClient();

    if (mark_all_read && user_id) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user_id)
        .eq('is_read', false);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (id) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Missing id or user_id + mark_all_read' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
