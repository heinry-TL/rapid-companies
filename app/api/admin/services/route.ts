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
        category,
        active,
        created_at,
        updated_at
      `)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      services: rows || [],
      total: (rows || []).length
    });
  } catch (error) {
    console.error('Services API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      id,
      name,
      description,
      base_price,
      currency = 'GBP',
      note,
      category,
      active = true
    } = await request.json();

    if (!name || !base_price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, base_price, category' },
        { status: 400 }
      );
    }

    // Generate ID if not provided
    const serviceId = id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const { data, error } = await supabaseAdmin
      .from('additional_services')
      .insert([{
        id: serviceId,
        name,
        description: description || '',
        base_price,
        currency,
        note: note || '',
        category,
        active
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      service: {
        id: serviceId,
        name,
        description,
        base_price,
        currency,
        note,
        category,
        active
      }
    });
  } catch (error) {
    console.error('Service creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}