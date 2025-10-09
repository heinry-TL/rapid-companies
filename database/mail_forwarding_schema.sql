-- ============================================================================
-- Mail Forwarding Database Schema
-- ============================================================================
-- This schema defines the database structure for the mail forwarding service
-- Mail forwarding can be purchased standalone or with company applications
-- ============================================================================

-- ============================================================================
-- 1. MAIN MAIL FORWARDING APPLICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS mail_forwarding_applications (
  -- Primary Key
  id SERIAL PRIMARY KEY,

  -- Entity Information
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('company', 'individual')),
  entity_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,

  -- Contact Details
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,

  -- Address Information
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  county VARCHAR(100),
  postcode VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'United Kingdom',

  -- Service Details
  jurisdiction VARCHAR(100) NOT NULL,  -- Which jurisdiction (BVI, Seychelles, etc.)
  forwarding_frequency VARCHAR(20) NOT NULL CHECK (forwarding_frequency IN ('weekly', 'biweekly', 'monthly')),
  service_users TEXT NOT NULL,  -- Who will use this service
  additional_info TEXT,

  -- Pricing & Payment
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),

  -- Order Relationship (nullable - only set if purchased with other items)
  order_id VARCHAR(255),

  -- Application Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'cancelled', 'completed')),

  -- Admin Notes & Assignment
  admin_notes TEXT,
  assigned_to INT,  -- Admin user handling this application

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_mail_forwarding_email
  ON mail_forwarding_applications(email);

CREATE INDEX IF NOT EXISTS idx_mail_forwarding_status
  ON mail_forwarding_applications(status);

CREATE INDEX IF NOT EXISTS idx_mail_forwarding_payment_status
  ON mail_forwarding_applications(payment_status);

CREATE INDEX IF NOT EXISTS idx_mail_forwarding_order_id
  ON mail_forwarding_applications(order_id);

CREATE INDEX IF NOT EXISTS idx_mail_forwarding_created_at
  ON mail_forwarding_applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mail_forwarding_jurisdiction
  ON mail_forwarding_applications(jurisdiction);

CREATE INDEX IF NOT EXISTS idx_mail_forwarding_entity_name
  ON mail_forwarding_applications(entity_name);

-- ============================================================================
-- 3. UPDATE ORDERS TABLE
-- ============================================================================

-- Add columns to track mail forwarding in orders
DO $$
BEGIN
  -- Add mail_forwarding_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'mail_forwarding_count'
  ) THEN
    ALTER TABLE orders ADD COLUMN mail_forwarding_count INT DEFAULT 0;
    COMMENT ON COLUMN orders.mail_forwarding_count IS 'Number of mail forwarding applications in this order';
  END IF;

  -- Add has_mail_forwarding flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'has_mail_forwarding'
  ) THEN
    ALTER TABLE orders ADD COLUMN has_mail_forwarding BOOLEAN DEFAULT FALSE;
    COMMENT ON COLUMN orders.has_mail_forwarding IS 'Flag indicating if order includes mail forwarding';
  END IF;
END $$;

