import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import type { PaymentIntentRequest } from '@/types/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PaymentIntentRequest;
    const {
      amount,
      currency = 'gbp',
      metadata = {},
      customer_email,
      description
    } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
      receipt_email: customer_email,
      description: description || 'Offshore Company Formation Services',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}