import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';
import type { DatabaseRowPacket } from '@/types/api';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = await getConnection();
        const [rows] = await db.execute('SELECT * FROM banking_jurisdictions WHERE id = ?', [id]);
        if ((rows as DatabaseRowPacket[]).length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ bankingJurisdiction: (rows as DatabaseRowPacket[])[0] });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch banking jurisdiction' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = await getConnection();
        const updates = await request.json() as Record<string, unknown>;
        const allowedFields = ['name', 'description', 'icon_url', 'is_active', 'sort_order'];
        const updateFields: string[] = [];
        const updateValues: (string | number | boolean)[] = [];
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                updateFields.push(`${key} = ?`);
                updateValues.push(updates[key] as string | number | boolean);
            }
        });
        if (updateFields.length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }
        updateValues.push(id);
        await db.execute(
            `UPDATE banking_jurisdictions SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update banking jurisdiction' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = await getConnection();
        await db.execute('DELETE FROM banking_jurisdictions WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete banking jurisdiction' }, { status: 500 });
    }
}
