-- =============================================================================
-- COMPLETE SUPABASE SETUP FOR OFFSHORE FORMATION SYSTEM (FIXED VERSION)
-- This matches the exact structure and data from your XAMPP database
-- Run this entire script in your Supabase SQL Editor
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. CREATE CUSTOM TYPES
-- =============================================================================
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

-- =============================================================================
-- 2. JURISDICTIONS TABLE (Exact match from XAMPP)
-- =============================================================================
CREATE TABLE IF NOT EXISTS jurisdictions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    flag_url TEXT,
    description TEXT,
    formation_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'GBP',
    processing_time VARCHAR(100),
    features JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 3. ADDITIONAL SERVICES TABLE (Exact match from XAMPP)
-- =============================================================================
CREATE TABLE IF NOT EXISTS additional_services (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'GBP',
    note TEXT,
    active BOOLEAN DEFAULT TRUE,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 4. PROFESSIONAL SERVICES TABLE (Exact match from XAMPP)
-- =============================================================================
CREATE TABLE IF NOT EXISTS professional_services (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description TEXT,
    features JSONB,
    category VARCHAR(100),
    icon_svg TEXT,
    display_order INTEGER,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 5. APPLICATIONS TABLE (Exact match from XAMPP)
-- =============================================================================
CREATE TABLE IF NOT EXISTS applications (
    id BIGSERIAL PRIMARY KEY,
    jurisdiction_name VARCHAR(255) NOT NULL,
    jurisdiction_price DECIMAL(10,2) NOT NULL,
    jurisdiction_currency VARCHAR(10) DEFAULT 'GBP',
    contact_first_name VARCHAR(255),
    contact_last_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    company_proposed_name VARCHAR(255),
    company_business_activity TEXT,
    internal_status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 6. ORDERS TABLE (Exact match from XAMPP)
-- =============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'GBP',
    payment_status payment_status_enum DEFAULT 'pending',
    payment_method VARCHAR(100),
    applications_count INTEGER DEFAULT 0,
    services_count INTEGER DEFAULT 0,
    order_items JSONB,
    stripe_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 7. ORDER ITEMS TABLE (Exact match from XAMPP)
-- =============================================================================
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    item_type item_type_enum NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    jurisdiction_name VARCHAR(255),
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'GBP',
    item_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_order_items_order_id
        FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- =============================================================================
-- 8. ADMIN USERS TABLE (Exact match from XAMPP)
-- =============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'viewer',
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 9. CONTACT FORMS / INQUIRIES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS contact_forms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company_name VARCHAR(255),
    country VARCHAR(100),
    service_type VARCHAR(100),
    message TEXT,
    status VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 10. CMS CONTENT TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS cms_content (
    id BIGSERIAL PRIMARY KEY,
    page VARCHAR(50) NOT NULL,
    section VARCHAR(50) NOT NULL,
    key_name VARCHAR(50) NOT NULL,
    content TEXT,
    content_type VARCHAR(20) DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page, section, key_name)
);

-- =============================================================================
-- 11. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================
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
CREATE INDEX IF NOT EXISTS idx_additional_services_active ON additional_services(active);
CREATE INDEX IF NOT EXISTS idx_professional_services_active ON professional_services(active);
CREATE INDEX IF NOT EXISTS idx_contact_forms_status ON contact_forms(status);
CREATE INDEX IF NOT EXISTS idx_contact_forms_created_at ON contact_forms(created_at);

-- =============================================================================
-- 12. CREATE FUNCTION FOR AUTOMATIC TIMESTAMP UPDATES
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================================================
-- 13. CREATE TRIGGERS FOR UPDATED_AT
-- =============================================================================
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

CREATE TRIGGER update_contact_forms_updated_at BEFORE UPDATE ON contact_forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_content_updated_at BEFORE UPDATE ON cms_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 14. ENABLE ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 15. CREATE RLS POLICIES (Allow service role access)
-- =============================================================================
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

CREATE POLICY "Service role can access all contact_forms" ON contact_forms
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all cms_content" ON cms_content
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- 16. INSERT EXACT JURISDICTIONS DATA FROM XAMPP
-- =============================================================================
INSERT INTO jurisdictions (name, country_code, flag_url, description, formation_price, currency, processing_time, features, status) VALUES
('Belize', 'BZ', 'https://flagcdn.com/w320/bz.png', 'Fast incorporation with excellent privacy protection and tax advantages. Ideal for international business operations.', 239.00, 'GBP', '1-2 business days', '["No minimum capital required", "100% foreign ownership allowed", "No annual filing requirements", "Bearer shares permitted", "Tax-free on foreign income"]', 'active'),

('Hong Kong', 'HK', 'https://flagcdn.com/w320/hk.png', 'Gateway to Asian markets with strong legal framework and excellent business reputation worldwide.', 479.00, 'GBP', '3-5 business days', '["Professional business reputation", "Access to Asian markets", "Strong legal system", "Banking facilities available", "No tax on foreign income"]', 'active'),

('Dubai International Financial Centre', 'AE', 'https://flagcdn.com/w320/ae.png', 'Premier financial hub in the Middle East with 100% foreign ownership and zero corporate tax on qualifying income.', 1039.00, 'GBP', '5-7 business days', '["100% foreign ownership", "Zero corporate tax", "World-class infrastructure", "Access to MENA markets", "English common law", "DIFC Courts"]', 'active'),

('British Virgin Islands', 'VG', 'https://flagcdn.com/w320/vg.png', 'Most popular offshore jurisdiction with maximum privacy protection and flexible corporate structure.', 319.00, 'GBP', '1-3 business days', '["Maximum privacy protection", "No minimum capital", "Flexible share structures", "Bearer shares available", "No annual returns required", "Tax-free on foreign income"]', 'active'),

('Cayman Islands', 'KY', 'https://flagcdn.com/w320/ky.png', 'Premier jurisdiction for investment funds and financial services with excellent regulatory framework.', 719.00, 'GBP', '3-5 business days', '["Preferred for investment funds", "Strong regulatory framework", "No corporate tax", "Confidentiality protection", "Access to global markets", "Experienced service providers"]', 'active'),

('Seychelles', 'SC', 'https://flagcdn.com/w320/sc.png', 'Cost-effective offshore solution with minimal ongoing compliance requirements and strong privacy laws.', 159.00, 'GBP', '1-2 business days', '["Very affordable", "Minimal compliance", "Strong privacy laws", "No minimum capital", "100% foreign ownership", "No exchange control"]', 'active'),

('Panama', 'PA', 'https://flagcdn.com/w320/pa.png', 'Excellent for asset protection and holding companies with territorial tax system and strong banking sector.', 279.00, 'GBP', '2-4 business days', '["Territorial tax system", "Asset protection friendly", "Strong banking sector", "Bearer shares permitted", "No minimum capital", "Flexible structures"]', 'active'),

('Delaware', 'US', 'https://flagcdn.com/w320/us.png', 'Premier US jurisdiction for corporations with sophisticated legal framework and business-friendly environment.', 159.00, 'GBP', '1-2 business days', '["Business-friendly laws", "Sophisticated legal system", "Court of Chancery", "Privacy protection", "No minimum capital", "Flexible structures"]', 'active'),

('Singapore', 'SG', 'https://flagcdn.com/w320/sg.png', 'Leading Asian financial hub with excellent reputation, strong legal system and access to regional markets.', 639.00, 'GBP', '3-7 business days', '["Excellent reputation", "Gateway to Asia", "Strong legal system", "Government incentives", "Skilled workforce", "Strategic location"]', 'active');

-- =============================================================================
-- 17. INSERT EXACT ADDITIONAL SERVICES DATA FROM XAMPP
-- =============================================================================
INSERT INTO additional_services (
    id,
    name,
    description,
    base_price,
    currency,
    note,
    active,
    category
) VALUES
(
    'offshore-banking',
    'Offshore Bank Account Opening',
    'Multi-currency offshore bank accounts in premier banking jurisdictions',
    2000.00,
    'GBP',
    'Final price varies by jurisdiction and bank requirements',
    TRUE,
    'banking'
),
(
    'nominee-director',
    'Nominee Director Service',
    'Professional nominee director for enhanced privacy and compliance',
    950.00,
    'GBP',
    'Annual service fee, varies by jurisdiction',
    TRUE,
    'nominees'
),
(
    'nominee-shareholder',
    'Nominee Shareholder Service',
    'Nominee shareholder services for ultimate beneficial owner privacy',
    650.00,
    'GBP',
    'Annual service fee, varies by jurisdiction',
    TRUE,
    'nominees'
),
(
    'virtual-office',
    'Virtual Office Package',
    'Professional business address, mail forwarding, and call answering',
    480.00,
    'GBP',
    'Annual fee, includes mail forwarding and phone answering',
    TRUE,
    'office'
),
(
    'apostille-documents',
    'Document Apostille Service',
    'Apostille certification for international document recognition',
    120.00,
    'GBP',
    'Per document, processing time 5-10 business days',
    TRUE,
    'documentation'
),
(
    'tax-planning',
    'Tax Planning Consultation',
    'Professional tax optimization strategies and compliance advice',
    400.00,
    'GBP',
    'Initial consultation, ongoing services quoted separately',
    TRUE,
    'consultation'
),
(
    'trust-formation',
    'Offshore Trust Formation',
    'Asset protection trust setup with professional trustees',
    2800.00,
    'GBP',
    'Setup fee, annual trustee fees apply separately',
    TRUE,
    'trust'
),
(
    'compliance-package',
    'Annual Compliance Package',
    'Complete annual filing and compliance management service',
    650.00,
    'GBP',
    'Annual service, includes government filings and registered agent',
    TRUE,
    'compliance'
);

-- =============================================================================
-- 18. INSERT EXACT PROFESSIONAL SERVICES DATA FROM XAMPP
-- =============================================================================
INSERT INTO professional_services (
    id,
    name,
    description,
    short_description,
    features,
    category,
    icon_svg,
    display_order,
    active
) VALUES
(
    'trusts',
    'Offshore Trust Formation',
    'Asset protection trusts and discretionary trusts for wealth preservation and estate planning.',
    'Asset protection trusts for wealth preservation and estate planning',
    '["Discretionary & Fixed Trusts", "Asset Protection Structures", "Charitable Foundations", "Trust Administration"]',
    'trusts',
    '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>',
    1,
    TRUE
),
(
    'nominees',
    'Nominee Director Services',
    'Professional nominee directors and shareholders for enhanced privacy and compliance.',
    'Professional nominee directors and shareholders for privacy',
    '["Corporate Nominee Directors", "Nominee Shareholders", "Privacy Protection", "Regulatory Compliance"]',
    'nominees',
    '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>',
    2,
    TRUE
),
(
    'virtual-office',
    'Virtual Office Solutions',
    'Professional business presence worldwide with virtual office services and support.',
    'Professional business presence with virtual office services',
    '["Prestigious Business Address", "Mail Forwarding Service", "Call Answering & Forwarding", "Virtual Receptionist"]',
    'office',
    '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>',
    3,
    TRUE
),
(
    'compliance',
    'Tax & Compliance Services',
    'Ongoing compliance support and tax optimization strategies for your offshore entities.',
    'Ongoing compliance support and tax optimization strategies',
    '["Annual Government Filings", "Tax Planning & Optimization", "Compliance Monitoring", "Regulatory Updates"]',
    'compliance',
    '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>',
    4,
    TRUE
),
(
    'licensing',
    'Financial Licensing',
    'Specialized licensing for financial services, investment management, and trading activities.',
    'Specialized licensing for financial services and trading',
    '["Investment Fund Licenses", "Forex & Trading Licenses", "Banking Licenses", "Insurance Licenses"]',
    'licensing',
    '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>',
    5,
    TRUE
),
(
    'immigration',
    'Residency & Immigration',
    'Investment-based residency and citizenship programs for international mobility.',
    'Investment-based residency and citizenship programs',
    '["Investment Residency Programs", "Citizenship by Investment", "EU Golden Visa Programs", "Caribbean Passports"]',
    'immigration',
    '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
    6,
    TRUE
);

-- =============================================================================
-- 19. INSERT SAMPLE ADMIN USER
-- =============================================================================
-- Default admin user: admin@rapidcompanies.com / password: admin123
-- Password hash for 'admin123' using bcrypt
INSERT INTO admin_users (email, password_hash, full_name, role, active) VALUES
('admin@rapidcompanies.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewFBldCQMcV.L9v6', 'System Administrator', 'admin', TRUE);

-- =============================================================================
-- 20. INSERT SAMPLE CMS CONTENT
-- =============================================================================
INSERT INTO cms_content (page, section, key_name, content, content_type) VALUES
('homepage', 'hero', 'title', 'Professional Offshore Company Formation', 'text'),
('homepage', 'hero', 'subtitle', 'Establish your business in the world''s leading offshore jurisdictions with expert guidance and complete privacy protection.', 'text'),
('homepage', 'features', 'privacy_title', 'Enhanced Privacy', 'text'),
('homepage', 'features', 'privacy_description', 'Protect your personal and business information with our confidential company structures.', 'text'),
('homepage', 'features', 'tax_title', 'Tax Efficiency', 'text'),
('homepage', 'features', 'tax_description', 'Optimize your tax position with strategic offshore company structures in tax-friendly jurisdictions.', 'text'),
('contact', 'info', 'email', 'info@rapidcompanies.com', 'text'),
('contact', 'info', 'phone', '01904 925 200', 'text'),
('contact', 'info', 'address', 'Rapid Corporate Services Limited, Office 12, Amy Johnson Way, Clifton Moor, York YO30 4AG', 'text');

-- =============================================================================
-- 21. INSERT SAMPLE DATA FOR TESTING
-- =============================================================================

-- Sample Applications
INSERT INTO applications (jurisdiction_name, jurisdiction_price, jurisdiction_currency, contact_first_name, contact_last_name, contact_email, contact_phone, company_proposed_name, company_business_activity, internal_status) VALUES
('British Virgin Islands', 319.00, 'GBP', 'John', 'Smith', 'john.smith@example.com', '+44 20 7123 4567', 'Global Trading Ltd', 'International trading and investment', 'new'),
('Cayman Islands', 719.00, 'GBP', 'Sarah', 'Johnson', 'sarah.johnson@example.com', '+1 212 555 0123', 'Investment Holdings Inc', 'Investment fund management', 'in_progress'),
('Seychelles', 159.00, 'GBP', 'Michael', 'Brown', 'michael.brown@example.com', '+61 2 9876 5432', 'Pacific Ventures Ltd', 'Consulting and advisory services', 'completed');

-- Sample Orders
INSERT INTO orders (order_id, customer_email, customer_name, total_amount, currency, payment_status, applications_count, services_count) VALUES
('ORD-2024-001', 'john.smith@example.com', 'John Smith', 439.00, 'GBP', 'paid', 1, 1),
('ORD-2024-002', 'sarah.johnson@example.com', 'Sarah Johnson', 1669.00, 'GBP', 'paid', 1, 1),
('ORD-2024-003', 'michael.brown@example.com', 'Michael Brown', 639.00, 'GBP', 'pending', 1, 1);

-- Sample Order Items
INSERT INTO order_items (order_id, item_type, item_name, jurisdiction_name, unit_price, quantity, total_price, currency) VALUES
('ORD-2024-001', 'application', 'British Virgin Islands Company Formation', 'British Virgin Islands', 319.00, 1, 319.00, 'GBP'),
('ORD-2024-001', 'service', 'Document Apostille Service', NULL, 120.00, 1, 120.00, 'GBP'),
('ORD-2024-002', 'application', 'Cayman Islands Company Formation', 'Cayman Islands', 719.00, 1, 719.00, 'GBP'),
('ORD-2024-002', 'service', 'Nominee Director Service', NULL, 950.00, 1, 950.00, 'GBP'),
('ORD-2024-003', 'application', 'Seychelles Company Formation', 'Seychelles', 159.00, 1, 159.00, 'GBP'),
('ORD-2024-003', 'service', 'Virtual Office Package', NULL, 480.00, 1, 480.00, 'GBP');

-- Sample Contact Forms
INSERT INTO contact_forms (name, email, phone, company_name, country, service_type, message, status) VALUES
('David Wilson', 'david.wilson@example.com', '+44 161 123 4567', 'Tech Innovations Ltd', 'British Virgin Islands', 'Company Formation', 'Looking to establish a holding company for our UK operations.', 'new'),
('Emma Davis', 'emma.davis@example.com', '+1 305 555 0199', 'Miami Investments', 'Cayman Islands', 'Banking Services', 'Need assistance with opening a corporate bank account.', 'contacted'),
('Robert Chen', 'robert.chen@example.com', '+65 6123 4567', 'Asia Pacific Holdings', 'Singapore', 'Professional Formation', 'Interested in Singapore incorporation for regional expansion.', 'qualified');

-- =============================================================================
-- 22. CREATE HELPER FUNCTIONS
-- =============================================================================

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_applications', (SELECT COUNT(*) FROM applications),
        'monthly_applications', (SELECT COUNT(*) FROM applications WHERE created_at >= date_trunc('month', NOW())),
        'total_orders', (SELECT COUNT(*) FROM orders),
        'paid_orders', (SELECT COUNT(*) FROM orders WHERE payment_status = 'paid'),
        'total_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid'),
        'monthly_orders', (SELECT COUNT(*) FROM orders WHERE created_at >= date_trunc('month', NOW())),
        'monthly_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid' AND created_at >= date_trunc('month', NOW())),
        'total_jurisdictions', (SELECT COUNT(*) FROM jurisdictions WHERE status = 'active')
    ) INTO stats;

    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order IDs
CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_sequence')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================
--
-- 🎉 Your Supabase database is now set up with EXACT data from XAMPP!
--
-- ✅ Tables created with exact structure and data types
-- ✅ All jurisdictions (9 total) - Belize, Hong Kong, DIFC, BVI, Cayman, etc.
-- ✅ All additional services (8 total) - Banking, Nominees, Virtual Office, etc.
-- ✅ All professional services (6 total) - Trusts, Compliance, Licensing, etc.
-- ✅ Sample applications, orders, and contact forms
-- ✅ Admin user: admin@rapidcompanies.com / admin123
-- ✅ Performance indexes and triggers
-- ✅ Row Level Security with service role access
-- ✅ Helper functions for dashboard and order generation
--
-- Next Steps:
-- 1. Update your .env.local with Supabase credentials:
--    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
--    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
--    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
--
-- 2. Test the connection with your Next.js app
-- 3. Change the default admin password in production
-- 4. Customize RLS policies as needed
--
-- Your offshore formation system is ready! 🚀
-- =============================================================================