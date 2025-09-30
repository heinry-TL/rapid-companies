import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid jurisdiction ID' },
        { status: 400 }
      );
    }

    const { data: jurisdiction, error } = await supabaseAdmin
      .from('jurisdictions')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Jurisdiction not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Parse features field
    const processedJurisdiction = {
      ...jurisdiction,
      features: Array.isArray(jurisdiction.features) ? jurisdiction.features :
                (jurisdiction.features ? JSON.parse(jurisdiction.features) : [])
    };

    return NextResponse.json(processedJurisdiction);
  } catch (error) {
    console.error('Error fetching jurisdiction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jurisdiction' },
      { status: 500 }
    );
  }
}