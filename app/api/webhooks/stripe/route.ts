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
    let applications: unknown[] = [];
    let standaloneServices: unknown[] = [];

    try {
      if ((metadata as any).applications) {
        applications = JSON.parse((metadata as any).applications);
      }
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
        if (app.id) {
          // Prepare complete application update data
          const updateData: any = {
            payment_status: 'paid',
            order_id: orderId,
            internal_status: 'paid',
            updated_at: new Date().toISOString(),
          };

          // Add contact details if available
          if (app.contactDetails) {
            updateData.contact_first_name = app.contactDetails.firstName;
            updateData.contact_last_name = app.contactDetails.lastName;
            updateData.contact_email = app.contactDetails.email;
            updateData.contact_phone = app.contactDetails.phone;
            if (app.contactDetails.address) {
              updateData.contact_address_line1 = app.contactDetails.address.street;
              updateData.contact_city = app.contactDetails.address.city;
              updateData.contact_county = app.contactDetails.address.state;
              updateData.contact_postcode = app.contactDetails.address.postalCode;
              updateData.contact_country = app.contactDetails.address.country;
            }
          }

          // Add company details if available
          if (app.companyDetails) {
            updateData.company_proposed_name = app.companyDetails.proposedName;
            updateData.company_alternative_name = app.companyDetails.alternativeName;
            updateData.company_business_activity = app.companyDetails.businessActivity;
            updateData.company_authorized_capital = app.companyDetails.authorizedCapital;
            updateData.company_number_of_shares = app.companyDetails.numberOfShares;
          }

          // Add registered address if available
          if (app.registeredAddress) {
            updateData.registered_address_line1 = app.registeredAddress.line1;
            updateData.registered_address_line2 = app.registeredAddress.line2;
            updateData.registered_city = app.registeredAddress.city;
            updateData.registered_county = app.registeredAddress.county;
            updateData.registered_postcode = app.registeredAddress.postcode;
            updateData.registered_country = app.registeredAddress.country;
            updateData.use_contact_address = app.registeredAddress.useContactAddress;
          }

          // Add directors, shareholders, and additional services as JSON
          if (app.directors) {
            updateData.directors = JSON.stringify(app.directors);
          }

          if (app.shareholders) {
            updateData.shareholders = JSON.stringify(app.shareholders);
          }

          if (app.additionalServices) {
            updateData.additional_services = JSON.stringify(app.additionalServices);
          }

          if (app.stepCompleted) {
            updateData.step_completed = app.stepCompleted;
          }

          // Update the application
          await supabaseAdmin
            .from('applications')
            .update(updateData)
            .eq('id', app.id);
        }
      }
    }

    // Create applications for standalone services (services purchased without company formation)
    if (standaloneServices && standaloneServices.length > 0) {
      for (const service of standaloneServices) {
        // Create a unique identifier for the service application
        const serviceApplicationIdentifier = `service_${orderId}_${service.id || service.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

        // Create an application record for each standalone service with billing info
        const serviceApplication = {
          application_identifier: serviceApplicationIdentifier,
          jurisdiction_name: service.name, // Use service name as jurisdiction for standalone services
          jurisdiction_price: service.price,
          jurisdiction_currency: service.currency || 'GBP',
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
          company_proposed_name: `Standalone Service: ${service.name}`,
          company_business_activity: 'Additional Service Purchase',
          internal_status: 'paid',
          payment_status: 'paid',
          order_id: orderId,
          step_completed: 3, // Mark as completed since payment is done
          additional_services: { standalone_service: service },
          updated_at: new Date().toISOString()
        };

        await supabaseAdmin
          .from('applications')
          .upsert([serviceApplication], {
            onConflict: 'application_identifier',
            ignoreDuplicates: false
          });
      }

      console.log(`Created ${standaloneServices.length} service-only application(s) for order ${orderId}`);
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