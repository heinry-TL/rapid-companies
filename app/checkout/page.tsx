'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePortfolio } from '@/lib/portfolio-context';
import StripeProvider from '@/components/providers/StripeProvider';
import CheckoutForm from '@/components/CheckoutForm';
import { formatCurrency } from '@/lib/currency';
import Footer from '@/components/ui/Footer';

export default function CheckoutPage() {
  const { state } = usePortfolio();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Calculate totals
  const getTotalAmount = () => {
    const applicationsTotal = state.applications.reduce((total, app) => {
      const appTotal = Number(app.jurisdiction.price) + app.additionalServices.reduce((sum, service) => sum + Number(service.price), 0);
      return total + appTotal;
    }, 0);

    const standaloneServicesTotal = state.standaloneServices.reduce((total, service) => {
      return total + Number(service.price);
    }, 0);

    const mailForwardingTotal = state.mailForwarding ? Number(state.mailForwarding.price) : 0;

    return applicationsTotal + standaloneServicesTotal + mailForwardingTotal;
  };

  const totalAmount = getTotalAmount();
  const currency = 'GBP';

  // Redirect if no items in portfolio
  useEffect(() => {
    if (state.applications.length === 0 && state.standaloneServices.length === 0 && !state.mailForwarding) {
      router.push('/portfolio');
      return;
    }

    if (totalAmount <= 0) {
      router.push('/portfolio');
      return;
    }

    createPaymentIntent();
  }, [state, totalAmount, router]);

  const createPaymentIntent = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Prepare order metadata with complete application data
      const orderMetadata = {
        order_id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        applications_count: state.applications.length.toString(),
        services_count: state.standaloneServices.length.toString(),
        mail_forwarding_count: state.mailForwarding ? '1' : '0',
        has_mail_forwarding: state.mailForwarding ? 'true' : 'false',
        applications: JSON.stringify(state.applications.map(app => ({
          id: app.id,
          jurisdiction: {
            name: app.jurisdiction.name,
            price: app.jurisdiction.price,
            currency: app.jurisdiction.currency,
          },
          contactDetails: app.contactDetails,
          companyDetails: app.companyDetails,
          registeredAddress: app.registeredAddress,
          directors: app.directors,
          shareholders: app.shareholders,
          additionalServices: app.additionalServices,
          stepCompleted: app.stepCompleted,
        }))),
        standalone_services: JSON.stringify(state.standaloneServices.map(service => ({
          id: service.id,
          name: service.name,
          price: service.price,
          currency: service.currency,
        }))),
        mail_forwarding: state.mailForwarding ? JSON.stringify({
          id: state.mailForwarding.id,
          price: state.mailForwarding.price,
          currency: state.mailForwarding.currency,
          formData: state.mailForwarding.formData,
        }) : null,
      };

      // Get customer email from first application or mail forwarding
      const customerEmail = state.applications.length > 0
        ? state.applications[0].contactDetails?.email
        : state.mailForwarding
        ? state.mailForwarding.formData.email
        : undefined;

      // DEBUG: Log what we're about to send
      console.log('=== CHECKOUT SENDING TO API ===');
      console.log('Mail forwarding in state:', state.mailForwarding);
      console.log('Order metadata mail_forwarding:', orderMetadata.mail_forwarding);
      console.log('Full metadata:', JSON.stringify(orderMetadata, null, 2));

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: currency,
          customer_email: customerEmail,
          metadata: orderMetadata,
          description: `Offshore Company Formation - ${state.applications.length} application(s), ${state.standaloneServices.length} service(s)${state.mailForwarding ? ', 1 mail forwarding' : ''}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Payment intent error:', errorData);
        throw new Error(errorData.details || 'Failed to create payment intent');
      }

      const { client_secret } = await response.json();
      setClientSecret(client_secret);

    } catch (err: any) {
      console.error('Error creating payment intent:', err);
      setError(err.message || 'Failed to initialize checkout');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    // Redirect to success page with payment intent ID
    router.push(`/payment/success?payment_intent=${paymentIntentId}`);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-38 py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-white text-lg">Initializing secure checkout...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait while we prepare your payment</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 pt-38 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-900/30 border border-red-500 rounded-xl p-8 text-center">
              <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-2xl font-bold text-red-300 mb-2">Checkout Error</h1>
              <p className="text-red-200 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/portfolio')}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Back to Portfolio
                </button>
                <button
                  onClick={createPaymentIntent}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-38 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Secure <span className="text-blue-400">Checkout</span>
            </h1>
            <p className="text-gray-300 text-lg">
              Complete your offshore company formation order
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                {/* Applications */}
                {state.applications.map((application, index) => (
                  <div key={application.id} className="mb-4 pb-4 border-b border-gray-600 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium">{application.jurisdiction.name}</p>
                        <p className="text-gray-400 text-sm">Company Formation</p>
                      </div>
                      <p className="text-white">
                        {formatCurrency(application.jurisdiction.price, application.jurisdiction.currency)}
                      </p>
                    </div>

                    {application.additionalServices.map((service) => (
                      <div key={service.id} className="flex justify-between items-center pl-4">
                        <p className="text-gray-400 text-sm">{service.name}</p>
                        <p className="text-gray-300 text-sm">
                          £{service.price.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Standalone Services */}
                {state.standaloneServices.map((service) => (
                  <div key={service.id} className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-medium">{service.name}</p>
                      <p className="text-gray-400 text-sm">Additional Service</p>
                    </div>
                    <p className="text-white">
                      £{service.price.toLocaleString()}
                    </p>
                  </div>
                ))}

                {/* Mail Forwarding Service */}
                {state.mailForwarding && (
                  <div className="mb-2 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">Mail Forwarding Service</p>
                        <p className="text-blue-400 text-sm">{state.mailForwarding.formData.jurisdiction}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          {state.mailForwarding.formData.entityType === 'company' ? 'Company' : 'Individual'}: {state.mailForwarding.formData.entityName}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Frequency: {state.mailForwarding.formData.forwardingFrequency}
                        </p>
                      </div>
                      <p className="text-white font-semibold">
                        £{state.mailForwarding.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-gray-600 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">Total</span>
                    <span className="text-2xl font-bold text-blue-400">
                      £{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Why Choose Us?</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-white text-sm font-medium">Secure Payment Processing</p>
                      <p className="text-gray-400 text-xs">Bank-level security with Stripe</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-white text-sm font-medium">Expert Support</p>
                      <p className="text-gray-400 text-xs">Professional guidance throughout</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-white text-sm font-medium">Money-Back Guarantee</p>
                      <p className="text-gray-400 text-xs">100% satisfaction guaranteed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6">Payment Details</h2>

              {clientSecret && (
                <StripeProvider clientSecret={clientSecret}>
                  <CheckoutForm
                    amount={totalAmount}
                    currency={currency}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </StripeProvider>
              )}
            </div>
          </div>

          {/* Back to Portfolio */}
          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/portfolio')}
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center justify-center mx-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Portfolio
            </button>
          </div>
        </div>
      </div>

      <div className="pb-8"></div>
      <Footer />
    </div>
  );
}