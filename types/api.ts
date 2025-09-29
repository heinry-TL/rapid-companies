// Database row types
export interface DatabaseRowPacket {
  [key: string]: any;
}

// Application types
export interface Director {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  nationality?: string;
  date_of_birth?: string;
}

export interface Shareholder {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  nationality?: string;
  shares_percentage: number;
  shares_count: number;
}

export interface AdditionalService {
  id: string;
  name: string;
  price: number;
  currency: string;
  selected?: boolean;
}

export interface ApplicationData {
  id: string;
  jurisdiction_id: string;
  jurisdiction_name: string;
  jurisdiction_price: number;
  jurisdiction_currency: string;
  contact_first_name: string;
  contact_last_name: string;
  email: string;
  phone: string;
  contact_address_line1?: string;
  contact_address_line2?: string;
  contact_city?: string;
  contact_county?: string;
  contact_postcode?: string;
  contact_country?: string;
  company_name: string;
  company_alternative_name?: string;
  company_business_activity?: string;
  company_authorized_capital?: number;
  company_number_of_shares?: number;
  registered_address_line1?: string;
  registered_address_line2?: string;
  registered_city?: string;
  registered_county?: string;
  registered_postcode?: string;
  registered_country?: string;
  use_contact_address?: boolean;
  step_completed: number;
  is_complete: boolean;
  directors: Director[];
  shareholders: Shareholder[];
  additional_services: AdditionalService[];
  created_at: string;
  updated_at: string;
  // Derived fields
  full_name?: string;
  company_type?: string;
  status?: string;
  payment_status?: string;
  internal_status?: string;
  admin_notes?: string;
}

// Jurisdiction types
export interface JurisdictionData {
  id: string;
  name: string;
  country_code: string;
  flag_url?: string;
  description?: string;
  formation_price: number;
  currency: string;
  processing_time?: string;
  features: string[];
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Service types
export interface ServiceData {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Professional Service types
export interface ProfessionalServiceData {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Banking Jurisdiction types
export interface BankingJurisdictionData {
  id: string;
  name: string;
  country_code: string;
  flag_url?: string;
  description?: string;
  minimum_deposit: number;
  currency: string;
  processing_time?: string;
  features: string[];
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Order types
export interface OrderData {
  id: string;
  application_id?: string;
  user_email?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_intent_id?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

// Admin User types
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'viewer';
  active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  details?: string;
  data?: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  limit: number;
  offset: number;
}

// Request body types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ApplicationUpdateRequest {
  internal_status?: string;
  admin_notes?: string;
  assigned_to?: string;
  payment_status?: string;
}

export interface JurisdictionUpdateRequest {
  name?: string;
  country_code?: string;
  flag_url?: string;
  description?: string;
  formation_price?: number;
  currency?: string;
  processing_time?: string;
  features?: string[];
  status?: 'active' | 'inactive';
}

export interface ServiceUpdateRequest {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: string;
  status?: 'active' | 'inactive';
}

// Stripe types
export interface PaymentIntentRequest {
  amount: number;
  currency: string;
  application_id?: string;
  metadata?: Record<string, string>;
}

export interface StripeWebhookEvent {
  id: string;
  object: string;
  type: string;
  data: {
    object: any;
  };
}