'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePortfolio } from '@/lib/portfolio-context';
import Footer from '@/components/ui/Footer';
import MailForwardingForm, { MailForwardingData } from '@/components/MailForwardingForm';
import TrustFormationForm, { TrustFormationData } from '@/components/TrustFormationForm';

interface ProfessionalService {
  id: string;
  name: string;
  description: string;
  short_description: string;
  features: string[];
  benefits: string[];
  category: string;
  icon_svg: string;
  display_order: number;
  full_description: string;
  pricing: string;
  timeline: string;
  link_url: string;
  link_text: string;
}

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function ServicesContent() {
  const headerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [professionalServices, setProfessionalServices] = useState<ProfessionalService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ProfessionalService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showMailForwardingForm, setShowMailForwardingForm] = useState(false);
  const [showTrustFormationForm, setShowTrustFormationForm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dispatch } = usePortfolio();

  // Fetch professional services
  const fetchProfessionalServices = async () => {
    try {
      const response = await fetch('/api/professional-services');
      if (response.ok) {
        const services = await response.json();
        setProfessionalServices(services);
      } else {
        console.error('Failed to fetch professional services');
      }
    } catch (error) {
      console.error('Error fetching professional services:', error);
    } finally {
      setServicesLoading(false);
    }
  };

  // Handle service card click
  const handleServiceClick = (service: ProfessionalService) => {
    setSelectedService(service);
    setIsModalOpen(true);
    setShowContactInfo(false);
    setShowMailForwardingForm(false);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowContactInfo(false);
    setShowMailForwardingForm(false);
    setShowTrustFormationForm(false);
    setTimeout(() => setSelectedService(null), 300); // Delay to allow animation
    // Remove the service parameter from URL but stay on services page
    router.push('/services', { scroll: false });
  };

  // Handle contact us button click
  const handleContactUsClick = () => {
    setShowContactInfo(true);
  };

  // Handle buy now for mail forwarding
  const handleMailForwardingBuyNow = () => {
    setShowMailForwardingForm(true);
  };

  // Handle buy now for trust formation
  const handleTrustFormationBuyNow = () => {
    setShowTrustFormationForm(true);
  };

  // Parse jurisdictions from features
  const parseJurisdictionsFromFeatures = (features: string[]) => {
    const jurisdictions: { name: string; price: number }[] = [];

    features.forEach(feature => {
      // Match patterns like "BVI - £500" or "Seychelles - £350"
      const match = feature.match(/^(.+?)\s*[-–]\s*£\s*([\d,]+(?:\.\d{2})?)/);
      if (match) {
        const name = match[1].trim();
        const price = parseFloat(match[2].replace(/,/g, ''));
        jurisdictions.push({ name, price });
      }
    });

    return jurisdictions;
  };

  // Handle mail forwarding form submission
  const handleMailForwardingSubmit = async (formData: MailForwardingData) => {
    if (!selectedService) return;

    try {
      // Use the jurisdiction price from the form
      const price = formData.jurisdictionPrice;

      console.log('Saving mail forwarding to database with pending status...');

      // Save to database with pending status BEFORE adding to portfolio
      const response = await fetch('/api/mail-forwarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          price,
          currency: 'GBP',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to save mail forwarding:', errorData);
        alert('Failed to save mail forwarding application. Please try again.');
        return;
      }

      const result = await response.json();
      console.log('Mail forwarding saved to database:', result);

      // Add to portfolio with database ID
      dispatch({
        type: 'ADD_MAIL_FORWARDING',
        payload: {
          id: `${selectedService.id}-${formData.jurisdiction}`,
          dbId: result.application.id, // Store the database ID
          price,
          currency: 'GBP',
          formData,
        },
      });

      // Close modal and redirect to portfolio
      handleCloseModal();
      router.push('/portfolio');
    } catch (error) {
      console.error('Error submitting mail forwarding:', error);
      alert('Failed to submit mail forwarding application. Please try again.');
    }
  };

  // Handle trust formation form submission
  const handleTrustFormationSubmit = async (formData: TrustFormationData) => {
    if (!selectedService) return;

    try {
      // Use the jurisdiction price from the form
      const price = formData.jurisdictionPrice;

      console.log('Saving trust formation to database with pending status...');

      // Save to database with pending status BEFORE adding to portfolio
      const response = await fetch('/api/trust-formation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price,
          currency: 'GBP',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to save trust formation:', errorData);
        alert('Failed to save trust formation application. Please try again.');
        return;
      }

      const result = await response.json();
      console.log('Trust formation saved to database:', result);

      // Add to portfolio with database ID
      dispatch({
        type: 'ADD_TRUST_FORMATION',
        payload: {
          id: `${selectedService.id}-${formData.jurisdiction}`,
          dbId: result.application.id, // Store the database ID
          price,
          currency: 'GBP',
          provideDetailsNow: formData.provideDetailsNow,
          formData,
        },
      });

      // Close modal and redirect to portfolio
      handleCloseModal();
      router.push('/portfolio');
    } catch (error) {
      console.error('Error submitting trust formation:', error);
      alert('Failed to submit trust formation application. Please try again.');
    }
  };

  // Handle adding service to portfolio
  const handleAddToPortfolio = (service: ProfessionalService) => {
    // Extract price from pricing string - handles multiple formats:
    // "£2,500", "£2500", "2,500", "Starting from £2,500", "From £1,200", etc.
    let price = 0;

    if (service.pricing) {
      // Try to match £ symbol followed by numbers and optional commas
      const poundMatch = service.pricing.match(/£\s*([\d,]+(?:\.\d{2})?)/);
      if (poundMatch) {
        price = parseFloat(poundMatch[1].replace(/,/g, ''));
      } else {
        // Try to match just numbers (without £ symbol)
        const numberMatch = service.pricing.match(/([\d,]+(?:\.\d{2})?)/);
        if (numberMatch) {
          price = parseFloat(numberMatch[1].replace(/,/g, ''));
        }
      }
    }

    console.log('Adding to portfolio:', {
      service: service.name,
      pricing: service.pricing,
      extractedPrice: price
    });

    dispatch({
      type: 'ADD_STANDALONE_SERVICE',
      payload: {
        id: service.id,
        name: service.name,
        price: price,
        currency: 'GBP',
        description: service.description,
      }
    });

    // Close modal and redirect to portfolio
    handleCloseModal();
    router.push('/portfolio');
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
      }
    );

    sectionRefs.current.forEach((section, index) => {
      if (section) {
        gsap.fromTo(
          section,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
            },
          }
        );
      }
    });

    // Fetch professional services
    fetchProfessionalServices();

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Handle URL parameter to open modal
  useEffect(() => {
    const serviceId = searchParams.get('service');
    if (serviceId && professionalServices.length > 0 && !isModalOpen) {
      const service = professionalServices.find(s => s.id === serviceId);
      if (service) {
        setSelectedService(service);
        setIsModalOpen(true);
      }
    }
  }, [searchParams, professionalServices, isModalOpen]);

  // Component to render service icons
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

  return (
    <div className="min-h-screen bg-gray-900 pt-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-20">
        <div className="container mx-auto px-4">
          <div ref={headerRef} className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Comprehensive <span className="text-blue-400">Offshore Services</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              Professional offshore business solutions tailored to your international expansion and wealth protection needs.
            </p>
            <Link
              href="/jurisdictions"
              className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Start Your Application
            </Link>
          </div>
        </div>
      </section>

      {/* Company Formation Section */}
      <section
        ref={el => { sectionRefs.current[0] = el; }}
        id="company-formation"
        className="py-20 bg-gray-900"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Offshore Company Formation
              </h2>
              <p className="text-white mb-6 text-lg">
                Establish your offshore presence in the world&apos;s premier business jurisdictions. We offer incorporation services in over 15+ jurisdictions, each carefully selected for their business-friendly regulations and tax advantages.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="text-white font-semibold">British Virgin Islands (BVI)</h3>
                    <p className="text-gray-400">World&apos;s leading offshore jurisdiction with maximum privacy and flexibility</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="text-white font-semibold">Cayman Islands</h3>
                    <p className="text-gray-400">Premier choice for investment funds and financial services</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="text-white font-semibold">Seychelles & Panama</h3>
                    <p className="text-gray-400">Cost-effective solutions with minimal compliance requirements</p>
                  </div>
                </div>
              </div>
              <Link
                href="/jurisdictions"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore Jurisdictions
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6">Formation Package Includes:</h3>
              <ul className="space-y-3 text-white">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Company incorporation & registration
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Registered office address
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Corporate documents & apostilles
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Share certificates & company seal
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  First year registered agent service
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Banking Services Section */}
      <section
        ref={el => { sectionRefs.current[1] = el; }}
        id="banking"
        className="py-20 bg-gray-800"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gray-900 rounded-xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6">Banking Jurisdictions:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-white font-semibold">Switzerland</h4>
                  <p className="text-gray-400 text-sm">Premium private banking</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-white font-semibold">Singapore</h4>
                  <p className="text-gray-400 text-sm">Asian financial hub</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-white font-semibold">UAE</h4>
                  <p className="text-gray-400 text-sm">Middle East gateway</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-white font-semibold">Cyprus</h4>
                  <p className="text-gray-400 text-sm">European banking</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Offshore Banking Services
              </h2>
              <p className="text-white mb-6 text-lg">
                Secure your financial future with multi-currency offshore bank accounts in the world&apos;s most stable banking jurisdictions. Our banking specialists facilitate account opening with top-tier international banks.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Multi-currency accounts (USD, EUR, GBP, CHF)</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Online banking & debit cards</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Investment & wealth management services</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Trade finance & letters of credit</span>
                </div>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Discuss Banking Options
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services Grid */}
      <section
        ref={el => { sectionRefs.current[2] = el; }}
        className="py-20 bg-gray-900"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Additional Professional Services
            </h2>
            <p className="text-white max-w-2xl mx-auto">
              Complete your offshore setup with our comprehensive range of supporting services.
            </p>
          </div>

          {servicesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
              <span className="ml-4 text-gray-400 text-lg">Loading professional services...</span>
            </div>
          ) : professionalServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No professional services available at the moment.</p>
            </div>
          ) : (
            <div className={`grid gap-8 ${professionalServices.length === 1
              ? 'grid-cols-1 max-w-md mx-auto'
              : professionalServices.length === 2
                ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
                : professionalServices.length === 3
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : professionalServices.length === 4
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4'
                    : professionalServices.length === 5
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                      : professionalServices.length % 3 === 0
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                        : professionalServices.length % 4 === 0
                          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}>
              {professionalServices.map((service) => (
                <div
                  key={service.id}
                  id={service.id}
                  className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 flex flex-col h-full"
                  onClick={() => handleServiceClick(service)}
                >
                  <div className="mb-5">
                    <ServiceIcon category={service.category} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 line-clamp-2">{service.name}</h3>
                  <p className="text-gray-400 mb-5 line-clamp-3">{service.description}</p>
                  {service.features && service.features.length > 0 && (
                    <ul className="text-sm text-white space-y-2 mb-6">
                      {service.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="line-clamp-1">• {feature}</li>
                      ))}
                      {service.features.length > 3 && (
                        <li className="text-blue-400">• +{service.features.length - 3} more features</li>
                      )}
                    </ul>
                  )}
                  <div className="inline-flex items-center text-blue-400 hover:text-blue-300 mt-auto pt-4 border-t border-gray-700">
                    View Details
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
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Expand Your Business Offshore?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Our experienced team will guide you through every step of the offshore formation process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/jurisdictions"
              className="px-8 py-4 bg-white text-blue-900 font-semibold text-lg rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Start Formation
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold text-lg rounded-lg hover:bg-white hover:text-blue-900 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Speak with Expert
            </Link>
          </div>
        </div>
      </section>

      {/* Service Detail Modal */}
      {isModalOpen && selectedService && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-700 rounded-lg">
                  <ServiceIcon category={selectedService.category} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedService.name}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-blue-400 font-semibold"> £{selectedService.pricing}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            {showMailForwardingForm ? (
              <MailForwardingForm
                onSubmit={handleMailForwardingSubmit}
                onCancel={() => setShowMailForwardingForm(false)}
                availableJurisdictions={parseJurisdictionsFromFeatures(selectedService.features || [])}
              />
            ) : showTrustFormationForm ? (
              <TrustFormationForm
                onSubmit={handleTrustFormationSubmit}
                onCancel={() => setShowTrustFormationForm(false)}
                availableJurisdictions={parseJurisdictionsFromFeatures(selectedService.features || [])}
              />
            ) : (
              <div className="p-6">
                {!showContactInfo ? (
                  <>
                    {/* Description */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-white mb-3">Overview</h4>
                      <p className="text-white leading-relaxed">{selectedService.full_description || selectedService.description}</p>
                    </div>

                    {/* Features and Benefits Grid */}
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      {/* Features */}
                      {selectedService.features && selectedService.features.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-4">What's Included</h4>
                          <ul className="space-y-3">
                            {selectedService.features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <svg className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-white">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Benefits */}
                      {selectedService.benefits && selectedService.benefits.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-4">Key Benefits</h4>
                          <ul className="space-y-3">
                            {selectedService.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-start">
                                <svg className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                <span className="text-white">{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700">
                      {selectedService.name.toLowerCase().includes('mail') && selectedService.name.toLowerCase().includes('forwarding') ? (
                        <button
                          onClick={handleMailForwardingBuyNow}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-medium transition-colors"
                        >
                          Buy Now
                        </button>
                      ) : selectedService.name.toLowerCase().includes('trust') && (selectedService.name.toLowerCase().includes('formation') || selectedService.name.toLowerCase().includes('setup')) ? (
                        <button
                          onClick={handleTrustFormationBuyNow}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-medium transition-colors"
                        >
                          Apply Now
                        </button>
                      ) : selectedService.category === 'office' ? (
                        <button
                          onClick={handleContactUsClick}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-medium transition-colors"
                        >
                          Contact Us
                        </button>
                      ) : selectedService.link_url ? (
                        <>
                          {selectedService.category === 'general' || selectedService.link_url.includes('portfolio') ? (
                            <button
                              onClick={() => handleAddToPortfolio(selectedService)}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-medium transition-colors"
                            >
                              {selectedService.link_text || 'Add to Portfolio'}
                            </button>
                          ) : (
                            <Link
                              href={selectedService.link_url}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-medium transition-colors"
                              onClick={handleCloseModal}
                            >
                              {selectedService.link_text || 'Get Started Now'}
                            </Link>
                          )}
                        </>
                      ) : null}
                      <button
                        onClick={handleCloseModal}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Contact Information View */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-white mb-3">Get in Touch</h4>
                      <p className="text-white leading-relaxed mb-6">
                        Contact us directly to discuss your virtual office needs. Our team is ready to assist you.
                      </p>

                      <div className="space-y-4">
                        {/* Email */}
                        <a
                          href="mailto:info@rapidcorporateservices.com"
                          className="flex items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                        >
                          <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Email us at</p>
                            <p className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                              info@rapidcorporateservices.com
                            </p>
                          </div>
                        </a>

                        {/* Phone */}
                        <a
                          href="tel:+441904560089"
                          className="flex items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                        >
                          <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Call us at</p>
                            <p className="text-white font-semibold group-hover:text-green-400 transition-colors">
                              +44 1904 560089
                            </p>
                          </div>
                        </a>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700">
                      <button
                        onClick={() => setShowContactInfo(false)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                      >
                        Back to Service Details
                      </button>
                      <button
                        onClick={handleCloseModal}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pb-8"></div>
      <Footer />
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading services...</div>
      </div>
    }>
      <ServicesContent />
    </Suspense>
  );
}