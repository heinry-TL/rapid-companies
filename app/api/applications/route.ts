import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json() as Record<string, unknown>;

    // Extract fields
    const email = (applicationData.contactDetails as any)?.email;
    const companyName = (applicationData.companyDetails as any)?.proposedName;
    const jurisdictionName = (applicationData.jurisdiction as any)?.name;
    const stepCompleted = (applicationData as any).stepCompleted || 1;

    // Validate based on step - for early steps, we may not have all fields yet
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!jurisdictionName) {
      return NextResponse.json(
        { error: 'Jurisdiction is required' },
        { status: 400 }
      );
    }

    // Company name is only required from step 2 onwards
    if (stepCompleted >= 2 && !companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Try to find existing application by email and jurisdiction
    // This ensures we update the same record across multiple steps
    const { data: existingApp } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('contact_email', email)
      .eq('jurisdiction_name', jurisdictionName)
      .eq('payment_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Create final application identifier
    const application_identifier = companyName
      ? `${email.toLowerCase()}_${companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${jurisdictionName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      : (existingApp?.application_identifier || `${email.toLowerCase()}_temp_${jurisdictionName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`);

    // Prepare comprehensive application data for Supabase
    const applicationRecord: any = {
      application_identifier,
      jurisdiction_name: (applicationData.jurisdiction as any)?.name || '',
      jurisdiction_price: (applicationData.jurisdiction as any)?.price || 0,
      jurisdiction_currency: (applicationData.jurisdiction as any)?.currency || 'GBP',
      contact_first_name: (applicationData.contactDetails as any)?.firstName || null,
      contact_last_name: (applicationData.contactDetails as any)?.lastName || null,
      contact_email: email,
      contact_phone: (applicationData.contactDetails as any)?.phone || null,
      company_proposed_name: companyName || null,
      company_business_activity: (applicationData.companyDetails as any)?.businessActivity || null,
      internal_status: 'new',
      payment_status: 'pending',
      order_id: null,
      step_completed: stepCompleted,
      updated_at: new Date().toISOString()
    };

    // Add contact address if available
    if ((applicationData.contactDetails as any)?.address) {
      const address = (applicationData.contactDetails as any).address;
      applicationRecord.contact_address_line1 = address.street || null;
      applicationRecord.contact_city = address.city || null;
      applicationRecord.contact_county = address.state || null;
      applicationRecord.contact_postcode = address.postalCode || null;
      applicationRecord.contact_country = address.country || null;
    }

    // Add company details if available
    if ((applicationData.companyDetails as any)) {
      const company = (applicationData.companyDetails as any);
      applicationRecord.company_alternative_name = company.alternativeName || null;
      applicationRecord.company_authorized_capital = company.authorizedCapital || null;
      applicationRecord.company_number_of_shares = company.numberOfShares || null;
    }

    // Add registered address if available
    if ((applicationData as any).registeredAddress) {
      const regAddress = (applicationData as any).registeredAddress;
      applicationRecord.registered_address_line1 = regAddress.line1 || null;
      applicationRecord.registered_address_line2 = regAddress.line2 || null;
      applicationRecord.registered_city = regAddress.city || null;
      applicationRecord.registered_county = regAddress.county || null;
      applicationRecord.registered_postcode = regAddress.postcode || null;
      applicationRecord.registered_country = regAddress.country || null;
      applicationRecord.use_contact_address = regAddress.useContactAddress || false;
    }

    // Add directors as JSON if available
    if ((applicationData as any).directors) {
      applicationRecord.directors = JSON.stringify((applicationData as any).directors);
    }

    // Add shareholders as JSON if available
    if ((applicationData as any).shareholders) {
      applicationRecord.shareholders = JSON.stringify((applicationData as any).shareholders);
    }

    // Add additional services as JSON if available
    if ((applicationData as any).additionalServices) {
      applicationRecord.additional_services = JSON.stringify((applicationData as any).additionalServices);
    }

    let data, error;

    if (existingApp) {
      // Update existing application
      const updateResult = await supabaseAdmin
        .from('applications')
        .update(applicationRecord)
        .eq('id', existingApp.id)
        .select()
        .single();

      data = updateResult.data;
      error = updateResult.error;
    } else {
      // Create new application
      const insertResult = await supabaseAdmin
        .from('applications')
        .insert([applicationRecord])
        .select()
        .single();

      data = insertResult.data;
      error = insertResult.error;
    }

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Application saved successfully', data });
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

    const { data: application, error } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}