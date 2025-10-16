import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { JurisdictionUpdateRequest } from '@/types/api';

export async function GET(_request: NextRequest) {
  try {
    const { data: rows, error } = await supabaseAdmin
      .from('jurisdictions')
      .select(`
        id,
        name,
        country_code,
        flag_url,
        description,
        formation_price,
        currency,
        vat_applicable,
        processing_time,
        features,
        status,
        created_at,
        updated_at
      `)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    const jurisdictions = (rows || []).map(row => {
      let features: string[] = [];

      try {
        if (Array.isArray(row.features)) {
          features = row.features;
        } else if (typeof row.features === 'string') {
          features = JSON.parse(row.features);
        }
      } catch {
        // If JSON parsing fails, treat as comma-separated string
        if (typeof row.features === 'string') {
          features = row.features.split(',').map(f => f.trim()).filter(f => f.length > 0);
        }
      }

      return {
        ...row,
        features
      };
    });

    return NextResponse.json({
      jurisdictions,
      total: jurisdictions.length
    });
  } catch (error) {
    console.error('Jurisdictions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jurisdictions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      country_code,
      flag_url,
      description,
      formation_price,
      currency,
      vat_applicable = false,
      processing_time,
      features,
      status = 'active'
    } = await request.json() as JurisdictionUpdateRequest & { name: string; country_code: string; formation_price: number; currency: string; vat_applicable?: boolean };

    if (!name || !country_code || !formation_price || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const featuresArray = Array.isArray(features) ? features : [];

    const { data, error } = await supabaseAdmin
      .from('jurisdictions')
      .insert([{
        name,
        country_code,
        flag_url,
        description,
        formation_price,
        currency,
        vat_applicable,
        processing_time,
        features: featuresArray,
        status
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      jurisdiction: {
        id: data.id,
        name,
        country_code,
        flag_url,
        description,
        formation_price,
        currency,
        vat_applicable,
        processing_time,
        features: featuresArray,
        status
      }
    });
  } catch (error) {
    console.error('Jurisdiction creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create jurisdiction' },
      { status: 500 }
    );
  }
}