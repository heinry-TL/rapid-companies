import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json() as Record<string, unknown>;

    // Basic application data for Supabase (simplified structure)
    const applicationRecord = {
      jurisdiction_name: (applicationData.jurisdiction as any)?.name || '',
      jurisdiction_price: (applicationData.jurisdiction as any)?.price || 0,
      jurisdiction_currency: (applicationData.jurisdiction as any)?.currency || 'GBP',
      contact_first_name: (applicationData.contactDetails as any)?.firstName || null,
      contact_last_name: (applicationData.contactDetails as any)?.lastName || null,
      contact_email: (applicationData.contactDetails as any)?.email || null,
      contact_phone: (applicationData.contactDetails as any)?.phone || null,
      company_proposed_name: (applicationData.companyDetails as any)?.proposedName || null,
      company_business_activity: (applicationData.companyDetails as any)?.businessActivity || null,
      internal_status: 'new'
    };

    const { data, error } = await supabaseAdmin
      .from('applications')
      .insert([applicationRecord])
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