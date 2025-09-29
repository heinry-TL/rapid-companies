import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';
import type { DatabaseRowPacket } from '@/types/api';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getConnection();
    const resolvedParams = await params;
    const { id } = resolvedParams;

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
      WHERE id = ?
    `, [id]);

    const result = rows as DatabaseRowPacket[];
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Professional service not found' },
        { status: 404 }
      );
    }

    const service = result[0];
    let features: string[] = [];

    if (service.features) {
      try {
        features = JSON.parse(service.features);
      } catch (error) {
        // If JSON parsing fails, try to extract comma-separated values
        const featuresStr = String(service.features);
        if (featuresStr.includes(',')) {
          features = featuresStr.split(',').map(f => f.trim().replace(/["\[\]]/g, ''));
        } else {
          features = [featuresStr.replace(/["\[\]]/g, '')];
        }
      }
    }

    return NextResponse.json({
      ...service,
      features
    });
  } catch (error) {
    console.error('Professional service fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professional service' },
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
    const { id } = resolvedParams;
    const updates = await request.json();

    // Build dynamic update query
    const updateFields = [];
    const values = [];

    if (updates.name !== undefined) {
      updateFields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.short_description !== undefined) {
      updateFields.push('short_description = ?');
      values.push(updates.short_description);
    }
    if (updates.features !== undefined) {
      updateFields.push('features = ?');
      values.push(JSON.stringify(updates.features));
    }
    if (updates.category !== undefined) {
      updateFields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.display_order !== undefined) {
      updateFields.push('display_order = ?');
      values.push(updates.display_order);
    }
    if (updates.active !== undefined) {
      updateFields.push('active = ?');
      values.push(updates.active);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateFields.push('updated_at = NOW()');
    values.push(id);

    const [result] = await db.execute(
      `UPDATE professional_services SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Professional service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Professional service update error:', error);
    return NextResponse.json(
      { error: 'Failed to update professional service' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getConnection();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const [result] = await db.execute(
      'DELETE FROM professional_services WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Professional service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Professional service deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete professional service' },
      { status: 500 }
    );
  }
}