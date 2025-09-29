import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';
import type { DatabaseRowPacket } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const db = await getConnection();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT
        a.id,
        a.jurisdiction_id,
        a.jurisdiction_name,
        a.jurisdiction_price,
        a.jurisdiction_currency,
        a.contact_first_name,
        a.contact_last_name,
        a.contact_email as email,
        a.contact_phone as phone,
        a.company_proposed_name as company_name,
        a.step_completed,
        a.is_complete,
        a.created_at,
        a.updated_at
      FROM applications a
      WHERE 1=1
    `;

    const queryParams: (string | number)[] = [];

    // Note: Since internal_status column doesn't exist yet, we'll skip status filtering for now
    // if (status && status !== 'all') {
    //   query += ` AND a.internal_status = ?`;
    //   queryParams.push(status);
    // }

    // Note: Since payment_status column doesn't exist yet, we'll skip payment filtering for now
    // if (paymentStatus && paymentStatus !== 'all') {
    //   query += ` AND a.payment_status = ?`;
    //   queryParams.push(paymentStatus);
    // }

    query += ` ORDER BY a.created_at DESC LIMIT 50`;

    const [rows] = await db.execute(query);

    // Process the results to add derived fields
    const applications = (rows as DatabaseRowPacket[]).map(row => ({
      ...row,
      full_name: `${row.contact_first_name || ''} ${row.contact_last_name || ''}`.trim(),
      company_type: 'LLC',
      status: row.is_complete ? 'completed' : (row.step_completed >= 5 ? 'processing' : 'pending'),
      payment_status: 'pending',
      internal_status: 'new',
      admin_notes: ''
    }));

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM applications a WHERE 1=1`;
    const [countResult] = await db.execute(countQuery);
    const total = (countResult as DatabaseRowPacket[])[0]?.total || 0;

    return NextResponse.json({
      applications,
      total,
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