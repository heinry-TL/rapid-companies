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

export default function ApplicationFormNew({ application }: ApplicationFormProps) {
  const { dispatch } = usePortfolio();
  const [currentStep, setCurrentStep] = useState(() => {
    const step = (application.stepCompleted || 0) + 1;
    return Math.min(Math.max(step, 1), steps.length);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const saveToDatabase = async (stepCompleted: number) => {
    setIsLoading(true);
    try {
      // Transform application data to match API expectations
      const applicationData = {
        jurisdiction: {
          name: application.jurisdiction.name,
          price: application.jurisdiction.price,
          currency: application.jurisdiction.currency
        },
        contactDetails: {
          firstName: application.contactDetails.firstName,
          lastName: application.contactDetails.lastName,
          email: application.contactDetails.email,
          phone: application.contactDetails.phone
        },
        companyDetails: {
          proposedName: application.companyDetails.proposedName,
          businessActivity: application.companyDetails.businessActivity
        }
      };

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response:', errorData);
        throw new Error('Failed to save application');
      }

      const result = await response.json();
      console.log('Application saved successfully:', result);

      // Update local state
      updateApplication({
        stepCompleted,
        isComplete: stepCompleted >= 5,
      });

    } catch (error) {
      console.error('Error saving application:', error);
      alert('Failed to save application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!application.contactDetails.firstName || !application.contactDetails.lastName) {
          alert('Please enter your first and last name.');
          return false;
        }
        if (!application.contactDetails.email) {
          alert('Please enter your email address.');
          return false;
        }
        if (!validateEmail(application.contactDetails.email)) {
          setEmailError('Please enter a valid email address.');
          return false;
        }
        setEmailError('');
        if (!application.contactDetails.phone) {
          alert('Please enter your phone number.');
          return false;
        }
        if (!application.contactDetails.address.street) {
          alert('Please enter your address.');
          return false;
        }
        return true;

      case 2:
        if (!application.companyDetails.proposedName) {
          alert('Please enter the proposed company name.');
          return false;
        }
        if (!application.companyDetails.businessActivity) {
          alert('Please describe the business activity.');
          return false;
        }
        return true;

      case 3:
        for (const director of application.directors) {
          if (!director.firstName || !director.lastName) {
            alert('Please complete all director information.');
            return false;
          }
        }
        return true;

      case 4:
        for (const shareholder of application.shareholders) {
          if (!shareholder.firstName || !shareholder.lastName || shareholder.sharePercentage <= 0) {
            alert('Please complete all shareholder information.');
            return false;
          }
        }
        const totalShares = application.shareholders.reduce((sum, s) => sum + s.sharePercentage, 0);
        if (Math.abs(totalShares - 100) > 0.01) {
          alert('Share percentages must total exactly 100%.');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    // Save current step to database
    await saveToDatabase(currentStep);

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
                  onChange={(e) => {
                    const email = e.target.value;
                    updateApplication({
                      contactDetails: {
                        ...application.contactDetails,
                        email,
                      },
                    });

                    if (email && !validateEmail(email)) {
                      setEmailError('Please enter a valid email address.');
                    } else {
                      setEmailError('');
                    }
                  }}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                  }`}
                  placeholder="your@email.com"
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-400">{emailError}</p>
                )}
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
                  placeholder="+44 20 1234 5678"
                />
              </div>
            </div>

            <AddressForm
              address={{
                line1: application.contactDetails.address.street,
                line2: '',
                city: application.contactDetails.address.city,
                county: application.contactDetails.address.state,
                postcode: application.contactDetails.address.postalCode,
                country: application.contactDetails.address.country,
              }}
              onChange={(address) => updateApplication({
                contactDetails: {
                  ...application.contactDetails,
                  address: {
                    street: address.line1,
                    city: address.city,
                    state: address.county,
                    postalCode: address.postcode,
                    country: address.country,
                  },
                },
              })}
              prefix="Contact"
            />
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

            <AddressForm
              address={application.registeredAddress}
              onChange={(address) => updateApplication({
                registeredAddress: {
                  ...address,
                  useContactAddress: false,
                },
              })}
              prefix="Registered Office"
              showCopyButton={true}
              onCopyClick={copyContactToRegistered}
            />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                <AddressForm
                  address={director.address}
                  onChange={(address) => updateDirector(director.id, { address })}
                  prefix={`Director ${index + 1}`}
                />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                <AddressForm
                  address={shareholder.address}
                  onChange={(address) => updateShareholder(shareholder.id, { address })}
                  prefix={`Shareholder ${index + 1}`}
                />
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
                Click &quot;Complete Application&quot; to add to your portfolio.
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
            {steps[currentStep - 1]?.name || 'Step'}
          </h2>
          <p className="text-gray-400 text-sm">
            {steps[currentStep - 1]?.description || 'Please complete this step'}
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
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                Next
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              saveToDatabase(5);
              window.location.href = '/portfolio';
            }}
            disabled={isLoading}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg font-semibold"
          >
            {isLoading ? 'Completing...' : 'Complete Application'}
          </button>
        )}
      </div>
    </div>
  );
}