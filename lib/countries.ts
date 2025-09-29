export interface Country {
  code: string;
  name: string;
  addressFormat: 'UK' | 'US' | 'INTERNATIONAL';
}

export const countries: Country[] = [
  { code: 'GB', name: 'United Kingdom', addressFormat: 'UK' },
  { code: 'US', name: 'United States', addressFormat: 'US' },
  { code: 'CA', name: 'Canada', addressFormat: 'US' },
  { code: 'AU', name: 'Australia', addressFormat: 'US' },
  { code: 'NZ', name: 'New Zealand', addressFormat: 'US' },
  { code: 'IE', name: 'Ireland', addressFormat: 'UK' },
  { code: 'FR', name: 'France', addressFormat: 'INTERNATIONAL' },
  { code: 'DE', name: 'Germany', addressFormat: 'INTERNATIONAL' },
  { code: 'IT', name: 'Italy', addressFormat: 'INTERNATIONAL' },
  { code: 'ES', name: 'Spain', addressFormat: 'INTERNATIONAL' },
  { code: 'NL', name: 'Netherlands', addressFormat: 'INTERNATIONAL' },
  { code: 'BE', name: 'Belgium', addressFormat: 'INTERNATIONAL' },
  { code: 'CH', name: 'Switzerland', addressFormat: 'INTERNATIONAL' },
  { code: 'AT', name: 'Austria', addressFormat: 'INTERNATIONAL' },
  { code: 'SE', name: 'Sweden', addressFormat: 'INTERNATIONAL' },
  { code: 'NO', name: 'Norway', addressFormat: 'INTERNATIONAL' },
  { code: 'DK', name: 'Denmark', addressFormat: 'INTERNATIONAL' },
  { code: 'FI', name: 'Finland', addressFormat: 'INTERNATIONAL' },
  { code: 'PT', name: 'Portugal', addressFormat: 'INTERNATIONAL' },
  { code: 'GR', name: 'Greece', addressFormat: 'INTERNATIONAL' },
  { code: 'PL', name: 'Poland', addressFormat: 'INTERNATIONAL' },
  { code: 'CZ', name: 'Czech Republic', addressFormat: 'INTERNATIONAL' },
  { code: 'HU', name: 'Hungary', addressFormat: 'INTERNATIONAL' },
  { code: 'RO', name: 'Romania', addressFormat: 'INTERNATIONAL' },
  { code: 'BG', name: 'Bulgaria', addressFormat: 'INTERNATIONAL' },
  { code: 'HR', name: 'Croatia', addressFormat: 'INTERNATIONAL' },
  { code: 'SI', name: 'Slovenia', addressFormat: 'INTERNATIONAL' },
  { code: 'SK', name: 'Slovakia', addressFormat: 'INTERNATIONAL' },
  { code: 'EE', name: 'Estonia', addressFormat: 'INTERNATIONAL' },
  { code: 'LV', name: 'Latvia', addressFormat: 'INTERNATIONAL' },
  { code: 'LT', name: 'Lithuania', addressFormat: 'INTERNATIONAL' },
  { code: 'LU', name: 'Luxembourg', addressFormat: 'INTERNATIONAL' },
  { code: 'MT', name: 'Malta', addressFormat: 'INTERNATIONAL' },
  { code: 'CY', name: 'Cyprus', addressFormat: 'INTERNATIONAL' },
  { code: 'JP', name: 'Japan', addressFormat: 'INTERNATIONAL' },
  { code: 'KR', name: 'South Korea', addressFormat: 'INTERNATIONAL' },
  { code: 'CN', name: 'China', addressFormat: 'INTERNATIONAL' },
  { code: 'HK', name: 'Hong Kong', addressFormat: 'INTERNATIONAL' },
  { code: 'SG', name: 'Singapore', addressFormat: 'INTERNATIONAL' },
  { code: 'MY', name: 'Malaysia', addressFormat: 'INTERNATIONAL' },
  { code: 'TH', name: 'Thailand', addressFormat: 'INTERNATIONAL' },
  { code: 'PH', name: 'Philippines', addressFormat: 'INTERNATIONAL' },
  { code: 'ID', name: 'Indonesia', addressFormat: 'INTERNATIONAL' },
  { code: 'VN', name: 'Vietnam', addressFormat: 'INTERNATIONAL' },
  { code: 'IN', name: 'India', addressFormat: 'INTERNATIONAL' },
  { code: 'AE', name: 'United Arab Emirates', addressFormat: 'INTERNATIONAL' },
  { code: 'SA', name: 'Saudi Arabia', addressFormat: 'INTERNATIONAL' },
  { code: 'IL', name: 'Israel', addressFormat: 'INTERNATIONAL' },
  { code: 'TR', name: 'Turkey', addressFormat: 'INTERNATIONAL' },
  { code: 'RU', name: 'Russia', addressFormat: 'INTERNATIONAL' },
  { code: 'UA', name: 'Ukraine', addressFormat: 'INTERNATIONAL' },
  { code: 'ZA', name: 'South Africa', addressFormat: 'INTERNATIONAL' },
  { code: 'EG', name: 'Egypt', addressFormat: 'INTERNATIONAL' },
  { code: 'NG', name: 'Nigeria', addressFormat: 'INTERNATIONAL' },
  { code: 'KE', name: 'Kenya', addressFormat: 'INTERNATIONAL' },
  { code: 'GH', name: 'Ghana', addressFormat: 'INTERNATIONAL' },
  { code: 'BR', name: 'Brazil', addressFormat: 'INTERNATIONAL' },
  { code: 'MX', name: 'Mexico', addressFormat: 'INTERNATIONAL' },
  { code: 'AR', name: 'Argentina', addressFormat: 'INTERNATIONAL' },
  { code: 'CL', name: 'Chile', addressFormat: 'INTERNATIONAL' },
  { code: 'CO', name: 'Colombia', addressFormat: 'INTERNATIONAL' },
  { code: 'PE', name: 'Peru', addressFormat: 'INTERNATIONAL' },
  { code: 'VE', name: 'Venezuela', addressFormat: 'INTERNATIONAL' },
  { code: 'UY', name: 'Uruguay', addressFormat: 'INTERNATIONAL' },
  { code: 'PY', name: 'Paraguay', addressFormat: 'INTERNATIONAL' },
  { code: 'BO', name: 'Bolivia', addressFormat: 'INTERNATIONAL' },
  { code: 'EC', name: 'Ecuador', addressFormat: 'INTERNATIONAL' },
  { code: 'CR', name: 'Costa Rica', addressFormat: 'INTERNATIONAL' },
  { code: 'PA', name: 'Panama', addressFormat: 'INTERNATIONAL' },
  { code: 'GT', name: 'Guatemala', addressFormat: 'INTERNATIONAL' },
  { code: 'HN', name: 'Honduras', addressFormat: 'INTERNATIONAL' },
  { code: 'SV', name: 'El Salvador', addressFormat: 'INTERNATIONAL' },
  { code: 'NI', name: 'Nicaragua', addressFormat: 'INTERNATIONAL' },
  { code: 'BZ', name: 'Belize', addressFormat: 'INTERNATIONAL' },
  { code: 'JM', name: 'Jamaica', addressFormat: 'INTERNATIONAL' },
  { code: 'TT', name: 'Trinidad and Tobago', addressFormat: 'INTERNATIONAL' },
  { code: 'BB', name: 'Barbados', addressFormat: 'INTERNATIONAL' },
  { code: 'BS', name: 'Bahamas', addressFormat: 'INTERNATIONAL' },
  { code: 'KY', name: 'Cayman Islands', addressFormat: 'INTERNATIONAL' },
  { code: 'VG', name: 'British Virgin Islands', addressFormat: 'INTERNATIONAL' },
  { code: 'SC', name: 'Seychelles', addressFormat: 'INTERNATIONAL' },
  { code: 'MU', name: 'Mauritius', addressFormat: 'INTERNATIONAL' },
  { code: 'MV', name: 'Maldives', addressFormat: 'INTERNATIONAL' },
  { code: 'LK', name: 'Sri Lanka', addressFormat: 'INTERNATIONAL' },
  { code: 'BD', name: 'Bangladesh', addressFormat: 'INTERNATIONAL' },
  { code: 'PK', name: 'Pakistan', addressFormat: 'INTERNATIONAL' },
  { code: 'AF', name: 'Afghanistan', addressFormat: 'INTERNATIONAL' },
  { code: 'NP', name: 'Nepal', addressFormat: 'INTERNATIONAL' },
  { code: 'BT', name: 'Bhutan', addressFormat: 'INTERNATIONAL' },
  { code: 'MM', name: 'Myanmar', addressFormat: 'INTERNATIONAL' },
  { code: 'KH', name: 'Cambodia', addressFormat: 'INTERNATIONAL' },
  { code: 'LA', name: 'Laos', addressFormat: 'INTERNATIONAL' },
  { code: 'BN', name: 'Brunei', addressFormat: 'INTERNATIONAL' },
  { code: 'TW', name: 'Taiwan', addressFormat: 'INTERNATIONAL' },
  { code: 'MN', name: 'Mongolia', addressFormat: 'INTERNATIONAL' },
  { code: 'KZ', name: 'Kazakhstan', addressFormat: 'INTERNATIONAL' },
  { code: 'UZ', name: 'Uzbekistan', addressFormat: 'INTERNATIONAL' },
  { code: 'TM', name: 'Turkmenistan', addressFormat: 'INTERNATIONAL' },
  { code: 'KG', name: 'Kyrgyzstan', addressFormat: 'INTERNATIONAL' },
  { code: 'TJ', name: 'Tajikistan', addressFormat: 'INTERNATIONAL' },
];

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};

