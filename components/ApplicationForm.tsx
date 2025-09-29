'use client';

import { useState } from 'react';
import { usePortfolio, CompanyApplication, Director, Shareholder, createEmptyDirector, createEmptyShareholder } from '@/lib/portfolio-context';
import { formatCurrency } from '@/lib/currency';
import AddressForm from './AddressForm';

interface ApplicationFormProps {
  application: CompanyApplication;
}

const steps = [
  { id: 1, name: 'Contact Details', description: 'Your personal information' },
  { id: 2, name: 'Company Details', description: 'Company name and structure' },
  { id: 3, name: 'Directors', description: 'Director information' },
  { id: 4, name: 'Shareholders', description: 'Shareholder details' },
  { id: 5, name: 'Review', description: 'Review and confirm' },
];

export default function ApplicationForm({ application }: ApplicationFormProps) {
  const { dispatch } = usePortfolio();
  const [currentStep, setCurrentStep] = useState(1);

  const updateApplication = (data: Partial<CompanyApplication>) => {
    dispatch({
      type: 'UPDATE_APPLICATION',
      payload: { id: application.id, data },
    });
  };

  const addDirector = () => {
    const newDirector = createEmptyDirector();
    dispatch({
      type: 'ADD_DIRECTOR',
      payload: { applicationId: application.id, director: newDirector },
    });
  };

  const removeDirector = (directorId: string) => {
    if (application.directors.length > 1) {
      dispatch({
        type: 'REMOVE_DIRECTOR',
        payload: { applicationId: application.id, directorId },
      });
    }
  };

  const updateDirector = (directorId: string, data: Partial<Director>) => {
    dispatch({
      type: 'UPDATE_DIRECTOR',
      payload: { applicationId: application.id, directorId, data },
    });
  };

  const addShareholder = () => {
    const newShareholder = createEmptyShareholder();
    dispatch({
      type: 'ADD_SHAREHOLDER',
      payload: { applicationId: application.id, shareholder: newShareholder },
    });
  };

  const removeShareholder = (shareholderId: string) => {
    if (application.shareholders.length > 1) {
      dispatch({
        type: 'REMOVE_SHAREHOLDER',
        payload: { applicationId: application.id, shareholderId },
      });
    }
  };

  const updateShareholder = (shareholderId: string, data: Partial<Shareholder>) => {
    dispatch({
      type: 'UPDATE_SHAREHOLDER',
      payload: { applicationId: application.id, shareholderId, data },
    });
  };

  const copyContactToRegistered = () => {
    const contactAddress = application.contactDetails.address;
    updateApplication({
      registeredAddress: {
        line1: contactAddress.street,
        line2: '',
        city: contactAddress.city,
        county: contactAddress.state,
        postcode: contactAddress.postalCode,
        country: contactAddress.country,
        useContactAddress: true,
      },
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={application.contactDetails.firstName}
                  onChange={(e) => updateApplication({
                    contactDetails: {
                      ...application.contactDetails,
                      firstName: e.target.value,
                    },
                  })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={application.contactDetails.lastName}
                  onChange={(e) => updateApplication({
                    contactDetails: {
                      ...application.contactDetails,
                      lastName: e.target.value,
                    },
                  })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={application.contactDetails.email}
                  onChange={(e) => updateApplication({
                    contactDetails: {
                      ...application.contactDetails,
                      email: e.target.value,
                    },
                  })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={application.contactDetails.phone}
                  onChange={(e) => updateApplication({
                    contactDetails: {
                      ...application.contactDetails,
                      phone: e.target.value,
                    },
                  })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Contact Address</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={application.contactDetails.address.street}
                    onChange={(e) => updateApplication({
                      contactDetails: {
                        ...application.contactDetails,
                        address: {
                          ...application.contactDetails.address,
                          line1: e.target.value,
                        },
                      },
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={application.contactDetails.address.city}
                    onChange={(e) => updateApplication({
                      contactDetails: {
                        ...application.contactDetails,
                        address: {
                          ...application.contactDetails.address,
                          city: e.target.value,
                        },
                      },
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={application.contactDetails.address.state}
                    onChange={(e) => updateApplication({
                      contactDetails: {
                        ...application.contactDetails,
                        address: {
                          ...application.contactDetails.address,
                          state: e.target.value,
                        },
                      },
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="State/Province"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    value={application.contactDetails.address.postalCode}
                    onChange={(e) => updateApplication({
                      contactDetails: {
                        ...application.contactDetails,
                        address: {
                          ...application.contactDetails.address,
                          postalCode: e.target.value,
                        },
                      },
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={application.contactDetails.address.country}
                    onChange={(e) => updateApplication({
                      contactDetails: {
                        ...application.contactDetails,
                        address: {
                          ...application.contactDetails.address,
                          country: e.target.value,
                        },
                      },
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Company Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Proposed Company Name *
                </label>
                <input
                  type="text"
                  value={application.companyDetails.proposedName}
                  onChange={(e) => updateApplication({
                    companyDetails: {
                      ...application.companyDetails,
                      proposedName: e.target.value,
                    },
                  })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Company Name Ltd."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Alternative Name
                </label>
                <input
                  type="text"
                  value={application.companyDetails.alternativeName}
                  onChange={(e) => updateApplication({
                    companyDetails: {
                      ...application.companyDetails,
                      alternativeName: e.target.value,
                    },
                  })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Alternative Company Name Ltd."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Authorized Capital ({application.jurisdiction.currency})
                </label>
                <input
                  type="number"
                  value={application.companyDetails.authorizedCapital}
                  onChange={(e) => updateApplication({
                    companyDetails: {
                      ...application.companyDetails,
                      authorizedCapital: parseInt(e.target.value) || 0,
                    },
                  })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Shares
                </label>
                <input
                  type="number"
                  value={application.companyDetails.numberOfShares}
                  onChange={(e) => updateApplication({
                    companyDetails: {
                      ...application.companyDetails,
                      numberOfShares: parseInt(e.target.value) || 0,
                    },
                  })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Activity/Purpose *
              </label>
              <textarea
                value={application.companyDetails.businessActivity}
                onChange={(e) => updateApplication({
                  companyDetails: {
                    ...application.companyDetails,
                    businessActivity: e.target.value,
                  },
                })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the main business activities of your company..."
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-white">Registered Office Address</h4>
                <button
                  type="button"
                  onClick={copyContactToRegistered}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  Copy from Contact Address
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={application.registeredAddress.line1}
                    onChange={(e) => updateApplication({
                      registeredAddress: {
                        ...application.registeredAddress,
                        line1: e.target.value,
                        useContactAddress: false,
                      },
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Business Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={application.registeredAddress.city}
                    onChange={(e) => updateApplication({
                      registeredAddress: {
                        ...application.registeredAddress,
                        city: e.target.value,
                        useContactAddress: false,
                      },
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={application.registeredAddress.state}
                    onChange={(e) => updateApplication({
                      registeredAddress: {
                        ...application.registeredAddress,
                        state: e.target.value,
                        useContactAddress: false,
                      },
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="State/Province"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    value={application.registeredAddress.postalCode}
                    onChange={(e) => updateApplication({
                      registeredAddress: {
                        ...application.registeredAddress,
                        postalCode: e.target.value,
                        useContactAddress: false,
                      },
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={application.registeredAddress.country}
                    onChange={(e) => updateApplication({
                      registeredAddress: {
                        ...application.registeredAddress,
                        country: e.target.value,
                        useContactAddress: false,
                      },
                    })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Directors Information</h3>
              <button
                type="button"
                onClick={addDirector}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Director
              </button>
            </div>

            {application.directors.map((director, index) => (
              <div key={director.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-white">Director {index + 1}</h4>
                  {application.directors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDirector(director.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={director.firstName}
                      onChange={(e) => updateDirector(director.id, { firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="First name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={director.lastName}
                      onChange={(e) => updateDirector(director.id, { lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Last name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nationality *
                    </label>
                    <input
                      type="text"
                      value={director.nationality}
                      onChange={(e) => updateDirector(director.id, { nationality: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nationality"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Passport Number *
                    </label>
                    <input
                      type="text"
                      value={director.passportNumber}
                      onChange={(e) => updateDirector(director.id, { passportNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Passport number"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Shareholders Information</h3>
              <button
                type="button"
                onClick={addShareholder}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Shareholder
              </button>
            </div>

            {application.shareholders.map((shareholder, index) => (
              <div key={shareholder.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-white">Shareholder {index + 1}</h4>
                  {application.shareholders.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeShareholder(shareholder.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={shareholder.firstName}
                      onChange={(e) => updateShareholder(shareholder.id, { firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="First name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={shareholder.lastName}
                      onChange={(e) => updateShareholder(shareholder.id, { lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Last name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Share Percentage *
                    </label>
                    <input
                      type="number"
                      value={shareholder.sharePercentage}
                      onChange={(e) => updateShareholder(shareholder.id, { sharePercentage: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="25"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nationality *
                    </label>
                    <input
                      type="text"
                      value={shareholder.nationality}
                      onChange={(e) => updateShareholder(shareholder.id, { nationality: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nationality"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                <span className="font-semibold">Note:</span> Total share percentage: {application.shareholders.reduce((sum, s) => sum + s.sharePercentage, 0)}%
                {application.shareholders.reduce((sum, s) => sum + s.sharePercentage, 0) !== 100 && (
                  <span className="text-yellow-400 ml-2">⚠️ Should total 100%</span>
                )}
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Review Your Application</h3>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h4 className="text-lg font-medium text-white mb-4">Order Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">{application.jurisdiction.name} Company Formation</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(application.jurisdiction.price, application.jurisdiction.currency)}
                  </span>
                </div>

                {application.additionalServices.map((service) => (
                  <div key={service.id} className="flex justify-between">
                    <span className="text-gray-300">{service.name}</span>
                    <span className="text-white">{formatCurrency(service.price, service.currency)}</span>
                  </div>
                ))}

                <div className="border-t border-gray-600 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-white">Total</span>
                    <span className="text-blue-400">
                      {formatCurrency(
                        application.jurisdiction.price + application.additionalServices.reduce((sum, s) => sum + s.price, 0),
                        application.jurisdiction.currency
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
              <p className="text-green-300 text-sm">
                <span className="font-semibold">✓ Ready to proceed:</span> Your application is complete and ready for submission.
                Click &quot;Add to Portfolio&quot; to continue with payment.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center ${
                step.id < steps.length ? 'flex-1' : ''
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.id === currentStep
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : step.id < currentStep
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-600 bg-gray-800 text-gray-400'
                }`}
              >
                {step.id < currentStep ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>

              {step.id < steps.length && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    step.id < currentStep ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold text-white">
            {steps[currentStep - 1].name}
          </h2>
          <p className="text-gray-400 text-sm">
            {steps[currentStep - 1].description}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        {currentStep < steps.length ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
          >
            Next
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => window.location.href = '/portfolio'}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
          >
            Add to Portfolio
          </button>
        )}
      </div>
    </div>
  );
}