'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePortfolio } from '@/lib/portfolio-context';
import Footer from '@/components/ui/Footer';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { dispatch } = usePortfolio();
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const paymentIntentId = searchParams?.get('payment_intent');

  useEffect(() => {
    if (paymentIntentId) {
      // TODO: Fetch payment details from your backend if needed
      // For now, we'll just show success message
      setIsLoading(false);

      // Clear the portfolio after successful payment
      setTimeout(() => {
        dispatch({ type: 'CLEAR_PORTFOLIO' });
      }, 2000);
    } else {
      // No payment intent ID, redirect to portfolio
      router.push('/portfolio');
    }
  }, [paymentIntentId, router, dispatch]);

  const handleNewOrder = () => {
    router.push('/jurisdictions');
  };

  const handleViewOrders = () => {
    // TODO: Implement order history page
    router.push('/orders');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-38 py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-white text-lg">Confirming your payment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-38 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Payment <span className="text-green-400">Successful!</span>
            </h1>
            <p className="text-gray-300 text-lg">
              Thank you for your order. Your offshore company formation is now in progress.
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">What happens next?</h2>
            <div className="text-left space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4 mt-1 flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-white font-semibold">Confirmation Email</h3>
                  <p className="text-gray-400 text-sm">
                    You&apos;ll receive a detailed confirmation email with your order details and next steps.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4 mt-1 flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-white font-semibold">Document Preparation</h3>
                  <p className="text-gray-400 text-sm">
                    Our experts will begin preparing your incorporation documents and filings.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4 mt-1 flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-white font-semibold">Filing & Registration</h3>
                  <p className="text-gray-400 text-sm">
                    We&apos;ll file your documents with the appropriate authorities in your chosen jurisdiction.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-4 mt-1 flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-white font-semibold">Company Ready</h3>
                  <p className="text-gray-400 text-sm">
                    Receive your certificate of incorporation and company documents.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-900/30 border border-blue-500 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
            <p className="text-blue-200 text-sm mb-4">
              Our expert team is here to guide you through every step of the process.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-blue-200 text-sm">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@rapidcompanies.com
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                01904 925 200
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleNewOrder}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Start New Formation
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="border border-gray-600 text-gray-300 hover:bg-gray-700 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Contact Support
            </button>
          </div>

          {/* Payment Reference */}
          {paymentIntentId && (
            <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm">
                Payment Reference: <span className="text-white font-mono">{paymentIntentId}</span>
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Keep this reference for your records
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="pb-8"></div>
      <Footer />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 pt-38 py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}