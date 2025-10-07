import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      order_id,
      stripe_payment_intent_id,
      customer_email,
      customer_name,
      customer_phone,
      total_amount,
      currency = 'GBP',
      payment_status = 'pending',
      applications_count = 0,
      services_count = 0,
      order_items,
      stripe_metadata,
    } = body;

    // Validate required fields
    if (!order_id || !total_amount) {
      return NextResponse.json(
        { error: 'Missing required fields: order_id, total_amount' },
        { status: 400 }
      );
    }

    // Insert order into database
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([{
        order_id,
        stripe_payment_intent_id,
        customer_email,
        customer_name,
        customer_phone,
        total_amount,
        currency,
        payment_status,
        applications_count,
        services_count,
        order_items,
        stripe_metadata,
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: data
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
