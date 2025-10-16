import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { JurisdictionUpdateRequest } from '@/types/api';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const jurisdictionId = parseInt(resolvedParams.id);

    if (isNaN(jurisdictionId)) {
      return NextResponse.json(
        { error: 'Invalid jurisdiction ID' },
        { status: 400 }
      );
    }

    const { data: jurisdiction, error } = await supabaseAdmin
      .from('jurisdictions')
      .select(`
        id,
        name,
        country_code,
        flag_url,
        description,
        formation_price,
        currency,
        vat_applicable,
        processing_time,
        features,
        status,
        created_at,
        updated_at
      `)
      .eq('id', jurisdictionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Jurisdiction not found' },
          { status: 404 }
        );
      }
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jurisdiction' },
        { status: 500 }
      );
    }

    // Features are already arrays in Supabase, no need to parse
    const jurisdictionWithFeatures = {
      ...jurisdiction,
      features: jurisdiction.features || []
    };

    return NextResponse.json({ jurisdiction: jurisdictionWithFeatures });
  } catch (error) {
    console.error('Jurisdiction fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jurisdiction' },
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
    const jurisdictionId = parseInt(resolvedParams.id);

    if (isNaN(jurisdictionId)) {
      return NextResponse.json(
        { error: 'Invalid jurisdiction ID' },
        { status: 400 }
      );
    }

    const updates = await request.json() as JurisdictionUpdateRequest;
    const allowedFields = [
      'name', 'country_code', 'flag_url', 'description',
      'formation_price', 'currency', 'vat_applicable', 'processing_time', 'features', 'status'
    ];

    // Filter updates to only allowed fields
    const filteredUpdates: Record<string, any> = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key as keyof JurisdictionUpdateRequest];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    filteredUpdates.updated_at = new Date().toISOString();

    const { error: updateError } = await supabaseAdmin
      .from('jurisdictions')
      .update(filteredUpdates)
      .eq('id', jurisdictionId);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update jurisdiction' },
        { status: 500 }
      );
    }

    // Fetch updated jurisdiction
    const { data: jurisdiction, error: fetchError } = await supabaseAdmin
      .from('jurisdictions')
      .select(`
        id,
        name,
        country_code,
        flag_url,
        description,
        formation_price,
        currency,
        vat_applicable,
        processing_time,
        features,
        status,
        created_at,
        updated_at
      `)
      .eq('id', jurisdictionId)
      .single();

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Jurisdiction not found after update' },
        { status: 404 }
      );
    }

    // Features are already arrays in Supabase, no need to parse
    const jurisdictionWithFeatures = {
      ...jurisdiction,
      features: jurisdiction.features || []
    };

    return NextResponse.json({
      success: true,
      jurisdiction: jurisdictionWithFeatures
    });
  } catch (error) {
    console.error('Jurisdiction update error:', error);
    return NextResponse.json(
      { error: 'Failed to update jurisdiction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const jurisdictionId = parseInt(resolvedParams.id);

    if (isNaN(jurisdictionId)) {
      return NextResponse.json(
        { error: 'Invalid jurisdiction ID' },
        { status: 400 }
      );
    }

    // Check if jurisdiction has applications
    const { data: applications, error: countError } = await supabaseAdmin
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('jurisdiction_id', jurisdictionId);

    if (countError) {
      console.error('Supabase count error:', countError);
      return NextResponse.json(
        { error: 'Failed to check jurisdiction usage' },
        { status: 500 }
      );
    }

    const appCount = applications?.length || 0;
    if (appCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete jurisdiction with existing applications. Set status to inactive instead.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('jurisdictions')
      .delete()
      .eq('id', jurisdictionId)
      .select();

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete jurisdiction' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Jurisdiction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Jurisdiction deleted successfully'
    });
  } catch (error) {
    console.error('Jurisdiction deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete jurisdiction' },
      { status: 500 }
    );
  }
}