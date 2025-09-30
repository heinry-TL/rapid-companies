import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: service, error } = await supabaseAdmin
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
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch service' },
        { status: 500 }
      );
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Service fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const updates = await request.json();
    const allowedFields = [
      'name', 'description', 'base_price', 'currency', 'note', 'category', 'active'
    ];

    // Filter updates to only allowed fields
    const filteredUpdates: Record<string, any> = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    filteredUpdates.updated_at = new Date().toISOString();

    const { data, error: updateError } = await supabaseAdmin
      .from('additional_services')
      .update(filteredUpdates)
      .eq('id', id)
      .select();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update service' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      service: data[0]
    });
  } catch (error) {
    console.error('Service update error:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if service is used in any applications
    // This would depend on how services are linked to applications in your schema
    // For now, we'll allow deletion but you might want to add checks

    const { data, error } = await supabaseAdmin
      .from('additional_services')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete service' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Service deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}