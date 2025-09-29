import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getConnection();
    const { id } = await params;
    const applicationId = id; // Keep as string since IDs are strings in the database

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Invalid application ID' },
        { status: 400 }
      );
    }

    const [rows] = await db.execute(`
      SELECT
        a.id,
        a.jurisdiction_id,
        a.jurisdiction_name,
        a.jurisdiction_price,
        a.jurisdiction_currency,
        a.contact_first_name,
        a.contact_last_name,
        a.contact_email as email,
        a.contact_phone as phone,
        a.contact_address_line1,
        a.contact_address_line2,
        a.contact_city,
        a.contact_county,
        a.contact_postcode,
        a.contact_country,
        a.company_proposed_name as company_name,
        a.company_alternative_name,
        a.company_business_activity,
        a.company_authorized_capital,
        a.company_number_of_shares,
        a.registered_address_line1,
        a.registered_address_line2,
        a.registered_city,
        a.registered_county,
        a.registered_postcode,
        a.registered_country,
        a.use_contact_address,
        a.step_completed,
        a.is_complete,
        a.directors,
        a.shareholders,
        a.additional_services,
        a.created_at,
        a.updated_at,
        j.name as jurisdiction_name_full,
        j.description as jurisdiction_description
      FROM applications a
      LEFT JOIN jurisdictions j ON a.jurisdiction_id = j.id
      WHERE a.id = ?
    `, [applicationId]);

    const result = rows as any[];
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const application = result[0];

    // Add derived fields
    application.full_name = `${application.contact_first_name || ''} ${application.contact_last_name || ''}`.trim();
    application.company_type = 'LLC';
    application.status = application.is_complete ? 'completed' : (application.step_completed >= 5 ? 'processing' : 'pending');
    application.payment_status = 'pending';
    application.internal_status = 'new';
    application.admin_notes = '';


    // Parse JSON fields
    if (application.directors) {
      try {
        if (typeof application.directors === 'string') {
          application.directors = JSON.parse(application.directors);
        }
        // If it's already an array/object, keep it as is
      } catch (e) {
        console.error('Error parsing directors:', e);
        application.directors = [];
      }
    } else {
      application.directors = [];
    }

    if (application.shareholders) {
      try {
        if (typeof application.shareholders === 'string') {
          application.shareholders = JSON.parse(application.shareholders);
        }
        // If it's already an array/object, keep it as is
      } catch (e) {
        console.error('Error parsing shareholders:', e);
        application.shareholders = [];
      }
    } else {
      application.shareholders = [];
    }

    if (application.additional_services) {
      try {
        if (typeof application.additional_services === 'string') {
          application.additional_services = JSON.parse(application.additional_services);
        }
        // If it's already an array/object, keep it as is
      } catch (e) {
        console.error('Error parsing additional_services:', e);
        application.additional_services = [];
      }
    } else {
      application.additional_services = [];
    }

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
    const db = await getConnection();
    const { id } = await params;
    const applicationId = id; // Keep as string since IDs are strings in the database

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Invalid application ID' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    const allowedFields = [
      'internal_status', 'admin_notes', 'assigned_to', 'payment_status'
    ];

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(applicationId);

    await db.execute(
      `UPDATE applications SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Fetch updated application
    const [rows] = await db.execute(`
      SELECT
        a.id,
        a.jurisdiction_id,
        a.jurisdiction_name,
        a.jurisdiction_price,
        a.jurisdiction_currency,
        a.contact_first_name,
        a.contact_last_name,
        a.contact_email as email,
        a.contact_phone as phone,
        a.company_proposed_name as company_name,
        a.step_completed,
        a.is_complete,
        a.created_at,
        a.updated_at
      FROM applications a
      WHERE a.id = ?
    `, [applicationId]);

    const result = rows as any[];
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Application not found after update' },
        { status: 404 }
      );
    }

    const application = result[0];

    // Add derived fields
    application.full_name = `${application.contact_first_name || ''} ${application.contact_last_name || ''}`.trim();
    application.company_type = 'LLC';
    application.status = application.is_complete ? 'completed' : (application.step_completed >= 5 ? 'processing' : 'pending');
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