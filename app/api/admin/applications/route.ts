import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('applications')
      .select(`
        id,
        jurisdiction_id,
        jurisdiction_name,
        jurisdiction_price,
        jurisdiction_currency,
        contact_first_name,
        contact_last_name,
        contact_email,
        contact_phone,
        company_proposed_name,
        step_completed,
        is_complete,
        internal_status,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters if provided
    if (status && status !== 'all') {
      query = query.eq('internal_status', status);
    }

    const { data: rows, error, count } = await query;

    if (error) {
      throw error;
    }

    // Process the results to add derived fields
    const applications = (rows || []).map(row => ({
      ...row,
      email: row.contact_email,
      phone: row.contact_phone,
      company_name: row.company_proposed_name,
      full_name: `${row.contact_first_name || ''} ${row.contact_last_name || ''}`.trim(),
      company_type: 'LLC',
      status: row.is_complete ? 'completed' : (row.step_completed >= 5 ? 'processing' : 'pending'),
      payment_status: 'pending',
      admin_notes: ''
    }));

    // Get total count for pagination
    const { count: total } = await supabaseAdmin
      .from('applications')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      applications,
      total: total || 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('Applications API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}