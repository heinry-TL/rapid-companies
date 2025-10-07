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

    // Select all columns using * to avoid errors if some columns don't exist
    const { data: applicationData, error: applicationError } = await supabaseAdmin
      .from('applications')
      .select('*')
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

    // Parse JSON fields if they're strings - with error handling
    let directors = [];
    let shareholders = [];
    let additionalServices = [];

    try {
      if (applicationData.directors) {
        directors = typeof applicationData.directors === 'string'
          ? JSON.parse(applicationData.directors)
          : applicationData.directors;
      }
    } catch (e) {
      console.error('Error parsing directors:', e);
    }

    try {
      if (applicationData.shareholders) {
        shareholders = typeof applicationData.shareholders === 'string'
          ? JSON.parse(applicationData.shareholders)
          : applicationData.shareholders;
      }
    } catch (e) {
      console.error('Error parsing shareholders:', e);
    }

    try {
      if (applicationData.additional_services) {
        additionalServices = typeof applicationData.additional_services === 'string'
          ? JSON.parse(applicationData.additional_services)
          : applicationData.additional_services;
      }
    } catch (e) {
      console.error('Error parsing additional_services:', e);
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
      admin_notes: applicationData.admin_notes || '',
      directors: directors,
      shareholders: shareholders,
      additional_services: additionalServices
    };

    // Fetch additional services from order_items table if this application has an order_id
    let orderServices = [];
    if (application.order_id) {
      try {
        const { data: orderServiceData, error: orderServiceError } = await supabaseAdmin
          .from('order_items')
          .select('*')
          .eq('order_id', application.order_id)
          .eq('item_type', 'service');

        if (orderServiceError) {
          console.error('Error fetching order services:', orderServiceError);
        } else {
          orderServices = orderServiceData || [];
        }
      } catch (e) {
        console.error('Error fetching order services:', e);
      }
    }

    // Combine both sources of additional services
    const combinedAdditionalServices = [
      ...application.additional_services,
      ...orderServices.map(service => ({
        id: service.id,
        name: service.item_name,
        price: service.total_price,
        unit_price: service.unit_price,
        quantity: service.quantity,
        currency: service.currency,
        jurisdiction_name: service.jurisdiction_name,
        metadata: service.item_metadata,
        source: 'order_item'
      }))
    ];

    // Update the application object with combined services
    application.additional_services = combinedAdditionalServices;

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

    // Fetch updated application with all fields
    const { data: applicationData, error: fetchError } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Application not found after update' },
        { status: 404 }
      );
    }

    // Parse JSON fields if they're strings - with error handling
    let directors = [];
    let shareholders = [];
    let additionalServices = [];

    try {
      if (applicationData.directors) {
        directors = typeof applicationData.directors === 'string'
          ? JSON.parse(applicationData.directors)
          : applicationData.directors;
      }
    } catch (e) {
      console.error('Error parsing directors:', e);
    }

    try {
      if (applicationData.shareholders) {
        shareholders = typeof applicationData.shareholders === 'string'
          ? JSON.parse(applicationData.shareholders)
          : applicationData.shareholders;
      }
    } catch (e) {
      console.error('Error parsing shareholders:', e);
    }

    try {
      if (applicationData.additional_services) {
        additionalServices = typeof applicationData.additional_services === 'string'
          ? JSON.parse(applicationData.additional_services)
          : applicationData.additional_services;
      }
    } catch (e) {
      console.error('Error parsing additional_services:', e);
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
      admin_notes: applicationData.admin_notes || '',
      directors: directors,
      shareholders: shareholders,
      additional_services: additionalServices
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