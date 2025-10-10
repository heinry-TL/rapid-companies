-- ============================================================================
-- TRUST FORMATION APPLICATIONS TABLE WITH RLS POLICIES
-- ============================================================================
-- This table stores trust formation service applications
-- Supports both "provide details now" and "provide details later" modes
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.trust_formation_applications (
  id BIGSERIAL PRIMARY KEY,

  -- Service Mode
  details_provided_now BOOLEAN NOT NULL DEFAULT true,
  -- true = user provided full details, false = user will provide details later

  -- Contact Information (always required)
  contact_first_name VARCHAR(255) NOT NULL,
  contact_last_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50) NOT NULL,

  -- Trust Details (optional if details_provided_now = false)
  trust_name VARCHAR(255),
  trust_type VARCHAR(100), -- e.g., "Discretionary Trust", "Fixed Trust", etc.
  jurisdiction VARCHAR(100) NOT NULL,
  trust_purpose TEXT,

  -- Settlor Information (person creating the trust)
  settlor_title VARCHAR(20),
  settlor_first_name VARCHAR(255),
  settlor_last_name VARCHAR(255),
  settlor_email VARCHAR(255),
  settlor_phone VARCHAR(50),
  settlor_date_of_birth DATE,
  settlor_nationality VARCHAR(100),
  settlor_address_line1 VARCHAR(255),
  settlor_address_line2 VARCHAR(255),
  settlor_city VARCHAR(100),
  settlor_state VARCHAR(100),
  settlor_postal_code VARCHAR(20),
  settlor_country VARCHAR(100),
  settlor_id_type VARCHAR(50), -- e.g., "Passport", "Driver's License"
  settlor_id_number VARCHAR(100),

  -- Trustees (stored as JSON array)
  trustees JSONB,
  -- Structure: [{ title, firstName, lastName, email, phone, dateOfBirth, nationality, address, idType, idNumber }]

  -- Beneficiaries (stored as JSON array)
  beneficiaries JSONB,
  -- Structure: [{ title, firstName, lastName, email, phone, dateOfBirth, nationality, relationship, benefitType, percentage }]

  -- Additional Information
  additional_notes TEXT,
  special_instructions TEXT,

  -- Pricing & Payment
  price NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),

  -- Order Relationship
  order_id VARCHAR(255),

  -- Application Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'awaiting_details', 'in_review', 'active', 'completed', 'cancelled')),
  -- pending = payment pending
  -- awaiting_details = paid but user chose "provide details later"
  -- in_review = details provided, under review
  -- active = trust is active
  -- completed = trust formation completed
  -- cancelled = application cancelled

  -- Admin Management
  admin_notes TEXT,
  assigned_to BIGINT,
  reviewed_by BIGINT,
  reviewed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_trust_contact_email ON public.trust_formation_applications(contact_email);
