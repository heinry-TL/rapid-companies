import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    // Get order details
    const { data: orders, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_id,
        stripe_payment_intent_id,
        customer_email,
        customer_name,
        customer_phone,
        total_amount,
        currency,
        payment_status,
        payment_method,
        applications_count,
        services_count,
        order_items,
        stripe_metadata,
        created_at,
        paid_at,
        updated_at
      `)
      .or(`order_id.eq.${orderId},id.eq.${orderId}`);

    if (orderError) {
      console.error('Supabase order error:', orderError);
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: 500 }
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orders[0];

    // Get order items
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select(`
        id,
        item_type,
        item_name,
        jurisdiction_name,
        unit_price,
        quantity,
        total_price,
        currency,
        item_metadata,
        created_at
      `)
      .eq('order_id', order.order_id)
      .order('id', { ascending: true });

    if (itemsError) {
      console.error('Supabase order items error:', itemsError);
      return NextResponse.json(
        { error: 'Failed to fetch order items' },
        { status: 500 }
      );
    }

    // JSON fields are already parsed in Supabase
    const parsedOrder = {
      ...order,
      order_items: order.order_items || null,
      stripe_metadata: order.stripe_metadata || null,
      items: orderItems || [],
    };

    return NextResponse.json({ order: parsedOrder });

  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const orderId = resolvedParams.id;
    const body = await request.json();
    const { payment_status, customer_name, customer_phone } = body;

    // Build update object
    const updates: Record<string, any> = {};

    if (payment_status) {
      updates.payment_status = payment_status;
    }

    if (customer_name) {
      updates.customer_name = customer_name;
    }

    if (customer_phone) {
      updates.customer_phone = customer_phone;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .or(`order_id.eq.${orderId},id.eq.${orderId}`)
      .select();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Order updated successfully' });

  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}