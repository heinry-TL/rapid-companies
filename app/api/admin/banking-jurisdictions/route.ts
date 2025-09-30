import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('banking_jurisdictions')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('name', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: 'Failed to fetch banking jurisdictions' }, { status: 500 });
        }

        return NextResponse.json({ bankingJurisdictions: data });
    } catch (error) {
        console.error('Banking jurisdictions fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch banking jurisdictions' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name, description, icon_url, is_active = true, sort_order = 0 } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('banking_jurisdictions')
            .insert([{
                name,
                description,
                icon_url,
                is_active,
                sort_order
            }])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return NextResponse.json({ error: 'Failed to create banking jurisdiction' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            bankingJurisdiction: data
        });
    } catch (error) {
        console.error('Banking jurisdiction creation error:', error);
        return NextResponse.json({ error: 'Failed to create banking jurisdiction' }, { status: 500 });
    }
}
