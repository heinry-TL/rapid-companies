import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    const db = await getConnection();

    // Build the WHERE clause
    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push('o.payment_status = ?');
      queryParams.push(status);
    }

    if (search) {
      whereConditions.push('(o.order_id LIKE ? OR o.customer_email LIKE ? OR o.stripe_payment_intent_id LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const [countResult]: any = await db.execute(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
      queryParams
    );
    const total = countResult[0].total;

    // Get orders with pagination
    const [orders]: any = await db.execute(
      `SELECT
        o.id,
        o.order_id,
        o.stripe_payment_intent_id,
        o.customer_email,
        o.customer_name,
        o.total_amount,
        o.currency,
        o.payment_status,
        o.applications_count,
        o.services_count,
        o.order_items,
        o.created_at,
        o.paid_at,
        o.updated_at
      FROM orders o
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // Parse JSON fields
    const parsedOrders = orders.map((order: any) => ({
      ...order,
      order_items: order.order_items ? JSON.parse(order.order_items) : null,
    }));

    return NextResponse.json({
      orders: parsedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });

  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// Get order statistics for dashboard
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.action === 'stats') {
    try {
      const db = await getConnection();

      // Get order statistics
      const [stats]: any = await db.execute(`
        SELECT
          COUNT(*) as total_orders,
          COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders,
          COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_orders,
          COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as total_revenue,
          COALESCE(AVG(CASE WHEN payment_status = 'paid' THEN total_amount ELSE NULL END), 0) as average_order_value
        FROM orders
      `);

      // Get recent orders
      const [recentOrders]: any = await db.execute(`
        SELECT
          order_id,
          customer_email,
          total_amount,
          currency,
          payment_status,
          applications_count,
          services_count,
          created_at,
          paid_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 10
      `);

      // Get monthly revenue data for the last 12 months
      const [monthlyRevenue]: any = await db.execute(`
        SELECT
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as orders_count,
          COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as revenue
        FROM orders
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
      `);

      await db.end();

      return NextResponse.json({
        statistics: stats[0],
        recentOrders,
        monthlyRevenue,
      });

    } catch (error: any) {
      console.error('Error fetching order statistics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch order statistics' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}