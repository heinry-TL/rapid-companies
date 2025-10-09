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
    let mailForwarding: any = null;

    try {
      // Parse mail forwarding from metadata
      if (metadata.mail_forwarding) {
        try {
          mailForwarding = JSON.parse(metadata.mail_forwarding);
          console.log('Mail forwarding data found:', mailForwarding);
        } catch (mfParseError) {
          console.error('Error parsing mail forwarding metadata:', mfParseError);
        }
      }

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
        standaloneServices: standaloneServices.length,
        mailForwarding: mailForwarding ? 'yes' : 'no'
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
      paid_at: new Date().toISOString(),
      mail_forwarding_count: mailForwarding ? 1 : 0,
      has_mail_forwarding: mailForwarding ? true : false
    };

    // Create the order with items using the database abstraction
    console.log('Creating order with items...');
    await db.createOrderWithItems(orderData, applications, standaloneServices);
    console.log('Order created successfully with items');

    // Update mail forwarding application status if exists
    // Mail forwarding was already saved to database with pending status
    // Now we just need to update it to paid and link it to the order
    const hasMailForwarding = metadata.has_mail_forwarding === 'true';

    if (hasMailForwarding && mailForwarding) {
      try {
        console.log('Updating mail forwarding status to paid');

        // Look up the pending mail forwarding by email and jurisdiction
        const email = mailForwarding.email || customerEmail;
        const jurisdiction = mailForwarding.jurisdiction;

        if (email && jurisdiction) {
          // Find the most recent pending mail forwarding for this email + jurisdiction
          const { data: pendingMF, error: lookupError } = await supabaseAdmin
            .from('mail_forwarding_applications')
            .select('*')
            .eq('email', email)
            .eq('jurisdiction', jurisdiction)
            .eq('payment_status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (lookupError) {
            console.error('Error looking up pending mail forwarding:', lookupError);
          } else if (pendingMF) {
            // Update the mail forwarding to mark as paid and link to order
            const { error: updateError } = await supabaseAdmin
              .from('mail_forwarding_applications')
              .update({
                payment_status: 'paid',
                status: 'active',
                order_id: orderId,
                updated_at: new Date().toISOString(),
              })
              .eq('id', pendingMF.id);

            if (updateError) {
              console.error('Error updating mail forwarding status:', updateError);
            } else {
              console.log(`Mail forwarding application ${pendingMF.id} marked as paid for order ${orderId}`);
            }
          } else {
            console.warn('No pending mail forwarding found for email:', email, 'jurisdiction:', jurisdiction);
          }
        } else {
          console.warn('Missing email or jurisdiction for mail forwarding update');
        }
      } catch (mfError) {
        console.error('Error processing mail forwarding status update:', mfError);
      }
    }

    // LEGACY: Save mail forwarding if full formData is available (backward compatibility)
    if (mailForwarding && mailForwarding.formData) {
      try {
        console.log('Legacy path: Creating new mail forwarding record from full formData');
        const mailForwardingData = {
          entity_type: mailForwarding.formData.entityType,
          entity_name: mailForwarding.formData.entityName,
          contact_person: mailForwarding.formData.contactPerson,
          email: mailForwarding.formData.email,
          phone: mailForwarding.formData.phone,
          address_line1: mailForwarding.formData.address.line1,
          address_line2: mailForwarding.formData.address.line2,
          city: mailForwarding.formData.address.city,
          county: mailForwarding.formData.address.county,
          postcode: mailForwarding.formData.address.postcode,
          country: mailForwarding.formData.address.country,
          jurisdiction: mailForwarding.formData.jurisdiction,
          forwarding_frequency: mailForwarding.formData.forwardingFrequency,
          service_users: mailForwarding.formData.serviceUsers,
          additional_info: mailForwarding.formData.additionalInfo || null,
          price: mailForwarding.price,
          currency: mailForwarding.currency || 'GBP',
          payment_status: 'paid',
          order_id: orderId,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: mfData, error: mfError } = await supabaseAdmin
          .from('mail_forwarding_applications')
          .insert([mailForwardingData])
          .select()
          .single();

        if (mfError) {
          console.error('Error saving mail forwarding application:', mfError);
        } else {
          console.log(`Mail forwarding application saved successfully for order ${orderId}:`, mfData.id);
        }
      } catch (mfSaveError) {
        console.error('Error processing mail forwarding save:', mfSaveError);
      }
    }

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