'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useRouter } from 'next/navigation';
import { usePortfolio } from '@/lib/portfolio-context';
import { formatCurrency } from '@/lib/currency';
import Image from 'next/image';
import Footer from '@/components/ui/Footer';

interface AdditionalService {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  currency: string;
  note: string;
  category: string;
}

if (typeof window !== 'undefined') {
  gsap.registerPlugin();
}

export default function PortfolioPage() {
  const { state, dispatch } = usePortfolio();
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Fetch additional services
  const fetchAdditionalServices = async () => {
    setServicesLoading(true);
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const services = await response.json();
        setAdditionalServices(services);
      } else {
        console.error('Failed to fetch services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setServicesLoading(false);
    }
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

    // Fetch services on component mount
    fetchAdditionalServices();
  }, []);

  const removeApplication = (applicationId: string) => {
    dispatch({ type: 'REMOVE_APPLICATION', payload: applicationId });
  };

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

  const getMainCurrency = () => {
    return 'GBP'; // Always use GBP
  };

  const isApplicationComplete = (application: any): boolean => {
    // Check required contact details
    if (!application.contactDetails.firstName ||
        !application.contactDetails.lastName ||
        !application.contactDetails.email ||
        !application.contactDetails.phone ||
        !application.contactDetails.address.street) {
      return false;
    }

    // Check required company details
    if (!application.companyDetails.proposedName ||
        !application.companyDetails.businessActivity) {
      return false;
    }

    // Check directors (at least one with required fields)
    if (application.directors.length === 0) return false;
    for (const director of application.directors) {
      if (!director.firstName || !director.lastName) {
        return false;
      }
    }

    // Check shareholders (at least one with required fields)
    if (application.shareholders.length === 0) return false;
    for (const shareholder of application.shareholders) {
      if (!shareholder.firstName || !shareholder.lastName || shareholder.sharePercentage <= 0) {
        return false;
      }
    }

    // Check that share percentages add up to 100%
    const totalShares = application.shareholders.reduce((sum: number, s: any) => sum + Number(s.sharePercentage), 0);
    if (Math.abs(totalShares - 100) > 0.01) {
      return false;
    }

    return true;
  };

  const areAllApplicationsComplete = (): boolean => {
    return state.applications.length > 0 && state.applications.every(app => isApplicationComplete(app));
  };

  const canProceedToCheckout = (): boolean => {
    // Must have at least one item (application, standalone service, or mail forwarding)
    const hasItems = state.applications.length > 0 || state.standaloneServices.length > 0 || state.mailForwarding !== null;

    // If there are applications, ALL must be complete
    const allApplicationsComplete = state.applications.length === 0 || areAllApplicationsComplete();

    return hasItems && allApplicationsComplete;
  };

  const getIncompleteApplications = () => {
    return state.applications.filter(app => !isApplicationComplete(app));
  };

  // Handle opening the services modal
  const handleOpenServicesModal = () => {
    // Pre-populate selected services with services already in portfolio
    const existingServiceIds = state.standaloneServices.map(service => service.id);
    setSelectedServices(existingServiceIds);
    setShowServicesModal(true);
  };

  // Handle service selection
  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Sync selected services with portfolio
  const addServicesToPortfolio = () => {
    // Get current portfolio service IDs
    const currentServiceIds = state.standaloneServices.map(s => s.id);

    // Services to add (selected but not in portfolio)
    const servicesToAdd = additionalServices.filter(service =>
      selectedServices.includes(service.id) && !currentServiceIds.includes(service.id)
    );

    // Services to remove (in portfolio but not selected)
    const servicesToRemove = currentServiceIds.filter(serviceId =>
      !selectedServices.includes(serviceId)
    );

    // Add new services
    servicesToAdd.forEach(service => {
      dispatch({
        type: 'ADD_STANDALONE_SERVICE',
        payload: {
          id: service.id,
          name: service.name,
          price: service.basePrice,
          currency: service.currency,
          description: service.description,
        }
      });
    });

    // Remove deselected services
    servicesToRemove.forEach(serviceId => {
      dispatch({
        type: 'REMOVE_STANDALONE_SERVICE',
        payload: serviceId
      });
    });

    setSelectedServices([]);
    setShowServicesModal(false);
  };

  // if (state.applications.length >= 0) {
  //   return (
  //     <div className="min-h-screen bg-gray-900 pt-38 py-20">
  //       <div className="container mx-auto px-4">
  //         <div className="text-center">
  //           <div className="mb-8">
  //             <svg className="w-24 h-24 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  //             </svg>
  //             <h1 className="text-3xl font-bold text-white mb-2">Your Formation Portfolio</h1>
  //             <p className="text-gray-400">No applications yet</p>
  //           </div>

  //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
  //             <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
  //               <h2 className="text-xl font-semibold text-white mb-4">Start Your First Application</h2>
  //               <p className="text-gray-400 mb-6">
  //                 Choose a jurisdiction and begin your company formation process.
  //               </p>
  //               <button
  //                 onClick={() => router.push('/jurisdictions')}
  //                 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
  //               >
  //                 Browse Jurisdictions
  //               </button>
  //             </div>

  //             <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
  //               <h2 className="text-xl font-semibold text-white mb-4">Professional Services</h2>
  //               <p className="text-gray-400 mb-6">
  //                 Explore our additional offshore services to enhance your business setup.
  //               </p>
  //               <button
  //                 onClick={() => setShowServicesModal(true)}
  //                 className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
  //               >
  //                 <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  //                 </svg>
  //                 Browse Services
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Services Selection Modal */}
  //       {showServicesModal && (
  //         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  //           <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
  //             <div className="sticky top-0 bg-gray-800 p-6 border-b border-gray-700">
  //               <div className="flex items-center justify-between">
  //                 <h2 className="text-2xl font-bold text-white">Select Additional Services</h2>
  //                 <button
  //                   onClick={() => setShowServicesModal(false)}
  //                   className="text-gray-400 hover:text-white"
  //                 >
  //                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  //                   </svg>
  //                 </button>
  //               </div>
  //               <p className="text-gray-400 mt-2">
  //                 Base prices shown - final pricing may vary based on jurisdiction and specific requirements
  //               </p>
  //             </div>

  //             <div className="p-6">
  //               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //                 {additionalServices.map((service) => (
  //                   <div
  //                     key={service.id}
  //                     className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
  //                       selectedServices.includes(service.id)
  //                         ? 'border-blue-500 bg-blue-900/20'
  //                         : 'border-gray-600 hover:border-gray-500'
  //                     }`}
  //                     onClick={() => handleServiceToggle(service.id)}
  //                   >
  //                     <div className="flex items-start justify-between mb-3">
  //                       <h3 className="text-white font-semibold">{service.name}</h3>
  //                       <div className="flex items-center">
  //                         <input
  //                           type="checkbox"
  //                           checked={selectedServices.includes(service.id)}
  //                           onChange={(e) => {
  //                             e.stopPropagation();
  //                             handleServiceToggle(service.id);
  //                           }}
  //                           className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
  //                         />
  //                       </div>
  //                     </div>
  //                     <p className="text-gray-300 text-sm mb-3">{service.description}</p>
  //                     <div className="flex justify-between items-end">
  //                       <div>
  //                         <p className="text-blue-400 font-bold text-lg">
  //                           ${service.basePrice.toLocaleString()} USD
  //                         </p>
  //                         <p className="text-gray-500 text-xs">{service.note}</p>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 ))}
  //               </div>
  //             </div>

  //             <div className="sticky bottom-0 bg-gray-800 p-6 border-t border-gray-700">
  //               <div className="flex items-center justify-between">
  //                 <div>
  //                   <p className="text-white font-semibold">
  //                     {selectedServices.length} service(s) selected
  //                   </p>
  //                   {selectedServices.length > 0 && (
  //                     <p className="text-gray-400 text-sm">
  //                       Estimated total: ${selectedServices.reduce((total, serviceId) => {
  //                         const service = additionalServices.find(s => s.id === serviceId);
  //                         return total + (service?.basePrice || 0);
  //                       }, 0).toLocaleString()} USD
  //                     </p>
  //                   )}
  //                 </div>
  //                 <div className="flex gap-3">
  //                   <button
  //                     onClick={() => setShowServicesModal(false)}
  //                     className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
  //                   >
  //                     Cancel
  //                   </button>
  //                   <button
  //                     onClick={addServicesToPortfolio}
  //                     disabled={selectedServices.length === 0}
  //                     className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
  //                   >
  //                     Add to Portfolio
  //                   </button>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       )}

  //       <div className="pb-8"></div>
  //       <Footer />
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-900 pt-38 py-20">
      <div className="container mx-auto px-4">
        <div ref={headerRef} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Formation <span className="text-blue-400">Portfolio</span>
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto text-lg">
            Review your company formation applications and proceed to payment when ready.
          </p>
        </div>

        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Applications List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Applications ({state.applications.length})</h2>
              <button
                onClick={() => router.push('/jurisdictions')}
                className="text-blue-400 hover:text-blue-300 flex items-center text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Another Application
              </button>
            </div>

            {state.applications.map((application) => (
              <div key={application.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-8 rounded border border-gray-600 overflow-hidden mr-3">
                        <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                          {application.jurisdiction.name.substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {application.jurisdiction.name}
                        </h3>
                        <p className="text-gray-400 text-sm">Company Formation</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-blue-400 text-xl font-bold">
                        {formatCurrency(application.jurisdiction.price, application.jurisdiction.currency)}
                      </p>
                      <button
                        onClick={() => removeApplication(application.id)}
                        className="text-red-400 hover:text-red-300 text-sm mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Proposed Company Name</p>
                      <p className="text-white">
                        {application.companyDetails.proposedName || 'Not specified'}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Contact Person</p>
                      <p className="text-white">
                        {application.contactDetails.firstName && application.contactDetails.lastName
                          ? `${application.contactDetails.firstName} ${application.contactDetails.lastName}`
                          : 'Not specified'}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Directors</p>
                      <p className="text-white">{application.directors.length} director(s)</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Shareholders</p>
                      <p className="text-white">{application.shareholders.length} shareholder(s)</p>
                    </div>
                  </div>

                  {/* Additional Services */}
                  {application.additionalServices.length > 0 && (
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm mb-2">Additional Services</p>
                      <div className="space-y-1">
                        {application.additionalServices.map((service) => (
                          <div key={service.id} className="flex justify-between items-center">
                            <span className="text-white text-sm">{service.name}</span>
                            <span className="text-blue-400 text-sm">
                              ${service.price.toLocaleString()} {service.currency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {isApplicationComplete(application) ? (
                      <div className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm text-center flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Application Complete
                      </div>
                    ) : (
                      <button
                        onClick={() => router.push(`/apply/${application.jurisdiction.id}`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors duration-200"
                      >
                        Continue Application
                      </button>
                    )}
                  </div>
                </div>

                {/* Application Progress */}
                <div className="bg-gray-900 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Application Progress</span>
                    <span className="text-green-400 text-sm">
                      {getApplicationCompleteness(application)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getApplicationCompleteness(application)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Other Services Section - Always Visible */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Additional Services</h3>
                <p className="text-gray-400 mb-6">
                  Enhance your offshore setup with our professional services
                </p>
                <button
                  onClick={handleOpenServicesModal}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Other Services
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-6">
              <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6">
                {state.applications.map((application) => (
                  <div key={application.id}>
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
                    <div className="text-right">
                      <p className="text-white">
                        £{service.price.toLocaleString()}
                      </p>
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_STANDALONE_SERVICE', payload: service.id })}
                        className="text-red-400 hover:text-red-300 text-xs mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                {/* Mail Forwarding Service */}
                {state.mailForwarding && (
                  <div className="flex justify-between items-start mb-2 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
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
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        £{state.mailForwarding.price.toLocaleString()}
                      </p>
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_MAIL_FORWARDING' })}
                        className="text-red-400 hover:text-red-300 text-xs mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-600 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-white">Total</span>
                  <span className="text-2xl font-bold text-blue-400">
                    {formatCurrency(getTotalAmount(), getMainCurrency())}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (canProceedToCheckout()) {
                      router.push('/checkout');
                    }
                  }}
                  disabled={!canProceedToCheckout()}
                  className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                    canProceedToCheckout()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 cursor-not-allowed text-gray-400'
                  }`}
                >
                  {canProceedToCheckout() ? 'Proceed to Checkout' :
                    (state.applications.length === 0 && state.standaloneServices.length === 0 && !state.mailForwarding)
                      ? 'Add items to your portfolio to checkout'
                      : 'Complete all applications to checkout'}
                </button>

                <button
                  onClick={() => router.push('/contact')}
                  className="w-full border border-gray-600 text-gray-300 hover:bg-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Get Expert Consultation
                </button>
              </div>

              {!canProceedToCheckout() && (
                <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-500 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="text-yellow-300 text-sm font-semibold">
                        {state.applications.length === 0 && state.standaloneServices.length === 0 && !state.mailForwarding
                          ? 'No items in portfolio'
                          : `${getIncompleteApplications().length} Incomplete Application(s)`}
                      </p>
                      <p className="text-yellow-200 text-xs mt-1">
                        {state.applications.length === 0 && state.standaloneServices.length === 0 && !state.mailForwarding
                          ? 'Add company formation applications or services to proceed to checkout.'
                          : 'Please complete all required fields in your applications before proceeding to checkout.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-blue-300 text-sm font-semibold">Next Steps</p>
                    <p className="text-blue-200 text-xs mt-1">
                      Complete all applications before proceeding to checkout. Our team will review and process your formations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Selection Modal */}
      {showServicesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Select Additional Services</h2>
                <button
                  onClick={() => setShowServicesModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-400 mt-2">
                Base prices shown - final pricing may vary based on jurisdiction and specific requirements
              </p>
            </div>

            <div className="p-6">
              {servicesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  <span className="ml-3 text-gray-400">Loading services...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {additionalServices.map((service) => (
                  <div
                    key={service.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      selectedServices.includes(service.id)
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => handleServiceToggle(service.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-white font-semibold">{service.name}</h3>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleServiceToggle(service.id);
                          }}
                          className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{service.description}</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-blue-400 font-bold text-lg">
                          £{service.basePrice.toLocaleString()}
                        </p>
                        <p className="text-gray-500 text-xs">{service.note}</p>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-800 p-6 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">
                    {selectedServices.length} service(s) selected
                  </p>
                  {selectedServices.length > 0 && (
                    <p className="text-gray-400 text-sm">
                      Estimated total: £{selectedServices.reduce((total, serviceId) => {
                        const service = additionalServices.find(s => s.id === serviceId);
                        return total + (service?.basePrice || 0);
                      }, 0).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowServicesModal(false)}
                    className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addServicesToPortfolio}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Update Portfolio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pb-8"></div>
      <Footer />
    </div>
  );
}

function getApplicationCompleteness(application: any): number {
  let completedFields = 0;
  let totalFields = 0;

  // Contact details (5 required fields)
  totalFields += 5;
  if (application.contactDetails.firstName) completedFields++;
  if (application.contactDetails.lastName) completedFields++;
  if (application.contactDetails.email) completedFields++;
  if (application.contactDetails.phone) completedFields++;
  if (application.contactDetails.address.street) completedFields++;

  // Company details (2 required fields)
  totalFields += 2;
  if (application.companyDetails.proposedName) completedFields++;
  if (application.companyDetails.businessActivity) completedFields++;

  // Directors (2 required fields per director)
  totalFields += application.directors.length * 2;
  application.directors.forEach((director: any) => {
    if (director.firstName) completedFields++;
    if (director.lastName) completedFields++;
  });

  // Shareholders (3 required fields per shareholder)
  totalFields += application.shareholders.length * 3;
  application.shareholders.forEach((shareholder: any) => {
    if (shareholder.firstName) completedFields++;
    if (shareholder.lastName) completedFields++;
    if (shareholder.sharePercentage > 0) completedFields++;
  });

  // Check share percentage total (bonus completion check)
  const totalShares = application.shareholders.reduce((sum: number, s: any) => sum + Number(s.sharePercentage), 0);
  if (Math.abs(totalShares - 100) <= 0.01) {
    totalFields += 1;
    completedFields += 1;
  } else {
    totalFields += 1;
  }

  return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
}