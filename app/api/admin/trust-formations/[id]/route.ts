import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('trust_formation_applications')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ trust: data });
  } catch (error) {
    console.error('Trust formation GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trust formation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('trust_formation_applications')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ trust: data });
  } catch (error) {
    console.error('Trust formation PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update trust formation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
