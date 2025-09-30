import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { ApplicationData, ApplicationUpdateRequest } from '@/types/api';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applicationId = id; // Keep as string since IDs are strings in the database

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Invalid application ID' },
        { status: 400 }
      );
    }

    const { data: applicationData, error: applicationError } = await supabaseAdmin
      .from('applications')
      .select(`
        id,
        jurisdiction_id,
        jurisdiction_name,
        jurisdiction_price,
        jurisdiction_currency,
        contact_first_name,
        contact_last_name,
        contact_email,
        contact_phone,
        contact_address_line1,
        contact_address_line2,
        contact_city,
        contact_county,
        contact_postcode,
        contact_country,
        company_proposed_name,
        company_alternative_name,
        company_business_activity,
        company_authorized_capital,
        company_number_of_shares,
        registered_address_line1,
        registered_address_line2,
        registered_city,
        registered_county,
        registered_postcode,
        registered_country,
        use_contact_address,
        step_completed,
        is_complete,
        directors,
        shareholders,
        additional_services,
        created_at,
        updated_at,
        jurisdictions!inner(
          name,
          description
        )
      `)
      .eq('id', applicationId)
      .single();

    if (applicationError) {
      if (applicationError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }
      console.error('Supabase application error:', applicationError);
      return NextResponse.json(
        { error: 'Failed to fetch application' },
        { status: 500 }
      );
    }

    const application = {
      ...applicationData,
      // Rename fields to match expected structure
      email: applicationData.contact_email,
      phone: applicationData.contact_phone,
      company_name: applicationData.company_proposed_name,
      jurisdiction_name_full: applicationData.jurisdictions?.name,
      jurisdiction_description: applicationData.jurisdictions?.description,
    };

    // Add derived fields
    application.full_name = `${application.contact_first_name || ''} ${application.contact_last_name || ''}`.trim();
    application.company_type = 'LLC';
    application.status = application.is_complete ? 'completed' : ((application.step_completed || 0) >= 5 ? 'processing' : 'pending');
    application.payment_status = 'pending';
    application.internal_status = 'new';
    application.admin_notes = '';

    // JSON fields are already parsed in Supabase, ensure they're arrays
    application.directors = application.directors || [];
    application.shareholders = application.shareholders || [];
    application.additional_services = application.additional_services || [];

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Application fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
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
    const applicationId = id; // Keep as string since IDs are strings in the database

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Invalid application ID' },
        { status: 400 }
      );
    }

    const updates = await request.json() as ApplicationUpdateRequest;
    const allowedFields = [
      'internal_status', 'admin_notes', 'assigned_to', 'payment_status'
    ];

    // Filter updates to only allowed fields
    const filteredUpdates: Record<string, any> = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key as keyof ApplicationUpdateRequest] !== undefined) {
        filteredUpdates[key] = updates[key as keyof ApplicationUpdateRequest];
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
      .from('applications')
      .update(filteredUpdates)
      .eq('id', applicationId);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      );
    }

    // Fetch updated application
    const { data: applicationData, error: fetchError } = await supabaseAdmin
      .from('applications')
      .select(`
        id,
        jurisdiction_id,
        jurisdiction_name,
        jurisdiction_price,
        jurisdiction_currency,
        contact_first_name,
        contact_last_name,
        contact_email,
        contact_phone,
        company_proposed_name,
        step_completed,
        is_complete,
        created_at,
        updated_at
      `)
      .eq('id', applicationId)
      .single();

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Application not found after update' },
        { status: 404 }
      );
    }

    const application = {
      ...applicationData,
      // Rename fields to match expected structure
      email: applicationData.contact_email,
      phone: applicationData.contact_phone,
      company_name: applicationData.company_proposed_name,
    };

    // Add derived fields
    application.full_name = `${application.contact_first_name || ''} ${application.contact_last_name || ''}`.trim();
    application.company_type = 'LLC';
    application.status = application.is_complete ? 'completed' : ((application.step_completed || 0) >= 5 ? 'processing' : 'pending');
    application.payment_status = 'pending';
    application.internal_status = 'new';
    application.admin_notes = '';

    return NextResponse.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Application update error:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}