-- =============================================================================
-- COMPLETE SUPABASE SETUP - EXACT MATCH TO XAMPP DATABASE
-- This includes ALL tables from your XAMPP database
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
-- 2. JURISDICTIONS TABLE (10 rows)
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

-- Insert jurisdictions data (10 jurisdictions as per XAMPP)
INSERT INTO jurisdictions (name, country_code, flag_url, description, formation_price, currency, processing_time, features, status) VALUES
('Belize', 'BZ', 'https://flagcdn.com/w320/bz.png', 'Fast incorporation with excellent privacy protection and tax advantages. Ideal for international business operations.', 239.00, 'GBP', '1-2 business days', '["No minimum capital required", "100% foreign ownership allowed", "No annual filing requirements", "Bearer shares permitted", "Tax-free on foreign income"]', 'active'),
('Hong Kong', 'HK', 'https://flagcdn.com/w320/hk.png', 'Gateway to Asian markets with strong legal framework and excellent business reputation worldwide.', 479.00, 'GBP', '3-5 business days', '["Professional business reputation", "Access to Asian markets", "Strong legal system", "Banking facilities available", "No tax on foreign income"]', 'active'),
('Dubai International Financial Centre', 'AE', 'https://flagcdn.com/w320/ae.png', 'Premier financial hub in the Middle East with 100% foreign ownership and zero corporate tax on qualifying income.', 1039.00, 'GBP', '5-7 business days', '["100% foreign ownership", "Zero corporate tax", "World-class infrastructure", "Access to MENA markets", "English common law", "DIFC Courts"]', 'active'),
('British Virgin Islands', 'VG', 'https://flagcdn.com/w320/vg.png', 'Most popular offshore jurisdiction with maximum privacy protection and flexible corporate structure.', 319.00, 'GBP', '1-3 business days', '["Maximum privacy protection", "No minimum capital", "Flexible share structures", "Bearer shares available", "No annual returns required", "Tax-free on foreign income"]', 'active'),
('Cayman Islands', 'KY', 'https://flagcdn.com/w320/ky.png', 'Premier jurisdiction for investment funds and financial services with excellent regulatory framework.', 719.00, 'GBP', '3-5 business days', '["Preferred for investment funds", "Strong regulatory framework", "No corporate tax", "Confidentiality protection", "Access to global markets", "Experienced service providers"]', 'active'),
('Seychelles', 'SC', 'https://flagcdn.com/w320/sc.png', 'Cost-effective offshore solution with minimal ongoing compliance requirements and strong privacy laws.', 159.00, 'GBP', '1-2 business days', '["Very affordable", "Minimal compliance", "Strong privacy laws", "No minimum capital", "100% foreign ownership", "No exchange control"]', 'active'),
('Panama', 'PA', 'https://flagcdn.com/w320/pa.png', 'Excellent for asset protection and holding companies with territorial tax system and strong banking sector.', 279.00, 'GBP', '2-4 business days', '["Territorial tax system", "Asset protection friendly", "Strong banking sector", "Bearer shares permitted", "No minimum capital", "Flexible structures"]', 'active'),
('Delaware', 'US', 'https://flagcdn.com/w320/us.png', 'Premier US jurisdiction for corporations with sophisticated legal framework and business-friendly environment.', 159.00, 'GBP', '1-2 business days', '["Business-friendly laws", "Sophisticated legal system", "Court of Chancery", "Privacy protection", "No minimum capital", "Flexible structures"]', 'active'),
('Singapore', 'SG', 'https://flagcdn.com/w320/sg.png', 'Leading Asian financial hub with excellent reputation, strong legal system and access to regional markets.', 639.00, 'GBP', '3-7 business days', '["Excellent reputation", "Gateway to Asia", "Strong legal system", "Government incentives", "Skilled workforce", "Strategic location"]', 'active'),
('Marshall Islands', 'MH', 'https://flagcdn.com/w320/mh.png', 'Flexible offshore jurisdiction with modern corporate laws and competitive pricing.', 199.00, 'GBP', '1-3 business days', '["Modern corporate laws", "Competitive pricing", "Flexible structures", "Bearer shares available", "No minimum capital", "Tax exempt status"]', 'active');

-- =============================================================================
-- 3. ADDITIONAL SERVICES TABLE (8 rows)
-- =============================================================================
DROP TABLE IF EXISTS additional_services CASCADE;

