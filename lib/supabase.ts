import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create clients if all required keys are available
let supabaseAdmin: any = null;
let supabase: any = null;

if (supabaseUrl && supabaseServiceKey) {
  // Client for server-side operations (admin access)
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

if (supabaseUrl && supabaseAnonKey) {
  // Client for client-side operations
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabaseAdmin, supabase };

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: number;
          order_id: string;
          stripe_payment_intent_id: string | null;
          customer_email: string | null;
          customer_name: string | null;
          customer_phone: string | null;
          total_amount: number;
          currency: string;
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method: string | null;
          applications_count: number;
          services_count: number;
          order_items: any | null;
          stripe_metadata: any | null;
          created_at: string;
          paid_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          order_id: string;
          stripe_payment_intent_id?: string | null;
          customer_email?: string | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          total_amount: number;
          currency?: string;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method?: string | null;
          applications_count?: number;
          services_count?: number;
          order_items?: any | null;
          stripe_metadata?: any | null;
          created_at?: string;
          paid_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          order_id?: string;
          stripe_payment_intent_id?: string | null;
          customer_email?: string | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          total_amount?: number;
          currency?: string;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method?: string | null;
          applications_count?: number;
          services_count?: number;
          order_items?: any | null;
          stripe_metadata?: any | null;
          created_at?: string;
          paid_at?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: number;
          order_id: string;
          item_type: 'application' | 'service';
          item_name: string;
          jurisdiction_name: string | null;
          unit_price: number;
          quantity: number;
          total_price: number;
          currency: string;
          item_metadata: any | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          order_id: string;
          item_type: 'application' | 'service';
          item_name: string;
          jurisdiction_name?: string | null;
          unit_price: number;
          quantity?: number;
          total_price: number;
          currency?: string;
          item_metadata?: any | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          order_id?: string;
          item_type?: 'application' | 'service';
          item_name?: string;
          jurisdiction_name?: string | null;
          unit_price?: number;
          quantity?: number;
          total_price?: number;
          currency?: string;
          item_metadata?: any | null;
          created_at?: string;
        };
      };
      jurisdictions: {
        Row: {
          id: number;
          name: string;
          country_code: string;
          flag_url: string | null;
          description: string | null;
          formation_price: number;
          currency: string;
          processing_time: string | null;
          features: string[] | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
      };
      applications: {
        Row: {
          id: number;
          jurisdiction_name: string;
          jurisdiction_price: number;
          jurisdiction_currency: string;
          contact_first_name: string | null;
          contact_last_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          company_proposed_name: string | null;
          company_business_activity: string | null;
          internal_status: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}

export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];
export type OrderItemRow = Database['public']['Tables']['order_items']['Row'];
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

// Form submission interface
export interface FormSubmission {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  country: string;
  serviceType: string;
  message?: string;
}

// Contact form submission function
export async function submitFormData(data: FormSubmission): Promise<void> {
  // For now, this can just log the data or send it to an API
  // You can implement actual form submission logic later
  console.log('Contact form submission:', data);

  // If you want to store contact forms in Supabase, you would:
  // const { error } = await supabaseAdmin
  //   .from('contact_forms')
  //   .insert(data);
  // if (error) throw error;
}