-- Supabase Database Setup for Offshore Formation System
-- This file contains all SQL queries needed to create and populate the database
-- Run these queries in your Supabase SQL editor

-- =============================================================================
-- 1. ADMIN USERS TABLE
-- =============================================================================
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'viewer')),
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 2. JURISDICTIONS TABLE
-- =============================================================================
CREATE TABLE jurisdictions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    flag_url TEXT,
    description TEXT,
    formation_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    processing_time VARCHAR(100),
    features JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    last_modified_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 3. ADDITIONAL SERVICES TABLE
-- =============================================================================
CREATE TABLE additional_services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    category VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 4. APPLICATIONS TABLE
-- =============================================================================
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    jurisdiction_name VARCHAR(255) NOT NULL,
    jurisdiction_price DECIMAL(10,2) NOT NULL,
    jurisdiction_currency VARCHAR(10) DEFAULT 'USD',
    contact_first_name VARCHAR(255),
    contact_last_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    company_proposed_name VARCHAR(255),
    company_business_activity TEXT,
    admin_notes TEXT,
    internal_status VARCHAR(50) DEFAULT 'new' CHECK (internal_status IN ('new', 'in_progress', 'completed', 'on_hold')),
    assigned_to INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 5. ORDERS TABLE
-- =============================================================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(100),
    applications_count INTEGER DEFAULT 0,
    services_count INTEGER DEFAULT 0,
    order_items JSONB,
    stripe_metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 6. ORDER ITEMS TABLE
-- =============================================================================
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(255) REFERENCES orders(order_id),
    item_type VARCHAR(20) CHECK (item_type IN ('application', 'service')),
    item_name VARCHAR(255) NOT NULL,
    jurisdiction_name VARCHAR(255),
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    item_metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 7. CONTACT FORMS TABLE
-- =============================================================================
CREATE TABLE contact_forms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company_name VARCHAR(255),
    country VARCHAR(100),
    service_type VARCHAR(100),
    message TEXT,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
    assigned_to INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 8. CMS CONTENT TABLE
-- =============================================================================
CREATE TABLE cms_content (
    id SERIAL PRIMARY KEY,
    page VARCHAR(50) NOT NULL,
    section VARCHAR(50) NOT NULL,
    key_name VARCHAR(50) NOT NULL,
    content TEXT,
    content_type VARCHAR(20) DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'json')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(page, section, key_name)
);

-- =============================================================================
-- 9. ADMIN ACTIVITY LOGS TABLE
-- =============================================================================
CREATE TABLE admin_activity_logs (
    id SERIAL PRIMARY KEY,
    admin_user_id INTEGER REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_applications_created_at ON applications(created_at);
CREATE INDEX idx_applications_internal_status ON applications(internal_status);
CREATE INDEX idx_contact_forms_status ON contact_forms(status);
CREATE INDEX idx_contact_forms_created_at ON contact_forms(created_at);
CREATE INDEX idx_jurisdictions_status ON jurisdictions(status);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);

-- =============================================================================
-- 11. CREATE TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jurisdictions_updated_at BEFORE UPDATE ON jurisdictions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_additional_services_updated_at BEFORE UPDATE ON additional_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_forms_updated_at BEFORE UPDATE ON contact_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cms_content_updated_at BEFORE UPDATE ON cms_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 12. INSERT SAMPLE DATA
-- =============================================================================

-- Insert sample admin user (password: admin123 - you should change this)
INSERT INTO admin_users (email, password_hash, name, role) VALUES
('admin@rapidcompanies.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewFBldCQMcV.L9v6', 'System Admin', 'admin');

