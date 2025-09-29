import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';
import type { DatabaseRowPacket, JurisdictionUpdateRequest } from '@/types/api';

export async function GET(_request: NextRequest) {
  try {
    const db = await getConnection();

    const [rows] = await db.execute(`
      SELECT
        id,
        name,
        country_code,
        flag_url,
        description,
        formation_price,
        currency,
        processing_time,
        features,
        status,
        created_at,
        updated_at
      FROM jurisdictions
      ORDER BY name ASC
    `);

    const jurisdictions = (rows as DatabaseRowPacket[]).map(row => {
      let features: string[] = [];

      try {
        if (typeof row.features === 'string') {
          features = JSON.parse(row.features);
        } else if (Array.isArray(row.features)) {
          features = row.features;
        }
      } catch {
        // If JSON parsing fails, treat as comma-separated string
        if (typeof row.features === 'string') {
          features = row.features.split(',').map(f => f.trim()).filter(f => f.length > 0);
        }
      }

      return {
        ...row,
        features
      };
    });

    return NextResponse.json({
      jurisdictions,
      total: jurisdictions.length
    });
  } catch (error) {
    console.error('Jurisdictions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jurisdictions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getConnection();
    const {
      name,
      country_code,
      flag_url,
      description,
      formation_price,
      currency,
      processing_time,
      features,
      status = 'active'
    } = await request.json() as JurisdictionUpdateRequest & { name: string; country_code: string; formation_price: number; currency: string };

    if (!name || !country_code || !formation_price || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const featuresJson = JSON.stringify(Array.isArray(features) ? features : []);

    const [result] = await db.execute(
      `INSERT INTO jurisdictions
       (name, country_code, flag_url, description, formation_price, currency, processing_time, features, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, country_code, flag_url, description, formation_price, currency, processing_time, featuresJson, status]
    );

    return NextResponse.json({
      success: true,
      jurisdiction: {
        id: (result as { insertId: number }).insertId,
        name,
        country_code,
        flag_url,
        description,
        formation_price,
        currency,
        processing_time,
        features,
        status
      }
    });
  } catch (error) {
    console.error('Jurisdiction creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create jurisdiction' },
      { status: 500 }
    );
  }
}