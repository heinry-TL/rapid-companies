import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(_request: NextRequest) {
  try {
    const { data: rows, error } = await supabaseAdmin
      .from('additional_services')
      .select(`
        id,
        name,
        description,
        base_price,
        currency,
        note,
        category
      `)
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    // Map base_price to basePrice for consistency
    const services = (rows || []).map(service => ({
      ...service,
      basePrice: service.base_price
    }));

    return NextResponse.json(services);
  } catch (error) {
    console.error('Services API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}