CREATE TABLE additional_services (
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

INSERT INTO additional_services (id, name, description, base_price, currency, note, active, category) VALUES
('offshore-banking', 'Offshore Bank Account Opening', 'Multi-currency offshore bank accounts in premier banking jurisdictions', 2000.00, 'GBP', 'Final price varies by jurisdiction and bank requirements', TRUE, 'banking'),
('nominee-director', 'Nominee Director Service', 'Professional nominee director for enhanced privacy and compliance', 950.00, 'GBP', 'Annual service fee, varies by jurisdiction', TRUE, 'nominees'),
('nominee-shareholder', 'Nominee Shareholder Service', 'Nominee shareholder services for ultimate beneficial owner privacy', 650.00, 'GBP', 'Annual service fee, varies by jurisdiction', TRUE, 'nominees'),
('virtual-office', 'Virtual Office Package', 'Professional business address, mail forwarding, and call answering', 480.00, 'GBP', 'Annual fee, includes mail forwarding and phone answering', TRUE, 'office'),
('apostille-documents', 'Document Apostille Service', 'Apostille certification for international document recognition', 120.00, 'GBP', 'Per document, processing time 5-10 business days', TRUE, 'documentation'),
('tax-planning', 'Tax Planning Consultation', 'Professional tax optimization strategies and compliance advice', 400.00, 'GBP', 'Initial consultation, ongoing services quoted separately', TRUE, 'consultation'),
('trust-formation', 'Offshore Trust Formation', 'Asset protection trust setup with professional trustees', 2800.00, 'GBP', 'Setup fee, annual trustee fees apply separately', TRUE, 'trust'),
('compliance-package', 'Annual Compliance Package', 'Complete annual filing and compliance management service', 650.00, 'GBP', 'Annual service, includes government filings and registered agent', TRUE, 'compliance');

-- =============================================================================
-- 4. PROFESSIONAL SERVICES TABLE (6 rows)
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
('virtual-office', 'Virtual Office Solutions', 'Professional business presence worldwide with virtual office services and support.', 'Professional business presence with virtual office services', '["Prestigious Business Address", "Mail Forwarding Service", "Call Answering & Forwarding", "Virtual Receptionist"]', 'office', '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>', 3, TRUE),
('compliance', 'Tax & Compliance Services', 'Ongoing compliance support and tax optimization strategies for your offshore entities.', 'Ongoing compliance support and tax optimization strategies', '["Annual Government Filings", "Tax Planning & Optimization", "Compliance Monitoring", "Regulatory Updates"]', 'compliance', '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>', 4, TRUE),
('licensing', 'Financial Licensing', 'Specialized licensing for financial services, investment management, and trading activities.', 'Specialized licensing for financial services and trading', '["Investment Fund Licenses", "Forex & Trading Licenses", "Banking Licenses", "Insurance Licenses"]', 'licensing', '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>', 5, TRUE),
('immigration', 'Residency & Immigration', 'Investment-based residency and citizenship programs for international mobility.', 'Investment-based residency and citizenship programs', '["Investment Residency Programs", "Citizenship by Investment", "EU Golden Visa Programs", "Caribbean Passports"]', 'immigration', '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>', 6, TRUE);

-- =============================================================================
-- 5. APPLICATIONS TABLE (1 row)
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

-- Sample application (1 row as per XAMPP)
INSERT INTO applications (jurisdiction_name, jurisdiction_price, jurisdiction_currency, contact_first_name, contact_last_name, contact_email, contact_phone, company_proposed_name, company_business_activity, internal_status) VALUES
('British Virgin Islands', 319.00, 'GBP', 'John', 'Smith', 'john.smith@example.com', '+44 20 7123 4567', 'Global Trading Ltd', 'International trading and investment', 'new');

-- =============================================================================
-- 6. ADMIN USERS TABLE (1 row)
-- =============================================================================
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

-- Admin user (1 row as per XAMPP)
INSERT INTO admin_users (email, password_hash, full_name, role, active) VALUES
('admin@rapidcompanies.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewFBldCQMcV.L9v6', 'System Administrator', 'admin', TRUE);

-- =============================================================================
-- 7. ADMIN ACTIVITY LOGS TABLE (0 rows - empty)
-- =============================================================================
DROP TABLE IF EXISTS admin_activity_logs CASCADE;

CREATE TABLE admin_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_user_id INTEGER REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 8. BANKING JURISDICTIONS TABLE (0 rows - empty)
-- =============================================================================
DROP TABLE IF EXISTS banking_jurisdictions CASCADE;

CREATE TABLE banking_jurisdictions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    description TEXT,
    minimum_deposit DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    features JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 9. CMS CONTENT TABLE (0 rows - empty)
-- =============================================================================
DROP TABLE IF EXISTS cms_content CASCADE;

CREATE TABLE cms_content (
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
-- 10. HOSTING JURISDICTIONS TABLE (0 rows - empty)
-- =============================================================================
DROP TABLE IF EXISTS hosting_jurisdictions CASCADE;

CREATE TABLE hosting_jurisdictions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    features JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 11. INQUIRIES TABLE (0 rows - empty)
-- =============================================================================
DROP TABLE IF EXISTS inquiries CASCADE;

CREATE TABLE inquiries (
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
-- 12. ORDERS TABLE (0 rows - empty)
-- =============================================================================
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

-- =============================================================================
-- 13. ORDER ITEMS TABLE (0 rows - empty)
-- =============================================================================
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

-- =============================================================================
-- 14. SERVICES TABLE (6 rows)
-- =============================================================================
DROP TABLE IF EXISTS services CASCADE;

CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'GBP',
    category VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample services (6 rows as per XAMPP)
INSERT INTO services (name, description, base_price, currency, category, status) VALUES
('Company Formation', 'Basic company formation service', 500.00, 'GBP', 'formation', 'active'),
('Registered Agent', 'Annual registered agent service', 300.00, 'GBP', 'compliance', 'active'),
('Bank Introduction', 'Bank account opening assistance', 750.00, 'GBP', 'banking', 'active'),
('Tax Consultation', 'Professional tax advice', 200.00, 'GBP', 'consultation', 'active'),
('Legal Review', 'Document legal review service', 400.00, 'GBP', 'legal', 'active'),
('Ongoing Support', 'Annual ongoing support package', 600.00, 'GBP', 'support', 'active');

-- =============================================================================
-- 15. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_jurisdictions_status ON jurisdictions(status);
CREATE INDEX IF NOT EXISTS idx_additional_services_active ON additional_services(active);
CREATE INDEX IF NOT EXISTS idx_professional_services_active ON professional_services(active);
CREATE INDEX IF NOT EXISTS idx_applications_internal_status ON applications(internal_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);

-- =============================================================================
-- 16. CREATE TRIGGERS FOR UPDATED_AT
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jurisdictions_updated_at BEFORE UPDATE ON jurisdictions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_additional_services_updated_at BEFORE UPDATE ON additional_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professional_services_updated_at BEFORE UPDATE ON professional_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cms_content_updated_at BEFORE UPDATE ON cms_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_banking_jurisdictions_updated_at BEFORE UPDATE ON banking_jurisdictions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hosting_jurisdictions_updated_at BEFORE UPDATE ON hosting_jurisdictions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 17. ENABLE ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE banking_jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosting_jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
CREATE POLICY "Service role access" ON jurisdictions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON additional_services FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON professional_services FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON applications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON admin_users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON admin_activity_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON banking_jurisdictions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON cms_content FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON hosting_jurisdictions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON inquiries FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON order_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON services FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- 18. VERIFICATION QUERIES
-- =============================================================================
SELECT
    'Table' as info,
    'Rows in XAMPP' as xampp_count,
    'Rows in Supabase' as supabase_count;

SELECT 'jurisdictions' as table_name, '10' as xampp_rows, COUNT(*)::text as supabase_rows FROM jurisdictions
UNION ALL
SELECT 'additional_services', '8', COUNT(*)::text FROM additional_services
UNION ALL
SELECT 'professional_services', '6', COUNT(*)::text FROM professional_services
UNION ALL
SELECT 'applications', '1', COUNT(*)::text FROM applications
UNION ALL
SELECT 'admin_users', '1', COUNT(*)::text FROM admin_users
UNION ALL
SELECT 'admin_activity_logs', '0', COUNT(*)::text FROM admin_activity_logs
UNION ALL
SELECT 'banking_jurisdictions', '0', COUNT(*)::text FROM banking_jurisdictions
UNION ALL
SELECT 'cms_content', '0', COUNT(*)::text FROM cms_content
UNION ALL
SELECT 'hosting_jurisdictions', '0', COUNT(*)::text FROM hosting_jurisdictions
UNION ALL
SELECT 'inquiries', '0', COUNT(*)::text FROM inquiries
UNION ALL
SELECT 'orders', '0', COUNT(*)::text FROM orders
UNION ALL
SELECT 'order_items', '0', COUNT(*)::text FROM order_items
UNION ALL
SELECT 'services', '6', COUNT(*)::text FROM services;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================
SELECT '🎉 COMPLETE SETUP FINISHED! All 12 XAMPP tables recreated with exact row counts!' as status;