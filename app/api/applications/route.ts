import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json() as Record<string, unknown>;

    // Create unique application identifier for upsert
    const email = (applicationData.contactDetails as any)?.email;
    const companyName = (applicationData.companyDetails as any)?.proposedName;
    const jurisdictionName = (applicationData.jurisdiction as any)?.name;

    if (!email || !companyName || !jurisdictionName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, company name, or jurisdiction' },
        { status: 400 }
      );
    }

    // Create application identifier based on unique combination
    const application_identifier = `${email.toLowerCase()}_${companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${jurisdictionName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    // Basic application data for Supabase
    const applicationRecord = {
      application_identifier,
      jurisdiction_name: (applicationData.jurisdiction as any)?.name || '',
      jurisdiction_price: (applicationData.jurisdiction as any)?.price || 0,
      jurisdiction_currency: (applicationData.jurisdiction as any)?.currency || 'GBP',
      contact_first_name: (applicationData.contactDetails as any)?.firstName || null,
      contact_last_name: (applicationData.contactDetails as any)?.lastName || null,
      contact_email: email,
      contact_phone: (applicationData.contactDetails as any)?.phone || null,
      company_proposed_name: companyName,
      company_business_activity: (applicationData.companyDetails as any)?.businessActivity || null,
      internal_status: 'new',
      payment_status: 'pending',
      order_id: null,
      step_completed: (applicationData as any).stepCompleted || 1,
      updated_at: new Date().toISOString()
    };

    // Use upsert to avoid duplicates
    const { data, error } = await supabaseAdmin
      .from('applications')
      .upsert([applicationRecord], {
        onConflict: 'application_identifier',
        ignoreDuplicates: false
      })
      .select()
      .single();

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