import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';

export async function GET(request: NextRequest) {
  try {
    const db = await getConnection();

    const [rows] = await db.execute(`
      SELECT
        id,
        name,
        description,
        base_price as basePrice,
        currency,
        note,
        category
      FROM additional_services
      WHERE active = TRUE
      ORDER BY name ASC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Services API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}