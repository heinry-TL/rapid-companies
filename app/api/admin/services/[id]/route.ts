import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getConnection();
    const { id } = params;

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
      WHERE id = ?
    `, [id]);

    const result = rows as any[];
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ service: result[0] });
  } catch (error) {
    console.error('Service fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getConnection();
    const { id } = params;

    const updates = await request.json();
    const allowedFields = [
      'name', 'description', 'base_price', 'currency', 'note', 'category', 'active'
    ];

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(id);

    const [result]: any = await db.execute(
      `UPDATE additional_services SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Fetch updated service
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
      WHERE id = ?
    `, [id]);

    const result = rows as any[];
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Service not found after update' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      service: result[0]
    });
  } catch (error) {
    console.error('Service update error:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getConnection();
    const { id } = params;

    // Check if service is used in any applications
    // This would depend on how services are linked to applications in your schema
    // For now, we'll allow deletion but you might want to add checks

    const [result]: any = await db.execute('DELETE FROM additional_services WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Service deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}