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
        application_identifier,
        jurisdiction_name,
        jurisdiction_price,
        jurisdiction_currency,
        contact_first_name,
        contact_last_name,
        contact_email,
        contact_phone,
        company_proposed_name,
        company_business_activity,
        internal_status,
        payment_status,
        order_id,
        step_completed,
        created_at,
        updated_at
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
      full_name: `${applicationData.contact_first_name || ''} ${applicationData.contact_last_name || ''}`.trim(),
      company_type: 'LLC',
      status: applicationData.step_completed >= 5 ? 'completed' : 'pending',
      admin_notes: '',
      directors: [],
      shareholders: [],
      additional_services: []
    };

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
        jurisdiction_name,
        jurisdiction_price,
        jurisdiction_currency,
        contact_first_name,
        contact_last_name,
        contact_email,
        contact_phone,
        company_proposed_name,
        company_business_activity,
        internal_status,
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
      full_name: `${applicationData.contact_first_name || ''} ${applicationData.contact_last_name || ''}`.trim(),
      company_type: 'LLC',
      status: 'pending',
      payment_status: 'pending',
      admin_notes: ''
    };

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