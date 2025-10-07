import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch complete applications with directors and shareholders
    let applicationsQuery = supabaseAdmin
      .from('applications')
      .select(`
        id,
        application_identifier,
        jurisdiction_name,
        jurisdiction_price,
        jurisdiction_currency,
        contact_first_name,
        contact_last_name,
        contact_email,
        contact_phone,
        company_proposed_name,
        company_business_activity,
        internal_status,
        payment_status,
        order_id,
        step_completed,
        directors,
        shareholders,
        additional_services,
        created_at,
        updated_at
      `)
      .not('company_proposed_name', 'is', null)  // Ensure we have actual company applications
      .not('contact_email', 'is', null)          // Ensure we have actual contact info
      .not('directors', 'is', null)              // Must have directors data
      .not('shareholders', 'is', null)           // Must have shareholders data
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters if provided
    if (status && status !== 'all') {
      applicationsQuery = applicationsQuery.eq('internal_status', status);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      applicationsQuery = applicationsQuery.eq('payment_status', paymentStatus);
    }

    const { data: applicationsData, error: applicationsError } = await applicationsQuery;

    if (applicationsError) {
      throw applicationsError;
    }

    // Process applications
    const applications = (applicationsData || []).map(row => ({
      ...row,
      email: row.contact_email,
      phone: row.contact_phone,
      company_name: row.company_proposed_name,
      full_name: `${row.contact_first_name || ''} ${row.contact_last_name || ''}`.trim(),
      company_type: 'LLC',
      status: row.step_completed >= 5 ? 'completed' : 'pending',
      admin_notes: ''
    }));

    // Get total count for pagination (with same filters)
    let countQuery = supabaseAdmin
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .not('company_proposed_name', 'is', null)  // Ensure we have actual company applications
      .not('contact_email', 'is', null)          // Ensure we have actual contact info
      .not('directors', 'is', null)              // Must have directors data
      .not('shareholders', 'is', null);          // Must have shareholders data

    // Apply the same status filters to count
    if (status && status !== 'all') {
      countQuery = countQuery.eq('internal_status', status);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      countQuery = countQuery.eq('payment_status', paymentStatus);
    }

    const { count: total } = await countQuery;

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