import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { data: service, error } = await supabaseAdmin
      .from('professional_services')
      .select(`
        id,
        name,
        description,
        short_description,
        features,
        category,
        display_order,
        active,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Professional service not found' },
          { status: 404 }
        );
      }
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch professional service' },
        { status: 500 }
      );
    }

    // Features are already arrays in Supabase, no need to parse
    return NextResponse.json({
      ...service,
      features: service.features || []
    });
  } catch (error) {
    console.error('Professional service fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professional service' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const updates = await request.json();

    // Build dynamic update object
    const updateData: Record<string, any> = {};

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    if (updates.short_description !== undefined) {
      updateData.short_description = updates.short_description;
    }
    if (updates.features !== undefined) {
      updateData.features = updates.features; // Already an array in Supabase
    }
    if (updates.category !== undefined) {
      updateData.category = updates.category;
    }
    if (updates.display_order !== undefined) {
      updateData.display_order = updates.display_order;
    }
    if (updates.active !== undefined) {
      updateData.active = updates.active;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('professional_services')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { error: 'Failed to update professional service' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Professional service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Professional service update error:', error);
    return NextResponse.json(
      { error: 'Failed to update professional service' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { data, error } = await supabaseAdmin
      .from('professional_services')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete professional service' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Professional service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Professional service deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete professional service' },
      { status: 500 }
    );
  }
}