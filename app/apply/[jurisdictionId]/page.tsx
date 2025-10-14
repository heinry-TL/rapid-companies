'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { usePortfolio, createEmptyApplication } from '@/lib/portfolio-context';
import ApplicationFormNew from '@/components/ApplicationFormNew';
import Footer from '@/components/ui/Footer';

if (typeof window !== 'undefined') {
  gsap.registerPlugin();
}

interface Jurisdiction {
  id: number;
  name: string;
  country_code: string;
  flag_url: string;
  description: string;
  formation_price: number;
  currency: string;
  processing_time: string;
  features: string[];
  status: 'active' | 'inactive';
}

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { state, dispatch } = usePortfolio();
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchJurisdiction = async () => {
      try {
        const response = await fetch(`/api/jurisdictions/${params.jurisdictionId}`);
        if (!response.ok) {
          throw new Error('Jurisdiction not found');
        }
        const data = await response.json();
        setJurisdiction(data);

        // Check if we already have an application for this jurisdiction
        const existingApp = state.applications.find(
          app => app.jurisdiction.id === data.id
        );

        if (!existingApp) {
          // Create new application only if one doesn't exist
          const newApplication = createEmptyApplication({
            id: data.id,
            name: data.name,
            price: data.formation_price,
            currency: data.currency,
          });

          dispatch({ type: 'ADD_APPLICATION', payload: newApplication });
        } else {
          // Set existing application as current
          dispatch({ type: 'SET_CURRENT_APPLICATION', payload: existingApp.id });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (params.jurisdictionId) {
      fetchJurisdiction();
    }
  }, [params.jurisdictionId, dispatch]);

  useEffect(() => {
    if (typeof window === "undefined" || loading) return;

    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
      }
    );
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading application form...</div>
      </div>
    );
  }

  if (error || !jurisdiction) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">
            {error || 'Jurisdiction not found'}
          </div>
          <button
            onClick={() => router.push('/jurisdictions')}
            className="text-blue-400 hover:text-blue-300"
          >
            ← Back to Jurisdictions
          </button>
        </div>
      </div>
    );
  }

  const currentApplication = state.applications.find(
    app => app.jurisdiction.id === jurisdiction.id
  );

  if (!currentApplication) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Setting up application...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-38 py-10">
      <div className="container mx-auto px-4">
        <div ref={headerRef} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Company Formation Application
          </h1>
          <p className="text-white mb-4">
            {jurisdiction.name} • Formation Fee: {jurisdiction.currency} {jurisdiction.formation_price.toLocaleString()}
          </p>
          <div className="flex justify-center items-center gap-4 text-sm text-gray-400">
            <span>Processing Time: {jurisdiction.processing_time}</span>
            <span>•</span>
            <button
              onClick={() => router.push('/portfolio')}
              className="text-blue-400 hover:text-blue-300 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m0 0l4-4m-4 4l4 4" />
              </svg>
              View Formation Portfolio ({state.applications.length})
            </button>
          </div>
        </div>

        <ApplicationFormNew application={currentApplication} />
      </div>

      <div className="pb-8"></div>
      <Footer />
    </div>
  );
}