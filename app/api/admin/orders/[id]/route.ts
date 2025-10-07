import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    // Get order details - try by order_id first
    const { data: orders, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_id', orderId);

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

    // Get order items (non-critical, don't fail if missing)
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', order.order_id)
      .order('id', { ascending: true });

    if (itemsError) {
      console.error('Supabase order items error (non-critical):', itemsError);
      console.error('Order ID being queried:', order.order_id);
      // Don't fail the request if order_items table doesn't exist yet
    } else {
      console.log('Order items found:', orderItems?.length || 0, 'for order:', order.order_id);
    }

    // Get related applications (non-critical, don't fail if missing)
    const { data: applications, error: appsError } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('order_id', order.order_id)
      .order('created_at', { ascending: true });

    if (appsError) {
      console.error('Supabase applications error (non-critical):', appsError);
      // Don't fail the request
    }

    // JSON fields are already parsed in Supabase
    const parsedOrder = {
      ...order,
      order_items: order.order_items || null,
      stripe_metadata: order.stripe_metadata || null,
      items: orderItems || [],
      applications: applications || [],
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
      .eq('order_id', orderId)
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