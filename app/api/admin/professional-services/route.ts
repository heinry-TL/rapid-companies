import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(_request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('professional_services')
      .select(`
        id,
        name,
        description,
        short_description,
        full_description,
        features,
        benefits,
        category,
        icon_svg,
        display_order,
        pricing,
        timeline,
        link_url,
        link_text,
        active,
        created_at,
        updated_at
      `)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch professional services' },
        { status: 500 }
      );
    }

    // Features and benefits are already arrays in Supabase, no need to parse JSON
    const services = data.map(service => ({
      ...service,
      features: service.features || [],
      benefits: service.benefits || []
    }));

    return NextResponse.json({
      services,
      total: services.length
    });
  } catch (error) {
    console.error('Admin professional services API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professional services' },
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
      short_description,
      full_description,
      features,
      benefits,
      category,
      icon_svg,
      display_order = 1,
      pricing,
      timeline,
      link_url,
      link_text,
      active = true
    } = await request.json();

    if (!id || !name || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, description, category' },
        { status: 400 }
      );
    }

    // Check if ID already exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('professional_services')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Supabase check error:', checkError);
      return NextResponse.json(
        { error: 'Failed to check service ID' },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: 'Service ID already exists' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('professional_services')
      .insert([{
        id,
        name,
        description: description || '',
        short_description: short_description || null,
        full_description: full_description || null,
        features: features || [],
        benefits: benefits || [],
        category,
        icon_svg: icon_svg || null,
        display_order,
        pricing: pricing || null,
        timeline: timeline || null,
        link_url: link_url || null,
        link_text: link_text || null,
        active
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create professional service' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      service: data
    });
  } catch (error) {
    console.error('Professional service creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create professional service' },
      { status: 500 }
    );
  }
}