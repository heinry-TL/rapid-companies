import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { db } from '@/lib/database';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature')!;

    let event: any;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent succeeded:', paymentIntent.id);

        // TODO: Update your database with successful payment
        // You can access metadata from paymentIntent.metadata
        await handleSuccessfulPayment(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);

        // TODO: Handle failed payment
        await handleFailedPayment(failedPayment);
        break;

      case 'payment_method.attached':
        const paymentMethod = event.data.object;
        console.log('PaymentMethod attached:', paymentMethod.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(paymentIntent: any) {
  try {
    // Extract order details from metadata
    const metadata = paymentIntent.metadata;
    const orderId = metadata.order_id;
    const customerEmail = paymentIntent.receipt_email ||
                         paymentIntent.charges?.data?.[0]?.billing_details?.email;

    console.log('Processing successful payment:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      orderId,
      customerEmail,
    });

    if (!orderId) {
      console.error('No order_id in payment intent metadata');
      return;
    }

    // Parse order items from metadata
    let applications = [];
    let standaloneServices = [];

    try {
      if (metadata.applications) {
        applications = JSON.parse(metadata.applications);
      }
      if (metadata.standalone_services) {
        standaloneServices = JSON.parse(metadata.standalone_services);
      }
    } catch (parseError) {
      console.error('Error parsing order metadata:', parseError);
    }

    // Create order data
    const orderData = {
      order_id: orderId,
      stripe_payment_intent_id: paymentIntent.id,
      customer_email: customerEmail,
      total_amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency.toUpperCase(),
      payment_status: 'paid',
      stripe_metadata: metadata,
      paid_at: new Date().toISOString()
    };

    // Create the order with items using the database abstraction
    await db.createOrderWithItems(orderData, applications, standaloneServices);

    console.log(`Order ${orderId} successfully saved to database`);

  } catch (error) {
    console.error('Error handling successful payment:', error);
    // You might want to add this to a retry queue
  }
}

async function handleFailedPayment(paymentIntent: any) {
  try {
    const metadata = paymentIntent.metadata;
    const orderId = metadata.order_id;

    console.log('Processing failed payment:', {
      paymentIntentId: paymentIntent.id,
      orderId,
      lastPaymentError: paymentIntent.last_payment_error,
    });

    if (!orderId) {
      console.error('No order_id in payment intent metadata');
      return;
    }

    // Create order data for failed payment
    const orderData = {
      order_id: orderId,
      stripe_payment_intent_id: paymentIntent.id,
      total_amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      payment_status: 'failed',
      stripe_metadata: metadata
    };

    // Update or create the order with failed status
    await db.updateOrder(orderId, {
      payment_status: 'failed',
      stripe_payment_intent_id: paymentIntent.id,
      stripe_metadata: metadata
    }).catch(async () => {
      // If update fails, try to create the order
      await db.createOrder(orderData);
    });

    console.log(`Order ${orderId} marked as failed in database`);

  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}