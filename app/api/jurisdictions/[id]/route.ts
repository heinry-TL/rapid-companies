import { NextRequest, NextResponse } from 'next/server';
import { getJurisdictionById } from '@/lib/mysql';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid jurisdiction ID' },
        { status: 400 }
      );
    }

    const jurisdiction = await getJurisdictionById(id);

    if (!jurisdiction) {
      return NextResponse.json(
        { error: 'Jurisdiction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(jurisdiction);
  } catch (error) {
    console.error('Error fetching jurisdiction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jurisdiction' },
      { status: 500 }
    );
  }
}