'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

// Register the ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Define the comprehensive services data
const services = [
  {
    id: "company-formation",
    title: "Offshore Company Formation",
    description: "Professional incorporation services in BVI, Cayman Islands, Seychelles, Panama, and 15+ jurisdictions worldwide.",
    link: "/jurisdictions",
    linkText: "View Jurisdictions",
    icon: (
      <svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
      </svg>
    ),
  },
  {
    id: "offshore-banking",
    title: "Offshore Banking Services",
    description: "Multi-currency offshore bank account opening in Switzerland, Singapore, UAE, and other secure banking jurisdictions.",
    link: "/services#banking",
    linkText: "Learn More",
    icon: (
      <svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
      </svg>
    ),
  },
  {
    id: "trust-formation",
    title: "Offshore Trust Formation",
    description: "Asset protection trusts, discretionary trusts, and charitable trusts for wealth preservation and succession planning.",
    link: "/services#trusts",
    linkText: "Explore Trusts",
    icon: (
      <svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
  },
  {
    id: "nominee-services",
    title: "Nominee Director Services",
    description: "Professional nominee director and shareholder services for enhanced privacy and regulatory compliance.",
    link: "/services#nominees",
    linkText: "View Details",
    icon: (
      <svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
      </svg>
    ),
  },
  {
    id: "virtual-office",
    title: "Virtual Office Solutions",
    description: "Professional business addresses, mail forwarding, call answering, and virtual receptionist services worldwide.",
    link: "/services#virtual-office",
    linkText: "Get Started",
    icon: (
      <svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
      </svg>
    ),
  },
  {
    id: "compliance",
    title: "Tax & Compliance Services",
    description: "Ongoing compliance support, annual filings, tax optimization strategies, and regulatory advisory services.",
    link: "/services#compliance",
    linkText: "Learn More",
    icon: (
      <svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    ),
  },
];

// Define the Services component
export default function Services() {
  // Create a reference for the section
  const sectionRef = useRef<HTMLElement>(null);
  // Create a reference for the title
  const titleRef = useRef<HTMLDivElement>(null);
  // Create references for the service cards
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Set up GSAP animations with ScrollTrigger
  useEffect(() => {
    // Skip if window is not defined (SSR)
    if (typeof window === "undefined") return;

    // Animate the title
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
        },
      }
    );

    // Animate each service card
    cardRefs.current.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.2 + index * 0.1, // Stagger the animations
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        }
      );
    });

    // Clean up ScrollTrigger instances on component unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Return the services section
  return (
    <section ref={sectionRef} id="services" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section title */}
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Complete Offshore <span className="text-blue-400">Business Solutions</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            From company formation to offshore banking and trust services - we provide comprehensive
            international business solutions for your global expansion and wealth protection needs.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service.id}
              ref={(el) => (cardRefs.current[index] = el)}
              className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <div className="mb-5">{service.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {service.title}
              </h3>
              <p className="text-gray-400 mb-5">{service.description}</p>
              <Link
                href={service.link}
                className="inline-flex items-center text-blue-400 hover:text-blue-300"
              >
                {service.linkText}
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
      </div>
    </section>
  );
}
