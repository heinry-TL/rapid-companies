import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log('Mail forwarding API - received data:', body);

    // Support both flat structure and nested formData structure
    let mailForwardingData;

    if (body.formData) {
      // Nested structure from form submission
      mailForwardingData = {
        entity_type: body.formData.entityType,
        entity_name: body.formData.entityName,
        contact_person: body.formData.contactPerson,
        email: body.formData.email,
        phone: body.formData.phone,
        address_line1: body.formData.address.line1,
        address_line2: body.formData.address.line2,
        city: body.formData.address.city,
        county: body.formData.address.county,
        postcode: body.formData.address.postcode,
        country: body.formData.address.country,
        jurisdiction: body.formData.jurisdiction,
        forwarding_frequency: body.formData.forwardingFrequency,
        service_users: body.formData.serviceUsers,
        additional_info: body.formData.additionalInfo || null,
        price: body.price,
        currency: body.currency || 'GBP',
        payment_status: 'pending',
        order_id: null, // Will be updated after payment
        status: 'pending',
      };
    } else {
      // Flat structure (legacy support)
      const {
        entity_type,
        entity_name,
        contact_person,
        email,
        phone,
        address_line1,
        address_line2,
        city,
        county,
        postcode,
        country,
        jurisdiction,
        forwarding_frequency,
        service_users,
        additional_info,
        price,
        currency = 'GBP',
        payment_status = 'pending',
        order_id,
      } = body;

      mailForwardingData = {
        entity_type,
        entity_name,
        contact_person,
        email,
        phone,
        address_line1,
        address_line2,
        city,
        county,
        postcode,
        country,
        jurisdiction,
        forwarding_frequency,
        service_users,
        additional_info,
        price,
        currency,
        payment_status,
        order_id,
        status: 'pending',
      };
    }

    // Validate required fields
    if (!mailForwardingData.entity_name || !mailForwardingData.contact_person ||
        !mailForwardingData.email || !mailForwardingData.phone ||
        !mailForwardingData.address_line1 || !mailForwardingData.city ||
        !mailForwardingData.postcode || !mailForwardingData.jurisdiction) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Inserting mail forwarding application:', mailForwardingData);

    // Insert mail forwarding application into database
    const { data, error } = await supabaseAdmin
      .from('mail_forwarding_applications')
      .insert([mailForwardingData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create mail forwarding application', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      application: data
    });

  } catch (error) {
    console.error('Mail forwarding application creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create mail forwarding application' },
      { status: 500 }
    );
  }
}

// GET all mail forwarding applications (for admin)
export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('mail_forwarding_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch mail forwarding applications' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mail forwarding applications' },
      { status: 500 }
    );
  }
}