-- Insert jurisdictions data
INSERT INTO jurisdictions (name, country_code, flag_url, description, formation_price, currency, processing_time, features, status) VALUES
(
    'British Virgin Islands',
    'VG',
    'https://flagcdn.com/w320/vg.png',
    'One of the world''s most popular offshore jurisdictions, known for its flexible corporate laws and privacy protection.',
    1495.00,
    'USD',
    '2-3 business days',
    '["No minimum capital requirement", "Bearer shares allowed", "Complete privacy protection", "No local director required", "Tax-free offshore income", "Quick incorporation process"]',
    'active'
),
(
    'Cayman Islands',
    'KY',
    'https://flagcdn.com/w320/ky.png',
    'Premier offshore financial center with sophisticated legal framework, popular for investment funds and holding companies.',
    2950.00,
    'USD',
    '3-5 business days',
    '["Sophisticated legal framework", "No corporate income tax", "Strong regulatory environment", "Popular for funds", "Excellent reputation", "Political stability"]',
    'active'
),
(
    'Seychelles',
    'SC',
    'https://flagcdn.com/w320/sc.png',
    'Cost-effective offshore jurisdiction with modern corporate legislation and strong privacy protection.',
    995.00,
    'USD',
    '1-2 business days',
    '["Low incorporation cost", "Fast incorporation", "Bearer shares available", "No minimum capital", "Tax exemption available", "Privacy protection"]',
    'active'
),
(
    'Panama',
    'PA',
    'https://flagcdn.com/w320/pa.png',
    'Stable jurisdiction with mature offshore legislation, offering excellent asset protection and privacy.',
    1795.00,
    'USD',
    '3-4 business days',
    '["Bearer shares allowed", "Strong asset protection", "No exchange controls", "Territorial tax system", "Banking secrecy laws", "Political stability"]',
    'active'
),
(
    'Delaware',
    'US-DE',
    'https://flagcdn.com/w320/us.png',
    'Most popular U.S. state for incorporation, with business-friendly laws and Court of Chancery.',
    895.00,
    'USD',
    '1-2 business days',
    '["Business-friendly laws", "Court of Chancery", "Strong legal precedents", "No minimum capital", "Delaware General Corporation Law", "Flexible corporate structure"]',
    'active'
),
(
    'Singapore',
    'SG',
    'https://flagcdn.com/w320/sg.png',
    'Leading Asian financial center with excellent business environment and strategic location.',
    2495.00,
    'USD',
    '2-3 business days',
    '["Strategic Asian location", "Excellent business environment", "Strong regulatory framework", "Tax incentives available", "Political stability", "Advanced infrastructure"]',
    'active'
),
(
    'Hong Kong',
    'HK',
    'https://flagcdn.com/w320/hk.png',
    'Gateway to China with simple tax system and excellent business infrastructure.',
    1995.00,
    'USD',
    '2-4 business days',
    '["Gateway to China", "Simple tax system", "No capital gains tax", "Free trade port", "Excellent infrastructure", "International financial center"]',
    'active'
),
(
    'Belize',
    'BZ',
    'https://flagcdn.com/w320/bz.png',
    'English-speaking jurisdiction with modern IBC legislation and strong privacy protection.',
    1295.00,
    'USD',
    '1-2 business days',
    '["English common law", "Modern IBC Act", "No minimum capital", "Bearer shares allowed", "Tax exemption available", "Privacy protection"]',
    'active'
);

-- Insert additional services
INSERT INTO additional_services (name, description, price, currency, category, status) VALUES
('Apostille Certificate', 'Apostille authentication for company documents', 150.00, 'USD', 'Documentation', 'active'),
('Registered Agent Service', 'Professional registered agent service (annual)', 350.00, 'USD', 'Compliance', 'active'),
('Bank Account Opening Assistance', 'Professional assistance with offshore bank account opening', 995.00, 'USD', 'Banking', 'active'),
('Nominee Director Service', 'Professional nominee director service (annual)', 750.00, 'USD', 'Privacy', 'active'),
('Nominee Shareholder Service', 'Professional nominee shareholder service (annual)', 650.00, 'USD', 'Privacy', 'active'),
('Virtual Office Address', 'Professional business address with mail forwarding', 450.00, 'USD', 'Address', 'active'),
('Annual Compliance Package', 'Complete annual filing and compliance service', 595.00, 'USD', 'Compliance', 'active'),
('Corporate Seal', 'Official company seal and stamp', 95.00, 'USD', 'Documentation', 'active'),
('Share Certificates', 'Professional share certificate printing (set of 10)', 125.00, 'USD', 'Documentation', 'active'),
('Power of Attorney', 'General power of attorney documentation', 295.00, 'USD', 'Legal', 'active');

-- Insert sample CMS content
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

