-- Supabase (PostgreSQL) Schema for Offshore Formation System
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security (RLS) by default
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM public;

-- Create custom types
DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_type_enum AS ENUM ('application', 'service');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Orders table to track completed payments and order history
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(100) UNIQUE NOT NULL,
    stripe_payment_intent_id VARCHAR(100) UNIQUE,

    -- Customer information
    customer_email VARCHAR(100),
    customer_name VARCHAR(100),
    customer_phone VARCHAR(50),

    -- Order totals
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',

    -- Payment status
    payment_status payment_status_enum DEFAULT 'pending',
    payment_method VARCHAR(50),

    -- Order details
    applications_count INTEGER DEFAULT 0,
    services_count INTEGER DEFAULT 0,
    order_items JSONB, -- Store detailed breakdown of applications and services

    -- Metadata from Stripe
    stripe_metadata JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table for detailed breakdown
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(100) NOT NULL,

    -- Item details
    item_type item_type_enum NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    jurisdiction_name VARCHAR(100), -- For applications

    -- Pricing
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',

    -- Additional data
    item_metadata JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign key constraint
    CONSTRAINT fk_order_items_order_id
        FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Jurisdictions table (existing structure)
CREATE TABLE IF NOT EXISTS jurisdictions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    flag_url VARCHAR(200),
    description TEXT,
    formation_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    processing_time VARCHAR(50),
    features TEXT[], -- PostgreSQL array type
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table (existing structure)
CREATE TABLE IF NOT EXISTS applications (
    id BIGSERIAL PRIMARY KEY,
    jurisdiction_name VARCHAR(100) NOT NULL,
    jurisdiction_price DECIMAL(10, 2) NOT NULL,
    jurisdiction_currency VARCHAR(3) DEFAULT 'GBP',

    -- Contact details
    contact_first_name VARCHAR(50),
    contact_last_name VARCHAR(50),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(30),

    -- Company details
    company_proposed_name VARCHAR(100),
    company_business_activity TEXT,

    -- Admin fields
    internal_status VARCHAR(20) DEFAULT 'new',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional Services table
CREATE TABLE IF NOT EXISTS additional_services (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    category VARCHAR(50),
    note TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professional Services table
CREATE TABLE IF NOT EXISTS professional_services (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    category VARCHAR(50),
    note TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table for authentication
CREATE TABLE IF NOT EXISTS admin_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'viewer',
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_type ON order_items(item_type);

CREATE INDEX IF NOT EXISTS idx_applications_jurisdiction_name ON applications(jurisdiction_name);
CREATE INDEX IF NOT EXISTS idx_applications_internal_status ON applications(internal_status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

CREATE INDEX IF NOT EXISTS idx_jurisdictions_status ON jurisdictions(status);
CREATE INDEX IF NOT EXISTS idx_additional_services_status ON additional_services(status);
CREATE INDEX IF NOT EXISTS idx_professional_services_status ON professional_services(status);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jurisdictions_updated_at BEFORE UPDATE ON jurisdictions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_additional_services_updated_at BEFORE UPDATE ON additional_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professional_services_updated_at BEFORE UPDATE ON professional_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- For now, allow service role to access everything (admin access)
-- You can create more granular policies later
CREATE POLICY "Service role can access all orders" ON orders
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all order_items" ON order_items
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all applications" ON applications
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all jurisdictions" ON jurisdictions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all additional_services" ON additional_services
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all professional_services" ON professional_services
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all admin_users" ON admin_users
    FOR ALL USING (auth.role() = 'service_role');

-- Insert some sample data for testing (optional - remove in production)
/*
INSERT INTO jurisdictions (name, country_code, description, formation_price, currency, processing_time, features, status)
VALUES
    ('British Virgin Islands', 'VG', 'Premier offshore jurisdiction with flexible corporate laws', 1500.00, 'GBP', '3-5 days', ARRAY['No minimum share capital', 'One director minimum', 'Bearer shares allowed', 'Tax neutral'], 'active'),
    ('Cayman Islands', 'KY', 'Sophisticated financial center with excellent reputation', 2000.00, 'GBP', '5-7 days', ARRAY['No corporate tax', 'Flexible capital structure', 'Strong legal system', 'Privacy protection'], 'active'),
    ('Seychelles', 'SC', 'Cost-effective solution with strong privacy laws', 800.00, 'GBP', '2-3 days', ARRAY['Low formation cost', 'Confidentiality', 'No filing requirements', 'Bearer shares available'], 'active');

INSERT INTO additional_services (name, description, base_price, currency, category, note, status)
VALUES
    ('Registered Office Service', 'Professional registered office address for your company', 300.00, 'GBP', 'compliance', 'Annual fee', 'active'),
    ('Nominee Director Service', 'Professional nominee director to enhance privacy', 800.00, 'GBP', 'privacy', 'Annual fee', 'active'),
    ('Banking Introduction', 'Introduction to reputable offshore banks', 500.00, 'GBP', 'banking', 'One-time fee', 'active');

INSERT INTO admin_users (email, password_hash, full_name, role, active)
VALUES
    ('admin@rapidcompanies.com', '$2b$12$example_hash_here', 'System Administrator', 'super_admin', true);
*/

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';