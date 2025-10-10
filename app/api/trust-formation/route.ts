import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log('Trust formation API - received data:', body);

    // Extract data from request
    const {
      provideDetailsNow,
      contactFirstName,
      contactLastName,
      contactEmail,
      contactPhone,
      jurisdiction,
      jurisdictionPrice,
      trustName,
      trustType,
      trustPurpose,
      settlor,
      trustees,
      beneficiaries,
      additionalNotes,
      specialInstructions,
      price,
      currency = 'GBP',
    } = body;

    // Validate required fields
    if (!contactFirstName || !contactLastName || !contactEmail || !contactPhone || !jurisdiction) {
      return NextResponse.json(
        { error: 'Missing required contact information' },
        { status: 400 }
      );
    }

    // Prepare data for database
    const trustFormationData: any = {
      details_provided_now: provideDetailsNow ?? true,
      contact_first_name: contactFirstName,
      contact_last_name: contactLastName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      jurisdiction,
      price: price || jurisdictionPrice,
      currency,
      payment_status: 'pending',
      order_id: null, // Will be set after payment
      status: 'pending', // Will be updated based on payment and details
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // If details provided now, include all the trust information
    if (provideDetailsNow) {
      if (!trustName || !trustType) {
        return NextResponse.json(
          { error: 'Missing required trust details' },
          { status: 400 }
        );
      }

      trustFormationData.trust_name = trustName;
      trustFormationData.trust_type = trustType;
      trustFormationData.trust_purpose = trustPurpose || null;

      // Settlor information
      if (settlor) {
        trustFormationData.settlor_title = settlor.title;
        trustFormationData.settlor_first_name = settlor.firstName;
        trustFormationData.settlor_last_name = settlor.lastName;
        trustFormationData.settlor_email = settlor.email;
        trustFormationData.settlor_phone = settlor.phone;
        trustFormationData.settlor_date_of_birth = settlor.dateOfBirth;
        trustFormationData.settlor_nationality = settlor.nationality;
        trustFormationData.settlor_address_line1 = settlor.address?.line1;
        trustFormationData.settlor_address_line2 = settlor.address?.line2;
        trustFormationData.settlor_city = settlor.address?.city;
        trustFormationData.settlor_state = settlor.address?.state;
        trustFormationData.settlor_postal_code = settlor.address?.postalCode;
        trustFormationData.settlor_country = settlor.address?.country;
        trustFormationData.settlor_id_type = settlor.idType;
        trustFormationData.settlor_id_number = settlor.idNumber;
      }

      // Trustees (stored as JSONB)
      if (trustees && trustees.length > 0) {
        trustFormationData.trustees = JSON.stringify(trustees);
      }

      // Beneficiaries (stored as JSONB)
      if (beneficiaries && beneficiaries.length > 0) {
        trustFormationData.beneficiaries = JSON.stringify(beneficiaries);
      }

      // Additional information
      trustFormationData.additional_notes = additionalNotes || null;
      trustFormationData.special_instructions = specialInstructions || null;
    }

    console.log('Inserting trust formation application:', {
      ...trustFormationData,
      trustees: trustees ? `${trustees.length} trustees` : 'none',
      beneficiaries: beneficiaries ? `${beneficiaries.length} beneficiaries` : 'none',
    });

    // Insert into database
    const { data, error } = await supabaseAdmin
      .from('trust_formation_applications')
      .insert([trustFormationData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create trust formation application', details: error.message },
        { status: 500 }
      );
    }

    console.log('Trust formation application saved with ID:', data.id);

    return NextResponse.json({
      success: true,
      application: data,
      message: provideDetailsNow
        ? 'Trust formation application saved successfully'
        : 'Application saved - details to be provided after payment',
    });

  } catch (error) {
    console.error('Trust formation application creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create trust formation application', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET all trust formation applications (for admin)
export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('trust_formation_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch trust formation applications' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trust formation applications' },
      { status: 500 }
    );
  }
}
