import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch standalone services (services not tied to any application)
    const { data: standaloneServices, error: servicesError } = await supabaseAdmin
      .from('order_items')
      .select(`
        id,
        order_id,
        item_type,
        item_name,
        jurisdiction_name,
        unit_price,
        quantity,
        total_price,
        currency,
        item_metadata,
        created_at,
        orders!inner(
          customer_email,
          customer_name,
          customer_phone,
          payment_status,
          stripe_payment_intent_id,
          total_amount,
          created_at
        )
      `)
      .eq('item_type', 'service')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (servicesError) {
      throw servicesError;
    }

    // Process standalone services
    const services = (standaloneServices || []).map(service => ({
      id: service.id,
      service_name: service.item_name,
      jurisdiction_name: service.jurisdiction_name || 'N/A',
      unit_price: service.unit_price,
      quantity: service.quantity,
      total_price: service.total_price,
      currency: service.currency,
      customer_email: service.orders?.customer_email || 'N/A',
      customer_name: service.orders?.customer_name || 'N/A',
      customer_phone: service.orders?.customer_phone || 'N/A',
      payment_status: service.orders?.payment_status || 'pending',
      order_id: service.order_id,
      order_total: service.orders?.total_amount || 0,
      metadata: service.item_metadata,
      created_at: service.created_at,
      order_created_at: service.orders?.created_at
    }));

    // Get total count for pagination
    const { count: total } = await supabaseAdmin
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('item_type', 'service');

    return NextResponse.json({
      services,
      total: total || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('Standalone services API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standalone services', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}