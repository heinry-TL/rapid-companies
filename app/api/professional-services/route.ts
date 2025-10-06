import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(_request: NextRequest) {
  try {
    const { data: rows, error } = await supabaseAdmin
      .from('professional_services')
      .select(`
        id,
        name,
        description,
        short_description,
        features,
        category,
        icon_svg,
        display_order,
        full_description,
        benefits,
        pricing,
        timeline,
        link_url,
        link_text
      `)
      .eq('active', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    // Parse JSON features and benefits for each service with error handling
    const services = (rows || []).map(service => {
      let features: string[] = [];
      let benefits: string[] = [];

      // Parse features
      if (service.features) {
        try {
          // Features should already be parsed as JSON from Supabase
          features = Array.isArray(service.features) ? service.features : JSON.parse(service.features);
        } catch {
          // If JSON parsing fails, try to extract comma-separated values
          const featuresStr = String(service.features);
          if (featuresStr.includes(',')) {
            features = featuresStr.split(',').map(f => f.trim().replace(/["\[\]]/g, ''));
          } else {
            // Single feature or malformed, just use as-is
            features = [featuresStr.replace(/["\[\]]/g, '')];
          }
        }
      }

      // Parse benefits
      if (service.benefits) {
        try {
          // Benefits should already be parsed as JSON from Supabase
          benefits = Array.isArray(service.benefits) ? service.benefits : JSON.parse(service.benefits);
        } catch {
          // If JSON parsing fails, try to extract comma-separated values
          const benefitsStr = String(service.benefits);
          if (benefitsStr.includes(',')) {
            benefits = benefitsStr.split(',').map(b => b.trim().replace(/["\[\]]/g, ''));
          } else {
            // Single benefit or malformed, just use as-is
            benefits = [benefitsStr.replace(/["\[\]]/g, '')];
          }
        }
      }

      return {
        ...service,
        features,
        benefits
      };
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Professional services API error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch professional services',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}