-- Insert sample applications
INSERT INTO applications (jurisdiction_name, jurisdiction_price, jurisdiction_currency, contact_first_name, contact_last_name, contact_email, contact_phone, company_proposed_name, company_business_activity, internal_status) VALUES
('British Virgin Islands', 1495.00, 'USD', 'John', 'Smith', 'john.smith@example.com', '+44 20 7123 4567', 'Global Trading Ltd', 'International trading and investment', 'new'),
('Cayman Islands', 2950.00, 'USD', 'Sarah', 'Johnson', 'sarah.johnson@example.com', '+1 212 555 0123', 'Investment Holdings Inc', 'Investment fund management', 'in_progress'),
('Seychelles', 995.00, 'USD', 'Michael', 'Brown', 'michael.brown@example.com', '+61 2 9876 5432', 'Pacific Ventures Ltd', 'Consulting and advisory services', 'completed');

-- Insert sample orders
INSERT INTO orders (order_id, customer_email, customer_name, total_amount, currency, payment_status, applications_count, services_count) VALUES
('ORD-2024-001', 'john.smith@example.com', 'John Smith', 1645.00, 'USD', 'paid', 1, 1),
('ORD-2024-002', 'sarah.johnson@example.com', 'Sarah Johnson', 3945.00, 'USD', 'paid', 1, 2),
('ORD-2024-003', 'michael.brown@example.com', 'Michael Brown', 1590.00, 'USD', 'pending', 1, 1);

-- Insert sample order items
INSERT INTO order_items (order_id, item_type, item_name, jurisdiction_name, unit_price, quantity, total_price, currency) VALUES
('ORD-2024-001', 'application', 'British Virgin Islands Company Formation', 'British Virgin Islands', 1495.00, 1, 1495.00, 'USD'),
('ORD-2024-001', 'service', 'Apostille Certificate', NULL, 150.00, 1, 150.00, 'USD'),
('ORD-2024-002', 'application', 'Cayman Islands Company Formation', 'Cayman Islands', 2950.00, 1, 2950.00, 'USD'),
('ORD-2024-002', 'service', 'Bank Account Opening Assistance', NULL, 995.00, 1, 995.00, 'USD'),
('ORD-2024-003', 'application', 'Seychelles Company Formation', 'Seychelles', 995.00, 1, 995.00, 'USD'),
('ORD-2024-003', 'service', 'Registered Agent Service', NULL, 595.00, 1, 595.00, 'USD');

-- Insert sample contact forms
INSERT INTO contact_forms (name, email, phone, company_name, country, service_type, message, status) VALUES
('David Wilson', 'david.wilson@example.com', '+44 161 123 4567', 'Tech Innovations Ltd', 'British Virgin Islands', 'Company Formation', 'Looking to establish a holding company for our UK operations.', 'new'),
('Emma Davis', 'emma.davis@example.com', '+1 305 555 0199', 'Miami Investments', 'Cayman Islands', 'Banking Services', 'Need assistance with opening a corporate bank account.', 'contacted'),
('Robert Chen', 'robert.chen@example.com', '+65 6123 4567', 'Asia Pacific Holdings', 'Singapore', 'Professional Formation', 'Interested in Singapore incorporation for regional expansion.', 'qualified');

-- =============================================================================
-- 13. ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Note: You may want to configure RLS policies based on your security requirements
-- These are basic examples - customize based on your needs

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;

-- Example RLS policy for admin users (customize as needed)
CREATE POLICY "Admin users can view their own data" ON admin_users
    FOR ALL USING (auth.uid()::text = email OR auth.jwt() ->> 'role' = 'admin');

-- Example RLS policy for public data (jurisdictions)
CREATE POLICY "Jurisdictions are viewable by everyone" ON jurisdictions
    FOR SELECT USING (status = 'active');

-- =============================================================================
-- 14. CREATE FUNCTIONS FOR COMMON OPERATIONS
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

-- Function to generate order ID
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_sequence')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order IDs
CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================
--
-- Your Supabase database is now set up with:
-- ✅ All necessary tables for the offshore formation system
-- ✅ Sample data for testing and development
-- ✅ Proper indexes for performance
-- ✅ Triggers for automatic timestamp updates
-- ✅ Basic RLS policies (customize as needed)
-- ✅ Utility functions for common operations
--
-- Next steps:
-- 1. Update your Supabase environment variables in .env.local
-- 2. Configure RLS policies based on your security requirements
-- 3. Set up authentication for admin users
-- 4. Test the database connection with your application
-- 5. Customize the sample data as needed
--
-- Remember to:
-- - Change the default admin password
-- - Set up proper backup procedures
-- - Monitor database performance
-- - Keep your Supabase project updated
--
-- =============================================================================