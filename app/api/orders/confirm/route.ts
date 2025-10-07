import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/database';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { payment_intent_id } = await req.json();

    if (!payment_intent_id) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Retrieve payment intent from Stripe to verify it was successful
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment has not succeeded yet' },
        { status: 400 }
      );
    }

    // Extract order details from metadata
    const metadata = paymentIntent.metadata;
    const orderId = metadata.order_id;

    // Extract customer and billing details from Stripe
    const chargeData = (paymentIntent.charges as any)?.data?.[0];
    const billingDetails = chargeData?.billing_details;

    const customerEmail = paymentIntent.receipt_email || billingDetails?.email;
    const billingName = billingDetails?.name || metadata.customer_name;
    const billingAddress = billingDetails?.address;

    if (!orderId) {
      return NextResponse.json(
        { error: 'No order_id in payment intent metadata' },
        { status: 400 }
      );
    }

    // Check if order already exists
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('order_id', orderId)
      .single();

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        message: 'Order already exists',
        order_id: orderId
      });
    }

    // Parse order items from metadata
    let applications: any[] = [];
    let standaloneServices: any[] = [];

    try {
      // Parse application identifiers from metadata and look up from database
      if (metadata.applications) {
        try {
          const appIdentifiers = JSON.parse(metadata.applications);

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
      if (metadata.standalone_services) {
        try {
          standaloneServices = JSON.parse(metadata.standalone_services);
        } catch (svcParseError) {
          console.error('Error parsing standalone_services metadata:', svcParseError);
        }
      }

      console.log('Order items:', {
        orderId,
        applications: applications.length,
        standaloneServices: standaloneServices.length
      });
    } catch (parseError) {
      console.error('Error parsing order metadata:', parseError);
    }

    // Create order data with billing information
    const orderData = {
      order_id: orderId,
      stripe_payment_intent_id: paymentIntent.id,
      customer_email: customerEmail,
      customer_name: billingName,
      billing_name: billingName,
      billing_address_line1: billingAddress?.line1,
      billing_address_line2: billingAddress?.line2,
      billing_city: billingAddress?.city,
      billing_state: billingAddress?.state,
      billing_postal_code: billingAddress?.postal_code,
      billing_country: billingAddress?.country,
      total_amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency.toUpperCase(),
      payment_status: 'paid',
      stripe_metadata: metadata,
      paid_at: new Date().toISOString()
    };

    // Create the order with items using the database abstraction
    console.log('Creating order with items...');
    await db.createOrderWithItems(orderData, applications, standaloneServices);
    console.log('Order created successfully with items');

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

    console.log(`Order ${orderId} successfully saved to database from client confirmation`);

    return NextResponse.json({
      success: true,
      message: 'Order confirmed and saved successfully',
      order_id: orderId
    });

  } catch (error) {
    console.error('Error confirming order:', error);
    return NextResponse.json(
      { error: 'Failed to confirm order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}