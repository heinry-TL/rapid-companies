import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { db } from '@/lib/database';
import { supabaseAdmin } from '@/lib/supabase';
import type { StripeWebhookEvent } from '@/types/api';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature')!;

    let event: StripeWebhookEvent;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err instanceof Error ? err.message : 'Unknown error');
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

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(paymentIntent: Record<string, unknown>) {
  try {
    // Extract order details from metadata
    const metadata = paymentIntent.metadata;
    const orderId = (metadata as any).order_id;

    // Extract customer and billing details from Stripe
    const chargeData = (paymentIntent.charges as any)?.data?.[0];
    const billingDetails = chargeData?.billing_details;

    const customerEmail = paymentIntent.receipt_email || billingDetails?.email;
    const billingName = billingDetails?.name || (metadata as any).customer_name;
    const customerPhone = billingDetails?.phone || (metadata as any).customer_phone;
    const billingAddress = billingDetails?.address;

    console.log('Processing successful payment:', {
      paymentIntentId: paymentIntent.id,
      amount: ((paymentIntent.amount as number) as number) / 100,
      currency: (paymentIntent.currency as string),
      orderId,
      customerEmail,
    });

    if (!orderId) {
      console.error('No order_id in payment intent metadata');
      return;
    }

    // Parse order items from metadata
    let applications: any[] = [];
    let standaloneServices: any[] = [];

    try {
      // Parse application identifiers from metadata and look up from database
      if ((metadata as any).applications) {
        try {
          const appIdentifiers = JSON.parse((metadata as any).applications);

          // Look up each application from database by email + jurisdiction
          for (const identifier of appIdentifiers) {
            if (identifier.email && identifier.jurisdiction) {
              const { data: dbApp } = await supabaseAdmin
                .from('applications')
                .select('*')
                .eq('contact_email', identifier.email)
                .eq('jurisdiction_name', identifier.jurisdiction)
                .eq('payment_status', 'pending')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

              if (dbApp) {
                // Parse JSON fields back into objects
                if (dbApp.directors && typeof dbApp.directors === 'string') {
                  dbApp.directors = JSON.parse(dbApp.directors);
                }
                if (dbApp.shareholders && typeof dbApp.shareholders === 'string') {
                  dbApp.shareholders = JSON.parse(dbApp.shareholders);
                }
                if (dbApp.additional_services && typeof dbApp.additional_services === 'string') {
                  dbApp.additionalServices = JSON.parse(dbApp.additional_services);
                }

                applications.push(dbApp);
              }
            }
          }
        } catch (appParseError) {
          console.error('Error parsing applications metadata:', appParseError);
        }
      }

      // Parse standalone services
      if ((metadata as any).standalone_services) {
        standaloneServices = JSON.parse((metadata as any).standalone_services);
      }
    } catch (parseError) {
      console.error('Error parsing order metadata:', parseError);
    }

    // Create order data with billing information
    const orderData = {
      order_id: orderId,
      stripe_payment_intent_id: paymentIntent.id,
      customer_email: customerEmail,
      customer_name: billingName,
      customer_phone: customerPhone,
      billing_name: billingName,
      billing_address_line1: billingAddress?.line1,
      billing_address_line2: billingAddress?.line2,
      billing_city: billingAddress?.city,
      billing_state: billingAddress?.state,
      billing_postal_code: billingAddress?.postal_code,
      billing_country: billingAddress?.country,
      total_amount: (paymentIntent.amount as number) / 100, // Convert from cents
      currency: (paymentIntent.currency as string).toUpperCase(),
      payment_status: 'paid',
      stripe_metadata: metadata,
      paid_at: new Date().toISOString()
    };

    // Create the order with items using the database abstraction
    await db.createOrderWithItems(orderData, applications, standaloneServices);

    // Update applications to mark them as paid and link to order
    if (applications && applications.length > 0) {
      for (const app of applications) {
        // We already have the full database record with ID, so just update payment status
        if (!app.id) {
          console.error('Application missing ID, skipping update');
          continue;
        }

        // Update only the payment-related fields
        const updateData: any = {
          payment_status: 'paid',
          order_id: orderId,
          internal_status: 'paid',
          updated_at: new Date().toISOString(),
        };

        // Update the application using the database ID
        await supabaseAdmin
          .from('applications')
          .update(updateData)
          .eq('id', app.id);

        console.log(`Updated application ${app.id} - marked as paid for order ${orderId}`);
      }
    }

    // Create ONE application for standalone services (services purchased without company formation)
    if (standaloneServices && standaloneServices.length > 0) {
      // Calculate total price for all standalone services
      const totalServicePrice = standaloneServices.reduce((sum, service) => sum + Number(service.price), 0);

      // Create a unique identifier for the service-only application
      const serviceApplicationIdentifier = `service_${orderId}`;

      // Create ONE application record with all standalone services in additional_services field
      const serviceApplication = {
        application_identifier: serviceApplicationIdentifier,
        jurisdiction_name: 'Standalone Services', // Generic name for service-only orders
        jurisdiction_price: 0, // No jurisdiction formation fee
        jurisdiction_currency: standaloneServices[0]?.currency || 'GBP',
        contact_email: customerEmail,
        contact_first_name: billingName?.split(' ')[0] || null,
        contact_last_name: billingName?.split(' ').slice(1).join(' ') || null,
        billing_name: billingName,
        billing_address: billingAddress ? {
          line1: billingAddress.line1,
          line2: billingAddress.line2,
          city: billingAddress.city,
          state: billingAddress.state,
          postal_code: billingAddress.postal_code,
          country: billingAddress.country
        } : null,
        company_proposed_name: `Standalone Services Order`,
        company_business_activity: 'Additional Services Purchase',
        internal_status: 'paid',
        payment_status: 'paid',
        order_id: orderId,
        step_completed: 3, // Mark as completed since payment is done
        additional_services: JSON.stringify(standaloneServices), // Store ALL services in one field
        updated_at: new Date().toISOString()
      };

      await supabaseAdmin
        .from('applications')
        .upsert([serviceApplication], {
          onConflict: 'application_identifier',
          ignoreDuplicates: false
        });

      console.log(`Created ONE service-only application with ${standaloneServices.length} service(s) for order ${orderId}`);
    }

    console.log(`Order ${orderId} successfully saved to database and applications updated`);

  } catch (error) {
    console.error('Error handling successful payment:', error);
    // You might want to add this to a retry queue
  }
}

async function handleFailedPayment(paymentIntent: Record<string, unknown>) {
  try {
    const metadata = paymentIntent.metadata;
    const orderId = (metadata as any).order_id;

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
      total_amount: (paymentIntent.amount as number) / 100,
      currency: (paymentIntent.currency as string).toUpperCase(),
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

    // Update applications to mark payment as failed
    const applications = [];
    try {
      if ((metadata as any).applications) {
        const parsedApps = JSON.parse((metadata as any).applications);
        for (const app of parsedApps) {
          if (app.id) {
            await supabaseAdmin
              .from('applications')
              .update({
                payment_status: 'failed',
                order_id: orderId,
                updated_at: new Date().toISOString()
              })
              .eq('id', app.id);
          }
        }
      }
    } catch (error) {
      console.error('Error updating application payment status to failed:', error);
    }

    console.log(`Order ${orderId} marked as failed in database and applications updated`);

  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}