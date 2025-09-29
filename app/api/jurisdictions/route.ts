import { NextRequest, NextResponse } from 'next/server';
import { getJurisdictions } from '@/lib/mysql';

export async function GET(_request: NextRequest) {
  try {
    const jurisdictions = await getJurisdictions();
    return NextResponse.json(jurisdictions);
  } catch (error) {
    console.error('Error fetching jurisdictions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jurisdictions' },
      { status: 500 }
    );
  }
}