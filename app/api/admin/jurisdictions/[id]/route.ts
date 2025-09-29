import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';
import type { DatabaseRowPacket, JurisdictionUpdateRequest } from '@/types/api';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getConnection();
    const resolvedParams = await params;
    const jurisdictionId = parseInt(resolvedParams.id);

    if (isNaN(jurisdictionId)) {
      return NextResponse.json(
        { error: 'Invalid jurisdiction ID' },
        { status: 400 }
      );
    }

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
      WHERE id = ?
    `, [jurisdictionId]);

    const result = rows as DatabaseRowPacket[];
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Jurisdiction not found' },
        { status: 404 }
      );
    }

    const row = result[0];
    let features: string[] = [];

    try {
      if (typeof row.features === 'string') {
        features = JSON.parse(row.features);
      } else if (Array.isArray(row.features)) {
        features = row.features;
      }
    } catch {
      if (typeof row.features === 'string') {
        features = row.features.split(',').map(f => f.trim()).filter(f => f.length > 0);
      }
    }

    const jurisdiction = {
      ...row,
      features
    };

    return NextResponse.json({ jurisdiction });
  } catch (error) {
    console.error('Jurisdiction fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jurisdiction' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getConnection();
    const resolvedParams = await params;
    const jurisdictionId = parseInt(resolvedParams.id);

    if (isNaN(jurisdictionId)) {
      return NextResponse.json(
        { error: 'Invalid jurisdiction ID' },
        { status: 400 }
      );
    }

    const updates = await request.json() as JurisdictionUpdateRequest;
    const allowedFields = [
      'name', 'country_code', 'flag_url', 'description',
      'formation_price', 'currency', 'processing_time', 'features', 'status'
    ];

    const updateFields: string[] = [];
    const updateValues: (string | number)[] = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        if (key === 'features' && Array.isArray(updates[key as keyof JurisdictionUpdateRequest])) {
          updateValues.push(JSON.stringify(updates[key as keyof JurisdictionUpdateRequest]));
        } else {
          updateValues.push(updates[key as keyof JurisdictionUpdateRequest] as string | number);
        }
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(jurisdictionId);

    await db.execute(
      `UPDATE jurisdictions SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Fetch updated jurisdiction
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
      WHERE id = ?
    `, [jurisdictionId]);

    const result = rows as DatabaseRowPacket[];
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Jurisdiction not found after update' },
        { status: 404 }
      );
    }

    const row = result[0];
    let features: string[] = [];

    try {
      if (typeof row.features === 'string') {
        features = JSON.parse(row.features);
      } else if (Array.isArray(row.features)) {
        features = row.features;
      }
    } catch {
      if (typeof row.features === 'string') {
        features = row.features.split(',').map(f => f.trim()).filter(f => f.length > 0);
      }
    }

    const jurisdiction = {
      ...row,
      features
    };

    return NextResponse.json({
      success: true,
      jurisdiction
    });
  } catch (error) {
    console.error('Jurisdiction update error:', error);
    return NextResponse.json(
      { error: 'Failed to update jurisdiction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getConnection();
    const resolvedParams = await params;
    const jurisdictionId = parseInt(resolvedParams.id);

    if (isNaN(jurisdictionId)) {
      return NextResponse.json(
        { error: 'Invalid jurisdiction ID' },
        { status: 400 }
      );
    }

    // Check if jurisdiction has applications
    const [applications] = await db.execute(
      'SELECT COUNT(*) as count FROM applications WHERE jurisdiction_id = ?',
      [jurisdictionId]
    );

    const appCount = (applications as DatabaseRowPacket[])[0]?.count || 0;
    if (appCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete jurisdiction with existing applications. Set status to inactive instead.' },
        { status: 400 }
      );
    }

    await db.execute('DELETE FROM jurisdictions WHERE id = ?', [jurisdictionId]);

    return NextResponse.json({
      success: true,
      message: 'Jurisdiction deleted successfully'
    });
  } catch (error) {
    console.error('Jurisdiction deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete jurisdiction' },
      { status: 500 }
    );
  }
}