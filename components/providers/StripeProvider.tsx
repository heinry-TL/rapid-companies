'use client';

import React, { ReactNode } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { getStripePublishableKey } from '@/lib/stripe-client';

// Initialize Stripe
const stripePromise = loadStripe(getStripePublishableKey());

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export default function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const options = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: 'night' as const,
          variables: {
            colorPrimary: '#3B82F6',
            colorBackground: '#1F2937',
            colorText: '#F3F4F6',
            colorDanger: '#EF4444',
            fontFamily: 'system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
          rules: {
            '.Input': {
              backgroundColor: '#374151',
              border: '1px solid #4B5563',
              color: '#F3F4F6',
            },
            '.Input:focus': {
              border: '1px solid #3B82F6',
              boxShadow: '0 0 0 1px #3B82F6',
            },
            '.Label': {
              color: '#D1D5DB',
              fontSize: '14px',
              fontWeight: '500',
            },
            '.Error': {
              color: '#EF4444',
            },
          },
        },
      }
    : undefined;

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}