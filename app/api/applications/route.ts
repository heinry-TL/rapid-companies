import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';
import type { DatabaseRowPacket } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json() as Record<string, unknown>;
    const conn = await getConnection();

    // Insert or update application
    const query = `
      INSERT INTO applications (
        id, jurisdiction_id, jurisdiction_name, jurisdiction_price, jurisdiction_currency,
        contact_first_name, contact_last_name, contact_email, contact_phone,
        contact_address_line1, contact_address_line2, contact_city, contact_county, contact_postcode, contact_country,
        company_proposed_name, company_alternative_name, company_business_activity,
        company_authorized_capital, company_number_of_shares,
        registered_address_line1, registered_address_line2, registered_city, registered_county, registered_postcode, registered_country,
        use_contact_address, directors, shareholders, additional_services,
        step_completed, is_complete, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        contact_first_name = VALUES(contact_first_name),
        contact_last_name = VALUES(contact_last_name),
        contact_email = VALUES(contact_email),
        contact_phone = VALUES(contact_phone),
        contact_address_line1 = VALUES(contact_address_line1),
        contact_address_line2 = VALUES(contact_address_line2),
        contact_city = VALUES(contact_city),
        contact_county = VALUES(contact_county),
        contact_postcode = VALUES(contact_postcode),
        contact_country = VALUES(contact_country),
        company_proposed_name = VALUES(company_proposed_name),
        company_alternative_name = VALUES(company_alternative_name),
        company_business_activity = VALUES(company_business_activity),
        company_authorized_capital = VALUES(company_authorized_capital),
        company_number_of_shares = VALUES(company_number_of_shares),
        registered_address_line1 = VALUES(registered_address_line1),
        registered_address_line2 = VALUES(registered_address_line2),
        registered_city = VALUES(registered_city),
        registered_county = VALUES(registered_county),
        registered_postcode = VALUES(registered_postcode),
        registered_country = VALUES(registered_country),
        use_contact_address = VALUES(use_contact_address),
        directors = VALUES(directors),
        shareholders = VALUES(shareholders),
        additional_services = VALUES(additional_services),
        step_completed = VALUES(step_completed),
        is_complete = VALUES(is_complete),
        updated_at = NOW()
    `;

    await conn.execute(query, [
      applicationData.id,
      applicationData.jurisdiction.id,
      applicationData.jurisdiction.name,
      applicationData.jurisdiction.price,
      applicationData.jurisdiction.currency,
      applicationData.contactDetails.firstName || null,
      applicationData.contactDetails.lastName || null,
      applicationData.contactDetails.email || null,
      applicationData.contactDetails.phone || null,
      applicationData.contactDetails.address.line1 || null,
      applicationData.contactDetails.address.line2 || null,
      applicationData.contactDetails.address.city || null,
      applicationData.contactDetails.address.county || null,
      applicationData.contactDetails.address.postcode || null,
      applicationData.contactDetails.address.country || 'United Kingdom',
      applicationData.companyDetails.proposedName || null,
      applicationData.companyDetails.alternativeName || null,
      applicationData.companyDetails.businessActivity || null,
      applicationData.companyDetails.authorizedCapital || 50000,
      applicationData.companyDetails.numberOfShares || 50000,
      applicationData.registeredAddress.line1 || null,
      applicationData.registeredAddress.line2 || null,
      applicationData.registeredAddress.city || null,
      applicationData.registeredAddress.county || null,
      applicationData.registeredAddress.postcode || null,
      applicationData.registeredAddress.country || 'United Kingdom',
      applicationData.registeredAddress.useContactAddress || false,
      JSON.stringify(applicationData.directors || []),
      JSON.stringify(applicationData.shareholders || []),
      JSON.stringify(applicationData.additionalServices || []),
      applicationData.stepCompleted || 0,
      applicationData.isComplete || false,
    ]);

    return NextResponse.json({ success: true, message: 'Application saved successfully' });
  } catch (error) {
    console.error('Error saving application:', error);
    return NextResponse.json(
      { error: 'Failed to save application' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const conn = await getConnection();
    const [rows] = await conn.execute(
      'SELECT * FROM applications WHERE id = ?',
      [applicationId]
    );

    const results = rows as DatabaseRowPacket[];
    if (results.length === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const application = results[0];

    // Transform database format back to application format
    const applicationData = {
      id: application.id,
      jurisdiction: {
        id: application.jurisdiction_id,
        name: application.jurisdiction_name,
        price: application.jurisdiction_price,
        currency: application.jurisdiction_currency,
      },
      contactDetails: {
        firstName: application.contact_first_name || '',
        lastName: application.contact_last_name || '',
        email: application.contact_email || '',
        phone: application.contact_phone || '',
        address: {
          line1: application.contact_address_line1 || '',
          line2: application.contact_address_line2 || '',
          city: application.contact_city || '',
          county: application.contact_county || '',
          postcode: application.contact_postcode || '',
          country: application.contact_country || 'United Kingdom',
        },
      },
      companyDetails: {
        proposedName: application.company_proposed_name || '',
        alternativeName: application.company_alternative_name || '',
        businessActivity: application.company_business_activity || '',
        authorizedCapital: application.company_authorized_capital || 50000,
        numberOfShares: application.company_number_of_shares || 50000,
      },
      registeredAddress: {
        line1: application.registered_address_line1 || '',
        line2: application.registered_address_line2 || '',
        city: application.registered_city || '',
        county: application.registered_county || '',
        postcode: application.registered_postcode || '',
        country: application.registered_country || 'United Kingdom',
        useContactAddress: application.use_contact_address || false,
      },
      directors: JSON.parse(application.directors || '[]'),
      shareholders: JSON.parse(application.shareholders || '[]'),
      additionalServices: JSON.parse(application.additional_services || '[]'),
      stepCompleted: application.step_completed || 0,
      isComplete: application.is_complete || false,
      createdAt: application.created_at,
      updatedAt: application.updated_at,
    };

    return NextResponse.json(applicationData);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}