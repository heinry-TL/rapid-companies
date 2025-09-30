import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(_request: NextRequest) {
  try {
    const { data: jurisdictions, error } = await supabaseAdmin
      .from('jurisdictions')
      .select('*')
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    // Parse features field for each jurisdiction
    const processedJurisdictions = (jurisdictions || []).map(jurisdiction => ({
      ...jurisdiction,
      features: Array.isArray(jurisdiction.features) ? jurisdiction.features :
                (jurisdiction.features ? JSON.parse(jurisdiction.features) : [])
    }));

    return NextResponse.json(processedJurisdictions);
  } catch (error) {
    console.error('Error fetching jurisdictions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jurisdictions' },
      { status: 500 }
    );
  }
}