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
        icon_svg,
        display_order
      FROM professional_services
      WHERE active = TRUE
      ORDER BY display_order ASC, name ASC
    `);

    // Parse JSON features for each service with error handling
    const services = (rows as DatabaseRowPacket[]).map(service => {
      let features: string[] = [];

      if (service.features) {
        try {
          // Try to parse as JSON first
          features = JSON.parse(service.features);
        } catch {
          // If JSON parsing fails, try to extract comma-separated values
          const featuresStr = String(service.features);
          if (featuresStr.includes(',')) {
            features = featuresStr.split(',').map(f => f.trim().replace(/["\[\]]/g, ''));
          } else {
            // Single feature or malformed, just use as-is
            features = [featuresStr.replace(/["\[\]]/g, '')];
          }
        }
      }

      return {
        ...service,
        features
      };
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Professional services API error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch professional services',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}