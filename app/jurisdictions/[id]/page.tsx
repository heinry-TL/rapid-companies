'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/currency';
import Footer from '@/components/ui/Footer';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
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

export default function JurisdictionDetailPage() {
  const params = useParams();
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchJurisdiction = async () => {
      try {
        const response = await fetch(`/api/jurisdictions/${params.id}`);
        if (!response.ok) {
          throw new Error('Jurisdiction not found');
        }
        const data = await response.json();
        setJurisdiction(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchJurisdiction();
    }
  }, [params.id]);

  useEffect(() => {
    if (typeof window === "undefined" || loading || !jurisdiction) return;

    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
      }
    );

    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: 0.3,
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [loading, jurisdiction]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading jurisdiction details...</div>
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
          <Link
            href="/jurisdictions"
            className="text-blue-400 hover:text-blue-300"
          >
            ← Back to Jurisdictions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-38 py-20">
      <div className="container mx-auto px-4">
        <div ref={headerRef} className="text-center mb-12">
          <div className="mb-6">
            <Image
              src={jurisdiction.flag_url}
              alt={`${jurisdiction.name} flag`}
              width={150}
              height={100}
              className="mx-auto rounded-lg shadow-lg border border-gray-600"
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {jurisdiction.name}
          </h1>

          <div className="flex justify-center items-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                {formatCurrency(jurisdiction.formation_price, jurisdiction.currency)}
              </div>
              <div className="text-gray-400">Formation Cost</div>
            </div>

            <div className="w-px h-12 bg-gray-700"></div>

            <div className="text-center">
              <div className="text-xl font-semibold text-green-400">
                {jurisdiction.processing_time}
              </div>
              <div className="text-gray-400">Processing Time</div>
            </div>
          </div>

          <p className="text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed">
            {jurisdiction.description}
          </p>
        </div>

        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Key Features & Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jurisdiction.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-400 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Why Choose {jurisdiction.name}?</h2>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-white">Fast Processing</h3>
                    <p>Your company can be incorporated in just {jurisdiction.processing_time.toLowerCase()}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-white">Competitive Pricing</h3>
                    <p>Professional incorporation service starting at {formatCurrency(jurisdiction.formation_price, jurisdiction.currency)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-white">Expert Support</h3>
                    <p>Dedicated support team to guide you through the entire process</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="mb-6 text-blue-100">
                Contact our experts today for a free consultation about incorporating in {jurisdiction.name}.
              </p>

              <div className="space-y-3">
                <Link
                  href={`/apply/${jurisdiction.id}`}
                  className="block w-full bg-white text-blue-600 hover:bg-gray-100 text-center py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
                >
                  Start Application
                </Link>

                <Link
                  href="/contact"
                  className="block w-full border border-white text-white hover:bg-white hover:text-blue-600 text-center py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
                >
                  Free Consultation
                </Link>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Need Help Choosing?</h3>
              <p className="text-gray-400 text-sm mb-4">
                Our experts can help you select the best jurisdiction for your specific needs.
              </p>
              <Link
                href="/jurisdictions"
                className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
              >
                Compare All Jurisdictions →
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/jurisdictions"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Jurisdictions
          </Link>
        </div>
      </div>

      <div className="pb-8"></div>
      <Footer />
    </div>
  );
}