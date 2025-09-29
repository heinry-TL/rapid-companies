'use client';

import { countries, getAddressFields, getCountryByName } from '@/lib/countries';

interface AddressData {
  line1: string;
  line2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
}

interface AddressFormProps {
  address: AddressData;
  onChange: (address: AddressData) => void;
  prefix: string;
  showCopyButton?: boolean;
  onCopyClick?: () => void;
}

export default function AddressForm({
  address,
  onChange,
  prefix,
  showCopyButton = false,
  onCopyClick
}: AddressFormProps) {
  const selectedCountry = getCountryByName(address.country);
  const addressFormat = selectedCountry?.addressFormat || 'UK';
  const addressFields = getAddressFields(addressFormat);

  const handleFieldChange = (field: string, value: string) => {
    onChange({
      ...address,
      [field]: value,
    });
  };

  const handleCountryChange = (countryName: string) => {
    onChange({
      ...address,
      country: countryName,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-white">{prefix} Address</h4>
        {showCopyButton && onCopyClick && (
          <button
            type="button"
            onClick={onCopyClick}
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            Copy from Contact Address
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Country Selector */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Country *
          </label>
          <select
            value={address.country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {countries.map((country) => (
              <option key={country.code} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Address Fields */}
        {addressFields.map((field) => (
          <div
            key={field.name}
            className={field.name === 'line1' ? 'md:col-span-2' : ''}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {field.label} {field.required && '*'}
            </label>
            <input
              type="text"
              value={address[field.name as keyof typeof address] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        ))}
      </div>
    </div>
  );
}