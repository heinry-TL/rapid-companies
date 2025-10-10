'use client';

import { useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type StepStatus = 'upcoming' | 'current' | 'completed';

interface Step {
  id: number;
  name: string;
  description: string;
}

export interface TrusteeData {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  idType: string;
  idNumber: string;
}

export interface BeneficiaryData {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  relationship: string;
  benefitType: string; // e.g., "Income", "Capital", "Both"
  percentage: number;
}

export interface SettlorData {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  idType: string;
  idNumber: string;
}

export interface TrustFormationData {
  // Mode selection
  provideDetailsNow: boolean;

  // Contact Information (always required)
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;

  // Trust Details (required if provideDetailsNow = true)
  trustName?: string;
  trustType?: string;
  jurisdiction: string;
  jurisdictionPrice: number;
  trustPurpose?: string;

  // Settlor Information
  settlor?: SettlorData;

  // Trustees (array)
  trustees?: TrusteeData[];

  // Beneficiaries (array)
  beneficiaries?: BeneficiaryData[];

  // Additional Information
  additionalNotes?: string;
  specialInstructions?: string;
}

interface TrustFormationFormProps {
  onSubmit: (data: TrustFormationData) => void;
  onCancel: () => void;
  availableJurisdictions?: { name: string; price: number }[]; // Made optional since we'll use hardcoded list
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function TrustFormationForm({
  onSubmit,
  onCancel,
}: TrustFormationFormProps) {
  const [step, setStep] = useState(0); // Start at 0 for mode selection
  const [provideDetailsNow, setProvideDetailsNow] = useState<boolean | null>(null);

  // Hardcoded jurisdictions for trust formation
  const hardcodedJurisdictions = [
    { name: 'Belize', price: 2500 },
    { name: 'British Virgin Islands (BVI)', price: 3500 },
    { name: 'Cyprus', price: 3000 },
    { name: 'Delaware', price: 2000 },
    { name: 'Gibraltar', price: 3200 },
    { name: 'Hong Kong', price: 4000 },
    { name: 'Seychelles', price: 2200 },
    { name: 'United Kingdom', price: 3800 },
  ];

  // Use hardcoded jurisdictions instead of passed prop
  const jurisdictions = hardcodedJurisdictions;

  // Define all possible steps
  const allSteps: Step[] = [
    { id: 0, name: 'Choose Option', description: 'Select how you want to proceed' },
    { id: 1, name: 'Contact', description: 'Your contact information' },
    { id: 2, name: 'Trust Details', description: 'Trust information and jurisdiction' },
    { id: 3, name: 'Settlor', description: 'Settlor information' },
    { id: 4, name: 'Trustees', description: 'Trustee details' },
    { id: 5, name: 'Beneficiaries', description: 'Beneficiary information' },
    { id: 6, name: 'Review', description: 'Review and submit' },
  ];

  // Contact Information
  const [contactFirstName, setContactFirstName] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Trust Details
  const [trustName, setTrustName] = useState('');
  const [trustType, setTrustType] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [jurisdictionPrice, setJurisdictionPrice] = useState(0);
  const [trustPurpose, setTrustPurpose] = useState('');

  // Settlor
  const [settlor, setSettlor] = useState<SettlorData>({
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    address: { line1: '', line2: '', city: '', state: '', postalCode: '', country: 'United Kingdom' },
    idType: '',
    idNumber: '',
  });

  // Trustees
  const [trustees, setTrustees] = useState<TrusteeData[]>([{
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    address: { line1: '', line2: '', city: '', state: '', postalCode: '', country: 'United Kingdom' },
    idType: '',
    idNumber: '',
  }]);

  // Beneficiaries
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryData[]>([{
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    relationship: '',
    benefitType: 'Both',
    percentage: 100,
  }]);

  // Additional Info
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 0: // Mode selection
        return provideDetailsNow !== null;

      case 1: // Contact information
        if (!contactFirstName || !contactLastName || !contactEmail || !contactPhone) {
          alert('Please fill in all contact information fields');
          return false;
        }
        // If providing details later, also validate jurisdiction selection
        if (!provideDetailsNow && !jurisdiction) {
          alert('Please select a jurisdiction');
          return false;
        }
        return true;

      case 2: // Trust details
        if (!trustName || !jurisdiction || !trustType) {
          alert('Please fill in all required trust details');
          return false;
        }
        return true;

      case 3: // Settlor
        if (!settlor.firstName || !settlor.lastName || !settlor.email ||
            !settlor.address.line1 || !settlor.address.city) {
          alert('Please fill in all required settlor information');
          return false;
        }
        return true;

      case 4: // Trustees
        if (trustees.length === 0 || !trustees[0].firstName || !trustees[0].lastName) {
          alert('Please add at least one trustee with required information');
          return false;
        }
        return true;

      case 5: // Beneficiaries
        if (beneficiaries.length === 0 || !beneficiaries[0].firstName || !beneficiaries[0].lastName) {
          alert('Please add at least one beneficiary with required information');
          return false;
        }
        // Validate percentage totals
        const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
        if (totalPercentage !== 100) {
          alert(`Total beneficiary percentage must equal 100%. Current total: ${totalPercentage}%`);
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      return;
    }

    // If on step 0 and choosing "later", skip to step 1 with just contact + jurisdiction
    if (step === 0 && provideDetailsNow === false) {
      setStep(1);
      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData: TrustFormationData = {
      provideDetailsNow: provideDetailsNow!,
      contactFirstName,
      contactLastName,
      contactEmail,
      contactPhone,
      jurisdiction,
      jurisdictionPrice,
    };

    if (provideDetailsNow) {
      formData.trustName = trustName;
      formData.trustType = trustType;
      formData.trustPurpose = trustPurpose;
      formData.settlor = settlor;
      formData.trustees = trustees;
      formData.beneficiaries = beneficiaries;
      formData.additionalNotes = additionalNotes;
      formData.specialInstructions = specialInstructions;
    }

    onSubmit(formData);
  };

  const addTrustee = () => {
    setTrustees([...trustees, {
      title: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      nationality: '',
      address: { line1: '', line2: '', city: '', state: '', postalCode: '', country: 'United Kingdom' },
      idType: '',
      idNumber: '',
    }]);
  };

  const removeTrustee = (index: number) => {
    setTrustees(trustees.filter((_, i) => i !== index));
  };

  const addBeneficiary = () => {
    setBeneficiaries([...beneficiaries, {
      title: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      nationality: '',
      relationship: '',
      benefitType: 'Both',
      percentage: 0,
    }]);
  };

  const removeBeneficiary = (index: number) => {
    setBeneficiaries(beneficiaries.filter((_, i) => i !== index));
  };

  // Step indicator component
  const StepIndicator = () => {
    if (step === 0) return null; // Don't show on mode selection

    const currentActiveSteps = provideDetailsNow === false
      ? [allSteps[1]] // Just show contact step
      : allSteps.slice(1); // Show all steps except mode selection

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {currentActiveSteps.map((s, index) => {
            const status: StepStatus =
              s.id < step ? 'completed' :
              s.id === step ? 'current' :
              'upcoming';

            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center w-full">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    status === 'completed'
                      ? 'bg-green-500 border-green-500'
                      : status === 'current'
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-gray-700 border-gray-600'
                  }`}>
                    {status === 'completed' ? (
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className={`text-sm font-semibold ${status === 'current' ? 'text-white' : 'text-gray-400'}`}>
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${status === 'current' ? 'text-blue-400' : status === 'completed' ? 'text-green-400' : 'text-gray-500'}`}>
                      {s.name}
                    </p>
                  </div>
                </div>
                {index < currentActiveSteps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 mb-6 ${status === 'completed' ? 'bg-green-500' : 'bg-gray-700'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Trust Formation Application</h3>
        <p className="text-gray-400">
          {step === 0 ? 'Choose how you\'d like to proceed with your application' :
           provideDetailsNow === false ? 'Provide your contact details and jurisdiction' :
           'Complete all steps to submit your trust formation application'}
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator />

      {/* Step 0: Mode Selection */}
      {step === 0 && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-700">
            <h4 className="text-xl font-semibold text-white mb-6 text-center">When would you like to provide trust details?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => {
                  setProvideDetailsNow(true);
                  handleNext();
                }}
                className="group p-8 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl transition-all duration-200 text-left shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg font-bold mb-2">Provide Details Now</h5>
                    <p className="text-sm text-blue-100 leading-relaxed">
                      Complete the full application form including settlor, trustees, and beneficiaries information.
                      Get faster processing by providing all details upfront.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvideDetailsNow(false);
                  handleNext();
                }}
                className="group p-8 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-200 text-left shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg font-bold mb-2">Provide Details Later</h5>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Pay now and provide trust details later. We'll contact you after payment to collect
                      the necessary information.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Contact Information */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Contact Information
            </h4>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={contactFirstName}
                    onChange={(e) => setContactFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={contactLastName}
                    onChange={(e) => setContactLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+44 20 1234 5678"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>

              {/* Show jurisdiction selection on contact step if providing details later */}
              {!provideDetailsNow && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Jurisdiction <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={jurisdiction}
                    onChange={(e) => {
                      setJurisdiction(e.target.value);
                      const selected = jurisdictions.find(j => j.name === e.target.value);
                      setJurisdictionPrice(selected?.price || 0);
                    }}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  >
                    <option value="">Choose jurisdiction...</option>
                    {jurisdictions.map((j) => (
                      <option key={j.name} value={j.name}>
                        {j.name} - £{j.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                  {jurisdiction && jurisdictionPrice > 0 && (
                    <p className="mt-2 text-sm text-blue-400">
                      Price: £{jurisdictionPrice.toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            {provideDetailsNow ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center"
              >
                Continue
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center shadow-lg"
              >
                Proceed to Payment
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Trust Details */}
      {step === 2 && provideDetailsNow && (
        <div className="space-y-6">
          <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Trust Details
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Trust Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter the name of the trust"
                  value={trustName}
                  onChange={(e) => setTrustName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Trust Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={trustType}
                  onChange={(e) => setTrustType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                >
                  <option value="">Select trust type...</option>
                  <option value="Discretionary Trust">Discretionary Trust</option>
                  <option value="Fixed Trust">Fixed Trust</option>
                  <option value="Unit Trust">Unit Trust</option>
                  <option value="Charitable Trust">Charitable Trust</option>
                  <option value="Purpose Trust">Purpose Trust</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Jurisdiction <span className="text-red-400">*</span>
                </label>
                <select
                  value={jurisdiction}
                  onChange={(e) => {
                    setJurisdiction(e.target.value);
                    const selected = jurisdictions.find(j => j.name === e.target.value);
                    setJurisdictionPrice(selected?.price || 0);
                  }}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                >
                  <option value="">Choose jurisdiction...</option>
                  {jurisdictions.map((j) => (
                    <option key={j.name} value={j.name}>
                      {j.name} - £{j.price.toLocaleString()}
                    </option>
                  ))}
                </select>
                {jurisdiction && jurisdictionPrice > 0 && (
                  <div className="mt-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-400 font-medium">
                      Selected Price: £{jurisdictionPrice.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Trust Purpose <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  placeholder="Describe the purpose and objectives of the trust"
                  value={trustPurpose}
                  onChange={(e) => setTrustPurpose(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center"
            >
              Continue
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Settlor Information */}
      {step === 3 && provideDetailsNow && (
        <div className="space-y-6">
          <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Settlor Information
            </h4>
            <p className="text-gray-400 text-sm mb-6">The settlor is the person creating and funding the trust</p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={settlor.title}
                    onChange={(e) => setSettlor({ ...settlor, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                    <option value="Dr">Dr</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="First name"
                    value={settlor.firstName}
                    onChange={(e) => setSettlor({ ...settlor, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Last name"
                    value={settlor.lastName}
                    onChange={(e) => setSettlor({ ...settlor, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={settlor.email}
                    onChange={(e) => setSettlor({ ...settlor, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+44 20 1234 5678"
                    value={settlor.phone}
                    onChange={(e) => setSettlor({ ...settlor, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date of Birth <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={settlor.dateOfBirth}
                    onChange={(e) => setSettlor({ ...settlor, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nationality <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., British"
                    value={settlor.nationality}
                    onChange={(e) => setSettlor({ ...settlor, nationality: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h5 className="text-white font-medium mb-4">Address</h5>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address Line 1 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Street address"
                      value={settlor.address.line1}
                      onChange={(e) => setSettlor({ ...settlor, address: { ...settlor.address, line1: e.target.value } })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address Line 2 <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Apt, suite, etc."
                      value={settlor.address.line2}
                      onChange={(e) => setSettlor({ ...settlor, address: { ...settlor.address, line2: e.target.value } })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        City <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="City"
                        value={settlor.address.city}
                        onChange={(e) => setSettlor({ ...settlor, address: { ...settlor.address, city: e.target.value } })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Postal Code <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Postal code"
                        value={settlor.address.postalCode}
                        onChange={(e) => setSettlor({ ...settlor, address: { ...settlor.address, postalCode: e.target.value } })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Country <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Country"
                      value={settlor.address.country}
                      onChange={(e) => setSettlor({ ...settlor, address: { ...settlor.address, country: e.target.value } })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h5 className="text-white font-medium mb-4">Identification</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ID Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={settlor.idType}
                      onChange={(e) => setSettlor({ ...settlor, idType: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    >
                      <option value="">Select ID type...</option>
                      <option value="Passport">Passport</option>
                      <option value="Driver's License">Driver's License</option>
                      <option value="National ID">National ID</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ID Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ID number"
                      value={settlor.idNumber}
                      onChange={(e) => setSettlor({ ...settlor, idNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center"
            >
              Continue
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Trustees */}
      {step === 4 && provideDetailsNow && (
        <div className="space-y-6">
          <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Trustees
            </h4>
            <p className="text-gray-400 text-sm mb-6">Add at least one trustee who will manage the trust</p>

            <div className="space-y-6">
              {trustees.map((trustee, index) => (
                <div key={index} className="p-5 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="text-white font-medium">Trustee {index + 1}</h5>
                    {trustees.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTrustee(index)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          First Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="First name"
                          value={trustee.firstName}
                          onChange={(e) => {
                            const newTrustees = [...trustees];
                            newTrustees[index].firstName = e.target.value;
                            setTrustees(newTrustees);
                          }}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Last Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Last name"
                          value={trustee.lastName}
                          onChange={(e) => {
                            const newTrustees = [...trustees];
                            newTrustees[index].lastName = e.target.value;
                            setTrustees(newTrustees);
                          }}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="email@example.com"
                          value={trustee.email}
                          onChange={(e) => {
                            const newTrustees = [...trustees];
                            newTrustees[index].email = e.target.value;
                            setTrustees(newTrustees);
                          }}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="+44 20 1234 5678"
                          value={trustee.phone}
                          onChange={(e) => {
                            const newTrustees = [...trustees];
                            newTrustees[index].phone = e.target.value;
                            setTrustees(newTrustees);
                          }}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addTrustee}
                className="w-full py-3 bg-blue-900/20 hover:bg-blue-900/30 text-blue-400 rounded-lg border border-blue-500/30 transition-colors font-medium flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Another Trustee
              </button>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center"
            >
              Continue
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Beneficiaries */}
      {step === 5 && provideDetailsNow && (
        <div className="space-y-6">
          <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Beneficiaries
            </h4>
            <p className="text-gray-400 text-sm mb-6">Add beneficiaries who will benefit from the trust. Total percentage must equal 100%.</p>

            <div className="space-y-6">
              {beneficiaries.map((beneficiary, index) => (
                <div key={index} className="p-5 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="text-white font-medium">Beneficiary {index + 1}</h5>
                    {beneficiaries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBeneficiary(index)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          First Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="First name"
                          value={beneficiary.firstName}
                          onChange={(e) => {
                            const newBeneficiaries = [...beneficiaries];
                            newBeneficiaries[index].firstName = e.target.value;
                            setBeneficiaries(newBeneficiaries);
                          }}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Last Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Last name"
                          value={beneficiary.lastName}
                          onChange={(e) => {
                            const newBeneficiaries = [...beneficiaries];
                            newBeneficiaries[index].lastName = e.target.value;
                            setBeneficiaries(newBeneficiaries);
                          }}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Relationship <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Child, Spouse, Sibling"
                          value={beneficiary.relationship}
                          onChange={(e) => {
                            const newBeneficiaries = [...beneficiaries];
                            newBeneficiaries[index].relationship = e.target.value;
                            setBeneficiaries(newBeneficiaries);
                          }}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Benefit Type <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={beneficiary.benefitType}
                          onChange={(e) => {
                            const newBeneficiaries = [...beneficiaries];
                            newBeneficiaries[index].benefitType = e.target.value;
                            setBeneficiaries(newBeneficiaries);
                          }}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          required
                        >
                          <option value="Both">Both (Income & Capital)</option>
                          <option value="Income">Income Only</option>
                          <option value="Capital">Capital Only</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Percentage Share <span className="text-red-400">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="0"
                          value={beneficiary.percentage}
                          onChange={(e) => {
                            const newBeneficiaries = [...beneficiaries];
                            newBeneficiaries[index].percentage = parseFloat(e.target.value) || 0;
                            setBeneficiaries(newBeneficiaries);
                          }}
                          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          required
                        />
                        <span className="text-gray-400 font-medium">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Total percentage indicator */}
              <div className={`p-4 rounded-lg border ${
                beneficiaries.reduce((sum, b) => sum + b.percentage, 0) === 100
                  ? 'bg-green-900/20 border-green-500/30'
                  : 'bg-yellow-900/20 border-yellow-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Total Percentage:</span>
                  <span className={`text-lg font-bold ${
                    beneficiaries.reduce((sum, b) => sum + b.percentage, 0) === 100
                      ? 'text-green-400'
                      : 'text-yellow-400'
                  }`}>
                    {beneficiaries.reduce((sum, b) => sum + b.percentage, 0).toFixed(2)}%
                  </span>
                </div>
                {beneficiaries.reduce((sum, b) => sum + b.percentage, 0) !== 100 && (
                  <p className="text-xs text-yellow-400 mt-1">
                    Total must equal 100% to continue
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={addBeneficiary}
                className="w-full py-3 bg-blue-900/20 hover:bg-blue-900/30 text-blue-400 rounded-lg border border-blue-500/30 transition-colors font-medium flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Another Beneficiary
              </button>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center"
            >
              Continue
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Review & Submit */}
      {step === 6 && provideDetailsNow && (
        <div className="space-y-6">
          <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Review & Submit
            </h4>

            {/* Summary Card */}
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h5 className="text-white font-medium mb-3">Trust Summary</h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Trust Name:</p>
                    <p className="text-white font-medium">{trustName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Trust Type:</p>
                    <p className="text-white font-medium">{trustType}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Jurisdiction:</p>
                    <p className="text-white font-medium">{jurisdiction}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Price:</p>
                    <p className="text-blue-400 font-bold">£{jurisdictionPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Settlor:</p>
                    <p className="text-white font-medium">{settlor.firstName} {settlor.lastName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Trustees:</p>
                    <p className="text-white font-medium">{trustees.length} trustee(s)</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400">Beneficiaries:</p>
                    <p className="text-white font-medium">
                      {beneficiaries.map(b => `${b.firstName} ${b.lastName} (${b.percentage}%)`).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Notes <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  placeholder="Any additional information you'd like to share..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Special Instructions <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  placeholder="Any special requirements or instructions..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Submit Application
            </button>
          </div>
        </div>
      )}

    </form>
  );
}
