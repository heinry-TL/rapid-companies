import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { getConnection } from '@/lib/mysql';

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
  const db = await getConnection();

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

    // Create the main order record
    await db.execute(
      `INSERT INTO orders (
        order_id,
        stripe_payment_intent_id,
        customer_email,
        total_amount,
        currency,
        payment_status,
        applications_count,
        services_count,
        order_items,
        stripe_metadata,
        paid_at
      ) VALUES (?, ?, ?, ?, ?, 'paid', ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        payment_status = 'paid',
        paid_at = NOW(),
        updated_at = NOW()`,
      [
        orderId,
        paymentIntent.id,
        customerEmail,
        paymentIntent.amount / 100, // Convert from cents
        paymentIntent.currency.toUpperCase(),
        applications.length,
        standaloneServices.length,
        JSON.stringify({ applications, standalone_services: standaloneServices }),
        JSON.stringify(metadata)
      ]
    );

    // Insert individual order items for applications
    for (const app of applications) {
      await db.execute(
        `INSERT INTO order_items (
          order_id,
          item_type,
          item_name,
          jurisdiction_name,
          unit_price,
          quantity,
          total_price,
          currency,
          item_metadata
        ) VALUES (?, 'application', ?, ?, ?, 1, ?, ?, ?)`,
        [
          orderId,
          `${app.jurisdiction} Company Formation`,
          app.jurisdiction,
          app.price,
          app.price,
          app.currency || 'GBP',
          JSON.stringify(app)
        ]
      );
    }

    // Insert individual order items for standalone services
    for (const service of standaloneServices) {
      await db.execute(
        `INSERT INTO order_items (
          order_id,
          item_type,
          item_name,
          unit_price,
          quantity,
          total_price,
          currency,
          item_metadata
        ) VALUES (?, 'service', ?, ?, 1, ?, ?, ?)`,
        [
          orderId,
          service.name,
          service.price,
          service.price,
          service.currency || 'GBP',
          JSON.stringify(service)
        ]
      );
    }

    console.log(`Order ${orderId} successfully saved to database`);

  } catch (error) {
    console.error('Error handling successful payment:', error);
    // You might want to add this to a retry queue
  } finally {
    await db.end();
  }
}

async function handleFailedPayment(paymentIntent: any) {
  const db = await getConnection();

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

    // Update order status to failed
    await db.execute(
      `INSERT INTO orders (
        order_id,
        stripe_payment_intent_id,
        total_amount,
        currency,
        payment_status,
        stripe_metadata
      ) VALUES (?, ?, ?, ?, 'failed', ?)
      ON DUPLICATE KEY UPDATE
        payment_status = 'failed',
        updated_at = NOW()`,
      [
        orderId,
        paymentIntent.id,
        paymentIntent.amount / 100,
        paymentIntent.currency.toUpperCase(),
        JSON.stringify(metadata)
      ]
    );

    console.log(`Order ${orderId} marked as failed in database`);

  } catch (error) {
    console.error('Error handling failed payment:', error);
  } finally {
    await db.end();
  }
}