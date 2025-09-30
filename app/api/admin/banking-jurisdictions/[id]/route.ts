import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const { data, error } = await supabaseAdmin
            .from('banking_jurisdictions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }
            console.error('Supabase error:', error);
            return NextResponse.json({ error: 'Failed to fetch banking jurisdiction' }, { status: 500 });
        }

        return NextResponse.json({ bankingJurisdiction: data });
    } catch (error) {
        console.error('Banking jurisdiction fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch banking jurisdiction' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const updates = await request.json() as Record<string, unknown>;
        const allowedFields = ['name', 'description', 'icon_url', 'is_active', 'sort_order'];

        // Filter updates to only allowed fields
        const filteredUpdates: Record<string, unknown> = {};
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        });

        if (Object.keys(filteredUpdates).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('banking_jurisdictions')
            .update(filteredUpdates)
            .eq('id', id);

        if (error) {
            console.error('Supabase update error:', error);
            return NextResponse.json({ error: 'Failed to update banking jurisdiction' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Banking jurisdiction update error:', error);
        return NextResponse.json({ error: 'Failed to update banking jurisdiction' }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const { error } = await supabaseAdmin
            .from('banking_jurisdictions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase delete error:', error);
            return NextResponse.json({ error: 'Failed to delete banking jurisdiction' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Banking jurisdiction deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete banking jurisdiction' }, { status: 500 });
    }
}