CREATE INDEX IF NOT EXISTS idx_trust_status ON public.trust_formation_applications(status);
CREATE INDEX IF NOT EXISTS idx_trust_payment_status ON public.trust_formation_applications(payment_status);
CREATE INDEX IF NOT EXISTS idx_trust_order_id ON public.trust_formation_applications(order_id);
CREATE INDEX IF NOT EXISTS idx_trust_created_at ON public.trust_formation_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trust_jurisdiction ON public.trust_formation_applications(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_trust_details_provided ON public.trust_formation_applications(details_provided_now);

-- ============================================================================
-- STEP 3: CREATE TRIGGER FOR AUTO-UPDATE TIMESTAMP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_trust_formation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_trust_timestamp ON public.trust_formation_applications;

CREATE TRIGGER trigger_update_trust_timestamp
  BEFORE UPDATE ON public.trust_formation_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trust_formation_updated_at();

-- ============================================================================
-- STEP 4: UPDATE ORDERS TABLE
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'orders'
    AND column_name = 'trust_formation_count'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN trust_formation_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'orders'
    AND column_name = 'has_trust_formation'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN has_trust_formation BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ============================================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.trust_formation_applications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: DROP EXISTING POLICIES (if any)
-- ============================================================================

DROP POLICY IF EXISTS "Service role full access" ON public.trust_formation_applications;
DROP POLICY IF EXISTS "Users can read own records" ON public.trust_formation_applications;
DROP POLICY IF EXISTS "Anyone can insert" ON public.trust_formation_applications;

-- ============================================================================
-- STEP 7: CREATE RLS POLICIES
-- ============================================================================

-- Policy 1: Allow service role (backend) full access
CREATE POLICY "Service role full access"
  ON public.trust_formation_applications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Allow authenticated users to read their own records
CREATE POLICY "Users can read own records"
  ON public.trust_formation_applications
  FOR SELECT
  TO authenticated
  USING (auth.email() = contact_email);

-- Policy 3: Allow anonymous users to insert (for checkout)
CREATE POLICY "Anyone can insert"
  ON public.trust_formation_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================================
-- STEP 8: GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT ON public.trust_formation_applications TO anon, authenticated;
GRANT ALL ON public.trust_formation_applications TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.trust_formation_applications_id_seq TO anon, authenticated, service_role;

-- ============================================================================
-- STEP 9: CREATE ADMIN VIEWS
-- ============================================================================

-- View: All pending trust formation applications
CREATE OR REPLACE VIEW public.v_pending_trust_formations AS
SELECT
  id,
  details_provided_now,
  contact_first_name,
  contact_last_name,
  contact_email,
  contact_phone,
  trust_name,
  jurisdiction,
  price,
  currency,
  payment_status,
  status,
  order_id,
  created_at
FROM public.trust_formation_applications
WHERE status = 'pending'
ORDER BY created_at DESC;

-- View: Trusts awaiting details (paid but details not provided)
CREATE OR REPLACE VIEW public.v_trusts_awaiting_details AS
SELECT
  id,
  contact_first_name,
  contact_last_name,
  contact_email,
  contact_phone,
  jurisdiction,
  price,
  currency,
  payment_status,
  order_id,
  created_at
FROM public.trust_formation_applications
WHERE status = 'awaiting_details' AND details_provided_now = false
ORDER BY created_at DESC;

-- View: Trust formation revenue by jurisdiction
CREATE OR REPLACE VIEW public.v_trust_formation_revenue AS
SELECT
  jurisdiction,
  COUNT(*) as total_applications,
  SUM(price) as total_revenue,
  AVG(price) as avg_price,
  COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_count,
  COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
  COUNT(CASE WHEN details_provided_now = false THEN 1 END) as awaiting_details_count
FROM public.trust_formation_applications
GROUP BY jurisdiction
ORDER BY total_revenue DESC;

-- ============================================================================
-- STEP 10: ADD COMMENTS
-- ============================================================================

COMMENT ON TABLE public.trust_formation_applications IS 'Stores trust formation service applications with jurisdiction-based pricing';
COMMENT ON COLUMN public.trust_formation_applications.details_provided_now IS 'Whether user provided full details or will provide later';
COMMENT ON COLUMN public.trust_formation_applications.jurisdiction IS 'Jurisdiction for trust formation';
COMMENT ON COLUMN public.trust_formation_applications.order_id IS 'Links to orders table';
COMMENT ON COLUMN public.trust_formation_applications.payment_status IS 'Payment status: pending, paid, failed, or refunded';
COMMENT ON COLUMN public.trust_formation_applications.status IS 'Application status: pending, awaiting_details, in_review, active, completed, or cancelled';
COMMENT ON COLUMN public.trust_formation_applications.trustees IS 'JSON array of trustee information';
COMMENT ON COLUMN public.trust_formation_applications.beneficiaries IS 'JSON array of beneficiary information';

-- ============================================================================
-- STEP 11: VERIFY SETUP
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'trust_formation_applications'
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✓ RLS is enabled on trust_formation_applications';
  ELSE
    RAISE WARNING '✗ RLS is NOT enabled on trust_formation_applications';
  END IF;
END $$;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ Trust Formation Setup Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Table: trust_formation_applications';
  RAISE NOTICE 'RLS: Enabled';
  RAISE NOTICE 'Policies: Created';
  RAISE NOTICE 'Indexes: Created';
  RAISE NOTICE 'Views: Created';
  RAISE NOTICE 'Mode: Supports both "provide now" and "provide later"';
  RAISE NOTICE '========================================';
END $$;
