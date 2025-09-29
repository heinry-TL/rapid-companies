import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await db.getOrders(page, limit, search, status);

    return NextResponse.json({
      orders: result.orders,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
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
      const result = await db.getOrderStatistics();

      return NextResponse.json(result);

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