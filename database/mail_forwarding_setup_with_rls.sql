-- ============================================================================
-- COMPLETE MAIL FORWARDING SETUP WITH RLS POLICIES
-- ============================================================================
-- This file creates the mail forwarding table and sets up proper security
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mail_forwarding_applications (
  id BIGSERIAL PRIMARY KEY,

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
  jurisdiction VARCHAR(100) NOT NULL,
  forwarding_frequency VARCHAR(20) NOT NULL CHECK (forwarding_frequency IN ('weekly', 'biweekly', 'monthly')),
  service_users TEXT NOT NULL,
  additional_info TEXT,

  -- Pricing & Payment
  price NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),

  -- Order Relationship
  order_id VARCHAR(255),

  -- Application Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'cancelled', 'completed')),

  -- Admin Notes
  admin_notes TEXT,
  assigned_to BIGINT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_mf_email ON public.mail_forwarding_applications(email);
CREATE INDEX IF NOT EXISTS idx_mf_status ON public.mail_forwarding_applications(status);
CREATE INDEX IF NOT EXISTS idx_mf_payment_status ON public.mail_forwarding_applications(payment_status);
CREATE INDEX IF NOT EXISTS idx_mf_order_id ON public.mail_forwarding_applications(order_id);
CREATE INDEX IF NOT EXISTS idx_mf_created_at ON public.mail_forwarding_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mf_jurisdiction ON public.mail_forwarding_applications(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_mf_entity_name ON public.mail_forwarding_applications(entity_name);

-- ============================================================================
-- STEP 3: CREATE TRIGGER FOR AUTO-UPDATE TIMESTAMP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_mail_forwarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_mf_timestamp ON public.mail_forwarding_applications;

CREATE TRIGGER trigger_update_mf_timestamp
  BEFORE UPDATE ON public.mail_forwarding_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mail_forwarding_updated_at();

-- ============================================================================
-- STEP 4: UPDATE ORDERS TABLE (add columns if they don't exist)
-- ============================================================================

DO $$
BEGIN
  -- Add mail_forwarding_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'orders'
    AND column_name = 'mail_forwarding_count'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN mail_forwarding_count INTEGER DEFAULT 0;
  END IF;

  -- Add has_mail_forwarding column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'orders'
    AND column_name = 'has_mail_forwarding'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN has_mail_forwarding BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ============================================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on the table
ALTER TABLE public.mail_forwarding_applications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: DROP EXISTING POLICIES (if any)
-- ============================================================================

DROP POLICY IF EXISTS "Allow service role full access" ON public.mail_forwarding_applications;
DROP POLICY IF EXISTS "Allow anon read own email" ON public.mail_forwarding_applications;
DROP POLICY IF EXISTS "Allow authenticated read own" ON public.mail_forwarding_applications;
DROP POLICY IF EXISTS "Allow public insert" ON public.mail_forwarding_applications;

-- ============================================================================
-- STEP 7: CREATE RLS POLICIES
-- ============================================================================

-- Policy 1: Allow service role (backend) full access
-- This is what your API routes use via supabaseAdmin
CREATE POLICY "Service role full access"
  ON public.mail_forwarding_applications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Allow authenticated users to read their own records
CREATE POLICY "Users can read own records"
  ON public.mail_forwarding_applications
  FOR SELECT
  TO authenticated
  USING (auth.email() = email);

-- Policy 3: Allow anonymous users to insert (for checkout)
-- This allows the frontend to create records during payment
CREATE POLICY "Anyone can insert"
  ON public.mail_forwarding_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================================
-- STEP 8: GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant permissions on table
GRANT SELECT, INSERT ON public.mail_forwarding_applications TO anon, authenticated;
GRANT ALL ON public.mail_forwarding_applications TO service_role;

-- Grant permissions on sequence (for id generation)
GRANT USAGE, SELECT ON SEQUENCE public.mail_forwarding_applications_id_seq TO anon, authenticated, service_role;

-- ============================================================================
-- STEP 9: CREATE ADMIN VIEWS
-- ============================================================================

-- View: All pending mail forwarding applications
CREATE OR REPLACE VIEW public.v_pending_mail_forwarding AS
SELECT
  id,
  entity_type,
  entity_name,
  contact_person,
  email,
  phone,
  jurisdiction,
  forwarding_frequency,
  price,
  currency,
  payment_status,
  status,
  order_id,
  created_at
FROM public.mail_forwarding_applications
WHERE status = 'pending'
ORDER BY created_at DESC;

-- View: Mail forwarding revenue by jurisdiction
CREATE OR REPLACE VIEW public.v_mail_forwarding_revenue AS
SELECT
  jurisdiction,
  COUNT(*) as total_applications,
  SUM(price) as total_revenue,
  AVG(price) as avg_price,
  COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_count,
  COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM public.mail_forwarding_applications
GROUP BY jurisdiction
ORDER BY total_revenue DESC;

-- ============================================================================
-- STEP 10: ADD COMMENTS
-- ============================================================================

COMMENT ON TABLE public.mail_forwarding_applications IS 'Stores mail forwarding service applications with jurisdiction-based pricing';
COMMENT ON COLUMN public.mail_forwarding_applications.entity_type IS 'Whether service is for company or individual';
COMMENT ON COLUMN public.mail_forwarding_applications.jurisdiction IS 'Jurisdiction for mail forwarding (BVI, Seychelles, etc)';
COMMENT ON COLUMN public.mail_forwarding_applications.order_id IS 'Links to orders table';
COMMENT ON COLUMN public.mail_forwarding_applications.payment_status IS 'Payment status: pending, paid, failed, or refunded';
COMMENT ON COLUMN public.mail_forwarding_applications.status IS 'Service status: pending, active, suspended, cancelled, or completed';

-- ============================================================================
-- STEP 11: VERIFY SETUP
-- ============================================================================

-- Check if RLS is enabled
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'mail_forwarding_applications'
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✓ RLS is enabled on mail_forwarding_applications';
  ELSE
    RAISE WARNING '✗ RLS is NOT enabled on mail_forwarding_applications';
  END IF;
END $$;

-- Count policies
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'mail_forwarding_applications';

  RAISE NOTICE '✓ Created % policies for mail_forwarding_applications', policy_count;
END $$;

-- ============================================================================
-- STEP 12: TEST QUERIES (commented out - uncomment to test)
-- ============================================================================

-- Test 1: Check table structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'mail_forwarding_applications'
-- ORDER BY ordinal_position;

-- Test 2: Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'mail_forwarding_applications';

-- Test 3: Check policies
-- SELECT policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'mail_forwarding_applications';

-- Test 4: Check if orders table was updated
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'orders'
-- AND column_name IN ('mail_forwarding_count', 'has_mail_forwarding');

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ Mail Forwarding Setup Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Table: mail_forwarding_applications';
  RAISE NOTICE 'RLS: Enabled';
  RAISE NOTICE 'Policies: Created';
  RAISE NOTICE 'Indexes: Created';
  RAISE NOTICE 'Views: Created';
  RAISE NOTICE '========================================';
END $$;
