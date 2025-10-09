'use client';

import { useState } from 'react';

export interface MailForwardingData {
  // Personal Details
  entityType: 'company' | 'individual';
  entityName: string;
  contactPerson: string;
  email: string;
  phone: string;

  // Address Details
  address: {
    line1: string;
    line2: string;
    city: string;
    county: string;
    postcode: string;
    country: string;
  };

  // Service Details
  jurisdiction: string;
  jurisdictionPrice: number;
  forwardingFrequency: 'weekly' | 'biweekly' | 'monthly';
  serviceUsers: string; // Who will use this service
  additionalInfo: string;
}

interface JurisdictionOption {
  name: string;
  price: number;
}

interface MailForwardingFormProps {
  onSubmit: (data: MailForwardingData) => void;
  onCancel: () => void;
  availableJurisdictions: JurisdictionOption[];
}

export default function MailForwardingForm({ onSubmit, onCancel, availableJurisdictions }: MailForwardingFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<MailForwardingData>({
    entityType: 'company',
    entityName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      county: '',
      postcode: '',
      country: 'United Kingdom',
    },
    jurisdiction: availableJurisdictions.length > 0 ? availableJurisdictions[0].name : '',
    jurisdictionPrice: availableJurisdictions.length > 0 ? availableJurisdictions[0].price : 0,
    forwardingFrequency: 'weekly',
    serviceUsers: '',
    additionalInfo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.entityName.trim()) {
      newErrors.entityName = `${formData.entityType === 'company' ? 'Company' : 'Individual'} name is required`;
    }
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.address.line1.trim()) {
      newErrors['address.line1'] = 'Address line 1 is required';
    }
    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    if (!formData.address.postcode.trim()) {
      newErrors['address.postcode'] = 'Postcode is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.jurisdiction) {
      newErrors.jurisdiction = 'Please select a jurisdiction';
    }
    if (!formData.serviceUsers.trim()) {
      newErrors.serviceUsers = 'Please specify who will use this service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJurisdictionChange = (jurisdictionName: string) => {
    const selectedJurisdiction = availableJurisdictions.find(j => j.name === jurisdictionName);
    if (selectedJurisdiction) {
      setFormData(prev => ({
        ...prev,
        jurisdiction: selectedJurisdiction.name,
        jurisdictionPrice: selectedJurisdiction.price,
      }));
    }
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      onSubmit(formData);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev as any)[parent],
            [child]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${step >= 1 ? 'text-blue-400' : 'text-gray-500'}`}>
            Personal Details
          </span>
          <span className={`text-sm font-medium ${step >= 2 ? 'text-blue-400' : 'text-gray-500'}`}>
            Service Details
          </span>
        </div>
        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300 ease-in-out"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white mb-4">Personal Details</h4>

            {/* Entity Type */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                I am purchasing this service as:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="entityType"
                    value="company"
                    checked={formData.entityType === 'company'}
                    onChange={(e) => updateFormData('entityType', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-300">Company</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="entityType"
                    value="individual"
                    checked={formData.entityType === 'individual'}
                    onChange={(e) => updateFormData('entityType', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-300">Individual</span>
                </label>
              </div>
            </div>

            {/* Entity Name */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                {formData.entityType === 'company' ? 'Company Name' : 'Full Name'} *
              </label>
              <input
                type="text"
                value={formData.entityName}
                onChange={(e) => updateFormData('entityName', e.target.value)}
                className={`w-full px-4 py-2 bg-gray-700 border ${errors.entityName ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:border-blue-500`}
                placeholder={formData.entityType === 'company' ? 'Enter company name' : 'Enter your full name'}
              />
              {errors.entityName && <p className="text-red-400 text-sm mt-1">{errors.entityName}</p>}
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Contact Person *
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => updateFormData('contactPerson', e.target.value)}
                className={`w-full px-4 py-2 bg-gray-700 border ${errors.contactPerson ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:border-blue-500`}
                placeholder="Enter contact person name"
              />
              {errors.contactPerson && <p className="text-red-400 text-sm mt-1">{errors.contactPerson}</p>}
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={`w-full px-4 py-2 bg-gray-700 border ${errors.email ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:border-blue-500`}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className={`w-full px-4 py-2 bg-gray-700 border ${errors.phone ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:border-blue-500`}
                  placeholder="+44 1234 567890"
                />
                {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h5 className="text-white font-medium">Address</h5>

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Address Line 1 *</label>
                <input
                  type="text"
                  value={formData.address.line1}
                  onChange={(e) => updateFormData('address.line1', e.target.value)}
                  className={`w-full px-4 py-2 bg-gray-700 border ${errors['address.line1'] ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:border-blue-500`}
                  placeholder="Street address"
                />
                {errors['address.line1'] && <p className="text-red-400 text-sm mt-1">{errors['address.line1']}</p>}
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm">Address Line 2</label>
                <input
                  type="text"
                  value={formData.address.line2}
                  onChange={(e) => updateFormData('address.line2', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">City *</label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => updateFormData('address.city', e.target.value)}
                    className={`w-full px-4 py-2 bg-gray-700 border ${errors['address.city'] ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:border-blue-500`}
                    placeholder="City"
                  />
                  {errors['address.city'] && <p className="text-red-400 text-sm mt-1">{errors['address.city']}</p>}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm">County/State</label>
                  <input
                    type="text"
                    value={formData.address.county}
                    onChange={(e) => updateFormData('address.county', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="County"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">Postcode *</label>
                  <input
                    type="text"
                    value={formData.address.postcode}
                    onChange={(e) => updateFormData('address.postcode', e.target.value)}
                    className={`w-full px-4 py-2 bg-gray-700 border ${errors['address.postcode'] ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:border-blue-500`}
                    placeholder="Postcode"
                  />
                  {errors['address.postcode'] && <p className="text-red-400 text-sm mt-1">{errors['address.postcode']}</p>}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm">Country</label>
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => updateFormData('address.country', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Next Step
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white mb-4">Service Details</h4>

            {/* Jurisdiction Selection */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Select Jurisdiction *
              </label>
              <select
                value={formData.jurisdiction}
                onChange={(e) => handleJurisdictionChange(e.target.value)}
                className={`w-full px-4 py-2 bg-gray-700 border ${errors.jurisdiction ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:border-blue-500`}
              >
                {availableJurisdictions.map((jurisdiction) => (
                  <option key={jurisdiction.name} value={jurisdiction.name}>
                    {jurisdiction.name} - £{jurisdiction.price.toFixed(2)}
                  </option>
                ))}
              </select>
              {errors.jurisdiction && <p className="text-red-400 text-sm mt-1">{errors.jurisdiction}</p>}
              <p className="text-gray-400 text-sm mt-1">
                Selected price: <span className="text-blue-400 font-semibold">£{formData.jurisdictionPrice.toFixed(2)}</span>
              </p>
            </div>

            {/* Forwarding Frequency */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Mail Forwarding Frequency *
              </label>
              <select
                value={formData.forwardingFrequency}
                onChange={(e) => updateFormData('forwardingFrequency', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Service Users */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Who will use this service? *
              </label>
              <textarea
                value={formData.serviceUsers}
                onChange={(e) => updateFormData('serviceUsers', e.target.value)}
                className={`w-full px-4 py-2 bg-gray-700 border ${errors.serviceUsers ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:border-blue-500 min-h-[100px]`}
                placeholder="Please describe who will be using this mail forwarding service (e.g., company directors, business operations, etc.)"
              />
              {errors.serviceUsers && <p className="text-red-400 text-sm mt-1">{errors.serviceUsers}</p>}
            </div>

            {/* Additional Info */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Additional Information
              </label>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => updateFormData('additionalInfo', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
                placeholder="Any special requirements or additional information you'd like us to know..."
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
