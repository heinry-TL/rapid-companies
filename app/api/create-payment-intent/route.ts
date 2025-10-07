import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import type { PaymentIntentRequest } from '@/types/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PaymentIntentRequest;
    const {
      amount,
      currency = 'gbp',
      metadata = {}
    } = body;
    const customer_email = (body as any).customer_email;
    const description = (body as any).description;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Prepare metadata - Stripe limits each value to 500 characters
    // So we'll store minimal info in metadata and full data separately
    const stripeMetadata: Record<string, string> = {
      order_id: (metadata as any).order_id || '',
      applications_count: (metadata as any).applications_count || '0',
      services_count: (metadata as any).services_count || '0',
      timestamp: new Date().toISOString(),
    };

    // For applications and services, we need to include essential fields for order item creation
    // Keep jurisdiction info for applications and name/price for services
    const applicationsJson = (metadata as any).applications || '[]';
    const servicesJson = (metadata as any).standalone_services || '[]';

    // Parse and send minimal but necessary data for applications
    try {
      const apps = JSON.parse(applicationsJson);
      const minimalApps = apps.map((app: any) => ({
        id: app.id,
        jurisdiction: typeof app.jurisdiction === 'string'
          ? app.jurisdiction
          : app.jurisdiction?.name || 'Unknown',
        price: app.price || app.jurisdiction?.price || 0,
        currency: app.currency || app.jurisdiction?.currency || 'GBP'
      }));
      stripeMetadata.applications = JSON.stringify(minimalApps);
    } catch (e) {
      console.error('Error parsing applications for metadata:', e);
      stripeMetadata.applications = applicationsJson.substring(0, 400);
    }

    // Services can stay as-is since they're usually small
    stripeMetadata.standalone_services = servicesJson;

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: stripeMetadata,
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