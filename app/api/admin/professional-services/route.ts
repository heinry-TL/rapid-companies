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
        short_description,
        features,
        category,
        display_order,
        active,
        created_at,
        updated_at
      FROM professional_services
      ORDER BY display_order ASC, name ASC
    `);

    // Parse JSON features for each service with error handling
    const services = (rows as DatabaseRowPacket[]).map(service => {
      let features: string[] = [];

      if (service.features) {
        try {
          features = JSON.parse(service.features);
        } catch {
          // If JSON parsing fails, try to extract comma-separated values
          const featuresStr = String(service.features);
          if (featuresStr.includes(',')) {
            features = featuresStr.split(',').map(f => f.trim().replace(/["\[\]]/g, ''));
          } else {
            features = [featuresStr.replace(/["\[\]]/g, '')];
          }
        }
      }

      return {
        ...service,
        features
      };
    });

    return NextResponse.json({
      services,
      total: services.length
    });
  } catch (error) {
    console.error('Admin professional services API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professional services' },
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
      short_description,
      features,
      category,
      display_order = 1,
      active = true
    } = await request.json();

    if (!id || !name || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, description, category' },
        { status: 400 }
      );
    }

    // Check if ID already exists
    const [existing] = await db.execute(
      'SELECT id FROM professional_services WHERE id = ?',
      [id]
    );

    if ((existing as DatabaseRowPacket[]).length > 0) {
      return NextResponse.json(
        { error: 'Service ID already exists' },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      `INSERT INTO professional_services
       (id, name, description, short_description, features, category, display_order, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        description || '',
        short_description || '',
        JSON.stringify(features || []),
        category,
        display_order,
        active
      ]
    );

    return NextResponse.json({
      success: true,
      service: {
        id,
        name,
        description,
        short_description,
        features: features || [],
        category,
        display_order,
        active
      }
    });
  } catch (error) {
    console.error('Professional service creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create professional service' },
      { status: 500 }
    );
  }
}