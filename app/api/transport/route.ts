import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(req.url);
    const commodity = searchParams.get('commodity');
    const status = searchParams.get('status') ?? 'open';

    let query = supabase
      .from('transport_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (commodity && commodity !== 'all') {
      query = query.eq('commodity', commodity);
    }
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ requests: data });
  } catch (err) {
    console.error('[GET /api/transport]', err);
    return NextResponse.json({ error: 'Failed to fetch transport requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      farmer_name, phone, province, village,
      commodity, quantity_kg, pickup_date, destination,
      offered_price_pgk, notes,
    } = body;

    // Basic validation
    if (!farmer_name || !phone || !province || !village || !commodity || !quantity_kg || !pickup_date || !destination) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('transport_requests')
      .insert([{
        farmer_name: farmer_name.trim(),
        phone: phone.trim(),
        province,
        village: village.trim(),
        commodity,
        quantity_kg: parseInt(quantity_kg),
        pickup_date,
        destination: destination.trim(),
        offered_price_pgk: offered_price_pgk ? parseFloat(offered_price_pgk) : null,
        notes: notes?.trim() || null,
        status: 'open',
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ request: data }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/transport]', err);
    return NextResponse.json({ error: 'Failed to post transport request' }, { status: 500 });
  }
}
