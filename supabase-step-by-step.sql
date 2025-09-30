-- =============================================================================
-- SUPABASE SETUP - STEP BY STEP (DEBUGGING VERSION)
-- Run each section separately to identify where the issue occurs
-- =============================================================================

-- =============================================================================
-- STEP 1: CREATE TYPES ONLY
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
-- STEP 2: CREATE JURISDICTIONS TABLE AND DATA
-- =============================================================================
DROP TABLE IF EXISTS jurisdictions CASCADE;

CREATE TABLE jurisdictions (
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

-- Insert jurisdictions data
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
-- STEP 3: CREATE ADDITIONAL SERVICES TABLE (SIMPLE VERSION)
-- =============================================================================
DROP TABLE IF EXISTS additional_services CASCADE;

CREATE TABLE additional_services (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'GBP',
    note TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test INSERT without 'active' column first
INSERT INTO additional_services (id, name, description, base_price, currency, note, category) VALUES
('offshore-banking', 'Offshore Bank Account Opening', 'Multi-currency offshore bank accounts in premier banking jurisdictions', 2000.00, 'GBP', 'Final price varies by jurisdiction and bank requirements', 'banking'),
('nominee-director', 'Nominee Director Service', 'Professional nominee director for enhanced privacy and compliance', 950.00, 'GBP', 'Annual service fee, varies by jurisdiction', 'nominees'),
('virtual-office', 'Virtual Office Package', 'Professional business address, mail forwarding, and call answering', 480.00, 'GBP', 'Annual fee, includes mail forwarding and phone answering', 'office');

-- =============================================================================
-- STEP 4: ADD ACTIVE COLUMN AFTER TABLE EXISTS
-- =============================================================================
ALTER TABLE additional_services ADD COLUMN active BOOLEAN DEFAULT TRUE;

-- Update existing records
UPDATE additional_services SET active = TRUE;

-- Insert remaining services
INSERT INTO additional_services (id, name, description, base_price, currency, note, active, category) VALUES
('nominee-shareholder', 'Nominee Shareholder Service', 'Nominee shareholder services for ultimate beneficial owner privacy', 650.00, 'GBP', 'Annual service fee, varies by jurisdiction', TRUE, 'nominees'),
('apostille-documents', 'Document Apostille Service', 'Apostille certification for international document recognition', 120.00, 'GBP', 'Per document, processing time 5-10 business days', TRUE, 'documentation'),
('tax-planning', 'Tax Planning Consultation', 'Professional tax optimization strategies and compliance advice', 400.00, 'GBP', 'Initial consultation, ongoing services quoted separately', TRUE, 'consultation'),
('trust-formation', 'Offshore Trust Formation', 'Asset protection trust setup with professional trustees', 2800.00, 'GBP', 'Setup fee, annual trustee fees apply separately', TRUE, 'trust'),
('compliance-package', 'Annual Compliance Package', 'Complete annual filing and compliance management service', 650.00, 'GBP', 'Annual service, includes government filings and registered agent', TRUE, 'compliance');

-- =============================================================================
-- STEP 5: CREATE PROFESSIONAL SERVICES TABLE
-- =============================================================================
DROP TABLE IF EXISTS professional_services CASCADE;

CREATE TABLE professional_services (
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

INSERT INTO professional_services (id, name, description, short_description, features, category, icon_svg, display_order, active) VALUES
('trusts', 'Offshore Trust Formation', 'Asset protection trusts and discretionary trusts for wealth preservation and estate planning.', 'Asset protection trusts for wealth preservation and estate planning', '["Discretionary & Fixed Trusts", "Asset Protection Structures", "Charitable Foundations", "Trust Administration"]', 'trusts', '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>', 1, TRUE),
('nominees', 'Nominee Director Services', 'Professional nominee directors and shareholders for enhanced privacy and compliance.', 'Professional nominee directors and shareholders for privacy', '["Corporate Nominee Directors", "Nominee Shareholders", "Privacy Protection", "Regulatory Compliance"]', 'nominees', '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>', 2, TRUE),
('virtual-office', 'Virtual Office Solutions', 'Professional business presence worldwide with virtual office services and support.', 'Professional business presence with virtual office services', '["Prestigious Business Address", "Mail Forwarding Service", "Call Answering & Forwarding", "Virtual Receptionist"]', 'office', '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>', 3, TRUE);

-- =============================================================================
-- STEP 6: CREATE OTHER TABLES
-- =============================================================================
DROP TABLE IF EXISTS applications CASCADE;

CREATE TABLE applications (
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

DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
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

DROP TABLE IF EXISTS order_items CASCADE;

CREATE TABLE order_items (
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

DROP TABLE IF EXISTS admin_users CASCADE;

CREATE TABLE admin_users (
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

DROP TABLE IF EXISTS contact_forms CASCADE;

CREATE TABLE contact_forms (
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
-- STEP 7: INSERT SAMPLE DATA
-- =============================================================================

-- Sample admin user
INSERT INTO admin_users (email, password_hash, full_name, role, active) VALUES
('admin@rapidcompanies.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewFBldCQMcV.L9v6', 'System Administrator', 'admin', TRUE);

-- Sample applications
INSERT INTO applications (jurisdiction_name, jurisdiction_price, jurisdiction_currency, contact_first_name, contact_last_name, contact_email, contact_phone, company_proposed_name, company_business_activity, internal_status) VALUES
('British Virgin Islands', 319.00, 'GBP', 'John', 'Smith', 'john.smith@example.com', '+44 20 7123 4567', 'Global Trading Ltd', 'International trading and investment', 'new'),
('Cayman Islands', 719.00, 'GBP', 'Sarah', 'Johnson', 'sarah.johnson@example.com', '+1 212 555 0123', 'Investment Holdings Inc', 'Investment fund management', 'in_progress');

-- Sample orders
INSERT INTO orders (order_id, customer_email, customer_name, total_amount, currency, payment_status, applications_count, services_count) VALUES
('ORD-2024-001', 'john.smith@example.com', 'John Smith', 439.00, 'GBP', 'paid', 1, 1),
('ORD-2024-002', 'sarah.johnson@example.com', 'Sarah Johnson', 1669.00, 'GBP', 'paid', 1, 1);

-- =============================================================================
-- STEP 8: ENABLE RLS (OPTIONAL)
-- =============================================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;

-- Allow service role access
CREATE POLICY "Service role can access all orders" ON orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all order_items" ON order_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all applications" ON applications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all jurisdictions" ON jurisdictions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all additional_services" ON additional_services FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all professional_services" ON professional_services FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all admin_users" ON admin_users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all contact_forms" ON contact_forms FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these to verify everything worked:

SELECT 'Jurisdictions count:' as info, COUNT(*) as count FROM jurisdictions;
SELECT 'Additional services count:' as info, COUNT(*) as count FROM additional_services;
SELECT 'Professional services count:' as info, COUNT(*) as count FROM professional_services;
SELECT 'Applications count:' as info, COUNT(*) as count FROM applications;
SELECT 'Orders count:' as info, COUNT(*) as count FROM orders;
SELECT 'Admin users count:' as info, COUNT(*) as count FROM admin_users;

-- Check table structure
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'additional_services'
ORDER BY ordinal_position;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================
SELECT '🎉 Setup completed successfully! All tables created and populated.' as status;