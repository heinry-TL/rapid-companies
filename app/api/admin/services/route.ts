import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';
import type { DatabaseRowPacket } from '@/types/api';

export async function GET(_request: NextRequest) {
  try {
    const db = await getConnection();

    const [rows] = await db.execute(`
      SELECT
        id,
        name,
        description,
        base_price,
        currency,
        note,
        category,
        active,
        created_at,
        updated_at
      FROM additional_services
      ORDER BY name ASC
    `);

    return NextResponse.json({
      services: rows,
      total: (rows as DatabaseRowPacket[]).length
    });
  } catch (error) {
    console.error('Services API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getConnection();
    const {
      id,
      name,
      description,
      base_price,
      currency = 'GBP',
      note,
      category,
      active = true
    } = await request.json();

    if (!name || !base_price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, base_price, category' },
        { status: 400 }
      );
    }

    // Generate ID if not provided
    const serviceId = id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const [result] = await db.execute(
      `INSERT INTO additional_services
       (id, name, description, base_price, currency, note, category, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [serviceId, name, description || '', base_price, currency, note || '', category, active]
    );

    return NextResponse.json({
      success: true,
      service: {
        id: serviceId,
        name,
        description,
        base_price,
        currency,
        note,
        category,
        active
      }
    });
  } catch (error) {
    console.error('Service creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}