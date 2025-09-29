import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';

export async function GET() {
    try {
        const db = await getConnection();
        const [rows] = await db.execute('SELECT * FROM banking_jurisdictions ORDER BY sort_order, name');
        return NextResponse.json({ bankingJurisdictions: rows });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch banking jurisdictions' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const db = await getConnection();
        const { name, description, icon_url, is_active = true, sort_order = 0 } = await request.json();
        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        const [result]: any = await db.execute(
            'INSERT INTO banking_jurisdictions (name, description, icon_url, is_active, sort_order) VALUES (?, ?, ?, ?, ?)',
            [name, description, icon_url, is_active, sort_order]
        );
        return NextResponse.json({
            success: true,
            bankingJurisdiction: { id: result.insertId, name, description, icon_url, is_active, sort_order }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create banking jurisdiction' }, { status: 500 });
    }
}
