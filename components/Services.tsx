'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ProfessionalService {
  id: string;
  name: string;
  description: string;
  short_description: string;
  category: string;
  display_order: number;
}

// Define the Services component
export default function Services() {
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/professional-services');
        if (response.ok) {
          const data = await response.json();
          // Limit to first 3 services
          setServices(data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching professional services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Component to render service icons based on category
  const ServiceIcon = ({ category }: { category: string }) => {
    const iconProps = {
      className: "h-10 w-10 text-blue-400",
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor"
    };

    switch (category) {
      case 'trusts':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'nominees':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'office':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'compliance':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'licensing':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'general':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Return the services section
  return (
    <section id="services" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Complete Offshore <span className="text-blue-400">Business Solutions</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Professional services tailored to your international expansion and wealth protection needs.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            <span className="ml-4 text-gray-400 text-lg">Loading services...</span>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No services available at the moment.</p>
          </div>
        ) : (
          <>
            {/* Services grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="mb-5">
                    <ServiceIcon category={service.category} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {service.name}
                  </h3>
                  <p className="text-gray-400 mb-5">{service.description}</p>
                  <Link
                    href={`/services?service=${service.id}`}
                    className="inline-flex items-center text-blue-400 hover:text-blue-300"
                  >
                    Learn More
                    <svg
                      className="ml-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>

            {/* View All Services Link */}
            <div className="text-center mt-12">
              <Link
                href="/services"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Services
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
