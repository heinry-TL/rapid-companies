import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const db = await getConnection();

    // Get order details
    const [orders]: any = await db.execute(
      `SELECT
        o.id,
        o.order_id,
        o.stripe_payment_intent_id,
        o.customer_email,
        o.customer_name,
        o.customer_phone,
        o.total_amount,
        o.currency,
        o.payment_status,
        o.payment_method,
        o.applications_count,
        o.services_count,
        o.order_items,
        o.stripe_metadata,
        o.created_at,
        o.paid_at,
        o.updated_at
      FROM orders o
      WHERE o.order_id = ? OR o.id = ?`,
      [orderId, orderId]
    );

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orders[0];

    // Get order items
    const [orderItems]: any = await db.execute(
      `SELECT
        oi.id,
        oi.item_type,
        oi.item_name,
        oi.jurisdiction_name,
        oi.unit_price,
        oi.quantity,
        oi.total_price,
        oi.currency,
        oi.item_metadata,
        oi.created_at
      FROM order_items oi
      WHERE oi.order_id = ?
      ORDER BY oi.id`,
      [order.order_id]
    );

    // Parse JSON fields
    const parsedOrder = {
      ...order,
      order_items: order.order_items ? JSON.parse(order.order_items) : null,
      stripe_metadata: order.stripe_metadata ? JSON.parse(order.stripe_metadata) : null,
      items: orderItems.map((item: any) => ({
        ...item,
        item_metadata: item.item_metadata ? JSON.parse(item.item_metadata) : null,
      })),
    };

    await db.end();

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
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await request.json();
    const { payment_status, customer_name, customer_phone } = body;

    const db = await getConnection();

    // Build update query
    const updateFields = [];
    const updateValues = [];

    if (payment_status) {
      updateFields.push('payment_status = ?');
      updateValues.push(payment_status);
    }

    if (customer_name) {
      updateFields.push('customer_name = ?');
      updateValues.push(customer_name);
    }

    if (customer_phone) {
      updateFields.push('customer_phone = ?');
      updateValues.push(customer_phone);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(orderId);

    const [result]: any = await db.execute(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE order_id = ? OR id = ?`,
      [...updateValues, orderId]
    );

    if (result.affectedRows === 0) {
      await db.end();
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    await db.end();

    return NextResponse.json({ message: 'Order updated successfully' });

  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}