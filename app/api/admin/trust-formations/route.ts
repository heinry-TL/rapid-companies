import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch trust formation applications
    let trustsQuery = supabaseAdmin
      .from('trust_formation_applications')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters if provided
    if (status && status !== 'all') {
      trustsQuery = trustsQuery.eq('status', status);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      trustsQuery = trustsQuery.eq('payment_status', paymentStatus);
    }

    const { data: trustsData, error: trustsError } = await trustsQuery;

    if (trustsError) {
      throw trustsError;
    }

    // Get total count for pagination (with same filters)
    let countQuery = supabaseAdmin
      .from('trust_formation_applications')
      .select('*', { count: 'exact', head: true });

    // Apply the same status filters to count
    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      countQuery = countQuery.eq('payment_status', paymentStatus);
    }

    const { count: total } = await countQuery;

    return NextResponse.json({
      trusts: trustsData || [],
      total: total || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('Trust formations API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trust formations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