export const getCountryByName = (name: string): Country | undefined => {
  return countries.find(country => country.name === name);
};

export interface AddressField {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  type: 'text' | 'select';
  options?: string[];
}

export const getAddressFields = (format: 'UK' | 'US' | 'INTERNATIONAL'): AddressField[] => {
  switch (format) {
    case 'UK':
      return [
        { name: 'line1', label: 'Address Line 1', placeholder: '123 High Street', required: true, type: 'text' },
        { name: 'line2', label: 'Address Line 2', placeholder: 'Apt 4B (optional)', required: false, type: 'text' },
        { name: 'city', label: 'Town/City', placeholder: 'London', required: true, type: 'text' },
        { name: 'county', label: 'County', placeholder: 'Greater London', required: false, type: 'text' },
        { name: 'postcode', label: 'Postcode', placeholder: 'SW1A 1AA', required: true, type: 'text' },
      ];

    case 'US':
      return [
        { name: 'line1', label: 'Address Line 1', placeholder: '123 Main Street', required: true, type: 'text' },
        { name: 'line2', label: 'Address Line 2', placeholder: 'Apt 4B (optional)', required: false, type: 'text' },
        { name: 'city', label: 'City', placeholder: 'New York', required: true, type: 'text' },
        { name: 'county', label: 'State/Province', placeholder: 'New York', required: true, type: 'text' },
        { name: 'postcode', label: 'ZIP/Postal Code', placeholder: '10001', required: true, type: 'text' },
      ];

    case 'INTERNATIONAL':
    default:
      return [
        { name: 'line1', label: 'Address Line 1', placeholder: '123 Main Street', required: true, type: 'text' },
        { name: 'line2', label: 'Address Line 2', placeholder: 'Apt 4B (optional)', required: false, type: 'text' },
        { name: 'city', label: 'City', placeholder: 'City', required: true, type: 'text' },
        { name: 'county', label: 'State/Province/Region', placeholder: 'State or Region', required: false, type: 'text' },
        { name: 'postcode', label: 'Postal Code', placeholder: 'Postal Code', required: true, type: 'text' },
      ];
  }
};