import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const db = await getConnection();
        const [rows] = await db.execute('SELECT * FROM banking_jurisdictions WHERE id = ?', [params.id]);
        if ((rows as any[]).length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ bankingJurisdiction: (rows as any[])[0] });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch banking jurisdiction' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const db = await getConnection();
        const updates = await request.json();
        const allowedFields = ['name', 'description', 'icon_url', 'is_active', 'sort_order'];
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                updateFields.push(`${key} = ?`);
                updateValues.push(updates[key]);
            }
        });
        if (updateFields.length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }
        updateValues.push(params.id);
        await db.execute(
            `UPDATE banking_jurisdictions SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update banking jurisdiction' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const db = await getConnection();
        await db.execute('DELETE FROM banking_jurisdictions WHERE id = ?', [params.id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete banking jurisdiction' }, { status: 500 });
    }
}
