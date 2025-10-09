'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/currency';
import Footer from '@/components/ui/Footer';

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

export default function JurisdictionsPage() {
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJurisdictions = async () => {
      try {
        const response = await fetch('/api/jurisdictions');
        if (!response.ok) {
          throw new Error('Failed to fetch jurisdictions');
        }
        const data = await response.json();
        setJurisdictions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchJurisdictions();
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading jurisdictions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-38 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your <span className="text-blue-400">Jurisdiction</span>
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg">
            Select from our premium offshore jurisdictions. Each offers unique advantages
            for your international business needs with competitive pricing and professional service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jurisdictions.map((jurisdiction) => (
            <div
              key={jurisdiction.id}
              className="bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 overflow-hidden"
            >
              <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800">
                <div className="absolute inset-0 flex items-center justify-center">
                  {jurisdiction.flag_url ? (
                    <Image
                      src={jurisdiction.flag_url}
                      alt={`${jurisdiction.name} flag`}
                      width={120}
                      height={80}
                      className="rounded-lg shadow-lg border border-gray-600"
                    />
                  ) : (
                    <div className="w-[120px] h-[80px] bg-gray-600 rounded-lg shadow-lg border border-gray-600 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">{jurisdiction.country_code}</span>
                    </div>
                  )}
                </div>
                {jurisdiction.processing_time && (
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {jurisdiction.processing_time}
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {jurisdiction.name}
                </h3>

                <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                  {jurisdiction.description}
                </p>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-blue-400 mb-1">
                    {formatCurrency(jurisdiction.formation_price, jurisdiction.currency)}
                  </div>
                  <div className="text-gray-500 text-sm">Company Formation</div>
                </div>

                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-2 text-sm">Key Features:</h4>
                  <ul className="space-y-1">
                    {jurisdiction.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="text-gray-400 text-xs flex items-start">
                        <svg className="w-3 h-3 text-green-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                    {jurisdiction.features.length > 3 && (
                      <li className="text-blue-400 text-xs">
                        +{jurisdiction.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/jurisdictions/${jurisdiction.id}`}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-center py-2 px-4 rounded-lg font-semibold text-sm transition-colors duration-200"
                  >
                    Learn More
                  </Link>
                  <Link
                    href={`/apply/${jurisdiction.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-semibold text-sm transition-colors duration-200"
                  >
                    Start Application
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-400 mb-6">
            Not sure which jurisdiction is right for you?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Get Expert Consultation
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="pb-8"></div>
      <Footer />
    </div>
  );
}