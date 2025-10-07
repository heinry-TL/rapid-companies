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
    // Store only minimal identifiers - we'll look up full data from database when payment succeeds
    const stripeMetadata: Record<string, string> = {
      order_id: (metadata as any).order_id || '',
      applications_count: (metadata as any).applications_count || '0',
      services_count: (metadata as any).services_count || '0',
      timestamp: new Date().toISOString(),
    };

    // Parse the full application data to extract minimal identifiers
    const applicationsJson = (metadata as any).applications || '[]';
    const servicesJson = (metadata as any).standalone_services || '[]';

    try {
      const apps = JSON.parse(applicationsJson);
      // Store only email + jurisdiction for lookup (much smaller)
      const appIdentifiers = apps.map((app: any) => ({
        email: app.contactDetails?.email,
        jurisdiction: app.jurisdiction?.name
      }));
      const appMetadata = JSON.stringify(appIdentifiers);
      console.log('Applications metadata length:', appMetadata.length);

      if (appMetadata.length > 500) {
        console.warn('Applications metadata too large, truncating');
        stripeMetadata.applications = '[]';
      } else {
        stripeMetadata.applications = appMetadata;
      }
    } catch (e) {
      console.error('Error parsing applications for metadata:', e);
      stripeMetadata.applications = '[]';
    }

    // For standalone services, store only IDs and names (small)
    try {
      const services = JSON.parse(servicesJson);
      const serviceIdentifiers = services.map((svc: any) => ({
        id: svc.id,
        name: svc.name,
        price: svc.price,
        currency: svc.currency
      }));
      const svcMetadata = JSON.stringify(serviceIdentifiers);
      console.log('Services metadata length:', svcMetadata.length);

      if (svcMetadata.length > 500) {
        console.warn('Services metadata too large, truncating');
        stripeMetadata.standalone_services = '[]';
      } else {
        stripeMetadata.standalone_services = svcMetadata;
      }
    } catch (e) {
      console.error('Error parsing services for metadata:', e);
      stripeMetadata.standalone_services = '[]';
    }

    console.log('Final metadata:', JSON.stringify(stripeMetadata, null, 2));

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
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        error: 'Failed to create payment intent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}