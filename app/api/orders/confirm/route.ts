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
      // Try to parse applications from metadata
      if (metadata.applications) {
        try {
          applications = JSON.parse(metadata.applications);
        } catch (appParseError) {
          console.error('Error parsing applications metadata:', appParseError);
          // If metadata has application_ids, look them up from database
          if (metadata.application_ids) {
            const appIds = metadata.application_ids.split(',');
            const { data: dbApplications } = await supabaseAdmin
              .from('applications')
              .select('*')
              .in('id', appIds);

            if (dbApplications) {
              applications = dbApplications;
            }
          }
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
            updateData.directors = typeof app.directors === 'string' ? app.directors : JSON.stringify(app.directors);
          }

          if (app.shareholders) {
            updateData.shareholders = typeof app.shareholders === 'string' ? app.shareholders : JSON.stringify(app.shareholders);
          }

          if (app.additionalServices) {
            updateData.additional_services = typeof app.additionalServices === 'string' ? app.additionalServices : JSON.stringify(app.additionalServices);
          } else if (app.additional_services) {
            updateData.additional_services = typeof app.additional_services === 'string' ? app.additional_services : JSON.stringify(app.additional_services);
          }

          if (app.stepCompleted) {
            updateData.step_completed = app.stepCompleted;
          } else if (app.step_completed) {
            updateData.step_completed = app.step_completed;
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