-- ============================================================================
-- 4. FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Add foreign key to orders table (if orders table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'fk_mail_forwarding_order'
    ) THEN
      ALTER TABLE mail_forwarding_applications
      ADD CONSTRAINT fk_mail_forwarding_order
      FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Add foreign key to admin_users table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'fk_mail_forwarding_admin'
    ) THEN
      ALTER TABLE mail_forwarding_applications
      ADD CONSTRAINT fk_mail_forwarding_admin
      FOREIGN KEY (assigned_to) REFERENCES admin_users(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 5. TRIGGER FOR AUTO-UPDATE TIMESTAMP
-- ============================================================================

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_mail_forwarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_update_mail_forwarding_timestamp ON mail_forwarding_applications;

CREATE TRIGGER trigger_update_mail_forwarding_timestamp
BEFORE UPDATE ON mail_forwarding_applications
FOR EACH ROW
EXECUTE FUNCTION update_mail_forwarding_updated_at();

-- ============================================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE mail_forwarding_applications IS 'Stores mail forwarding service applications. Can be purchased standalone or with company formation.';
COMMENT ON COLUMN mail_forwarding_applications.entity_type IS 'Whether the service is for a company or individual';
COMMENT ON COLUMN mail_forwarding_applications.jurisdiction IS 'The jurisdiction for mail forwarding (e.g., BVI, Seychelles)';
COMMENT ON COLUMN mail_forwarding_applications.order_id IS 'Links to orders table. NULL if purchased standalone without creating an order yet';
COMMENT ON COLUMN mail_forwarding_applications.payment_status IS 'Payment status: pending, paid, failed, or refunded';
COMMENT ON COLUMN mail_forwarding_applications.status IS 'Service status: pending, active, suspended, cancelled, or completed';

-- ============================================================================
-- 7. SAMPLE DATA FOR PROFESSIONAL SERVICES TABLE
-- ============================================================================

-- Insert mail forwarding service into professional_services
-- NOTE: Adjust this based on your actual professional_services table structure
/*
INSERT INTO professional_services (
  name,
  description,
  short_description,
  features,
  benefits,
  category,
  pricing,
  full_description,
  link_url,
  link_text,
  active,
  display_order
) VALUES (
  'Mail Forwarding Service',
  'Professional mail forwarding service for your offshore company across multiple jurisdictions',
  'Forward your mail from any jurisdiction to your preferred address',
  '["BVI - £500", "Seychelles - £350", "Panama - £400", "Cayman Islands - £600", "Singapore - £550", "Hong Kong - £580"]',
  '["Secure mail handling", "Flexible forwarding schedules", "Digital scan option available", "Physical mail forwarding", "Professional handling", "Multiple jurisdiction support"]',
  'office',
  'From £350 per year',
  'Our mail forwarding service provides a secure and reliable way to manage your business correspondence from offshore jurisdictions. We offer flexible forwarding schedules (weekly, bi-weekly, or monthly) and can handle mail from multiple jurisdictions. Each jurisdiction has specific pricing based on local handling requirements and postal costs.',
  '/portfolio',
  'Buy Now',
  TRUE,
  10
) ON CONFLICT DO NOTHING;
*/

-- ============================================================================
-- 8. USEFUL QUERIES FOR ADMIN DASHBOARD
-- ============================================================================

-- View: Get all pending mail forwarding applications
CREATE OR REPLACE VIEW v_pending_mail_forwarding AS
SELECT
  id,
  entity_name,
  contact_person,
  email,
  jurisdiction,
  forwarding_frequency,
  price,
  payment_status,
  status,
  created_at
FROM mail_forwarding_applications
WHERE status = 'pending'
ORDER BY created_at DESC;

-- View: Get mail forwarding revenue by jurisdiction
CREATE OR REPLACE VIEW v_mail_forwarding_revenue_by_jurisdiction AS
SELECT
  jurisdiction,
  COUNT(*) as total_applications,
  SUM(price) as total_revenue,
  AVG(price) as avg_price,
  COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_count,
  COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_count
FROM mail_forwarding_applications
GROUP BY jurisdiction
ORDER BY total_revenue DESC;

-- View: Get orders with mail forwarding
CREATE OR REPLACE VIEW v_orders_with_mail_forwarding AS
SELECT
  o.order_id,
  o.customer_email,
  o.customer_name,
  o.total_amount,
  o.applications_count,
  o.mail_forwarding_count,
  o.payment_status as order_payment_status,
  mf.id as mail_forwarding_id,
  mf.jurisdiction,
  mf.entity_name,
  mf.price as mail_forwarding_price,
  mf.status as mail_forwarding_status,
  o.created_at as order_date
FROM orders o
LEFT JOIN mail_forwarding_applications mf ON o.order_id = mf.order_id
WHERE o.has_mail_forwarding = TRUE
ORDER BY o.created_at DESC;

-- ============================================================================
-- 9. BUSINESS LOGIC RULES (DOCUMENTED)
-- ============================================================================

/*
BUSINESS RULES FOR MAIL FORWARDING:

1. STANDALONE PURCHASE:
   - Create record in mail_forwarding_applications
   - Create order record in orders table
   - Do NOT create application record
   - Set has_mail_forwarding = TRUE
   - Set mail_forwarding_count = 1
   - Set applications_count = 0

2. PURCHASE WITH COMPANY FORMATION:
   - Create record in mail_forwarding_applications
   - Create application record in applications table
   - Link both to same order_id
   - Set has_mail_forwarding = TRUE
   - Set mail_forwarding_count = 1
   - Set applications_count >= 1

3. JURISDICTION PRICING:
   - Stored in professional_services.features as JSON array
   - Format: ["Jurisdiction Name - £Price"]
   - Example: ["BVI - £500", "Seychelles - £350"]
   - Price is determined by user's jurisdiction selection

4. STATUS FLOW:
   - pending: Initial state after purchase
   - paid: Payment confirmed (triggered by payment webhook)
   - active: Service is active and running
   - suspended: Temporarily suspended
   - cancelled: Service cancelled by customer
   - completed: Service term completed

5. PAYMENT STATUS FLOW:
   - pending: Awaiting payment
   - paid: Payment successful
   - failed: Payment failed
   - refunded: Payment refunded
*/

-- ============================================================================
-- 10. SAMPLE QUERIES
-- ============================================================================

-- Get all active mail forwarding services
-- SELECT * FROM mail_forwarding_applications WHERE status = 'active';

-- Get mail forwarding for a specific email
-- SELECT * FROM mail_forwarding_applications WHERE email = 'customer@example.com';

-- Get unpaid mail forwarding applications
-- SELECT * FROM mail_forwarding_applications WHERE payment_status = 'pending';

-- Get mail forwarding by jurisdiction
-- SELECT * FROM mail_forwarding_applications WHERE jurisdiction = 'BVI';

-- Get revenue by month
-- SELECT
--   DATE_TRUNC('month', created_at) as month,
--   COUNT(*) as total_applications,
--   SUM(price) as monthly_revenue
-- FROM mail_forwarding_applications
-- WHERE payment_status = 'paid'
-- GROUP BY DATE_TRUNC('month', created_at)
-- ORDER BY month DESC;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
