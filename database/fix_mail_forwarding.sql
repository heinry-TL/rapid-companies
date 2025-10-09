-- ============================================================================
-- FIX MAIL FORWARDING TABLE - Drop conflicting views first
-- ============================================================================
-- Run this if you get view column errors
-- ============================================================================

-- STEP 1: Drop any conflicting views
DROP VIEW IF EXISTS public.v_pending_mail_forwarding CASCADE;
DROP VIEW IF EXISTS public.v_mail_forwarding_revenue CASCADE;

-- STEP 2: Drop table if it has issues (WARNING: This deletes all data!)
-- Comment this out if you want to keep existing data
-- DROP TABLE IF EXISTS public.mail_forwarding_applications CASCADE;

-- STEP 3: Create table with correct structure
CREATE TABLE IF NOT EXISTS public.mail_forwarding_applications (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('company', 'individual')),
  entity_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  county VARCHAR(100),
  postcode VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'United Kingdom',
  jurisdiction VARCHAR(100) NOT NULL,
  forwarding_frequency VARCHAR(20) NOT NULL CHECK (forwarding_frequency IN ('weekly', 'biweekly', 'monthly')),
  service_users TEXT NOT NULL,
  additional_info TEXT,
  price NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'cancelled', 'completed')),
  admin_notes TEXT,
  assigned_to BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4: Enable RLS
ALTER TABLE public.mail_forwarding_applications ENABLE ROW LEVEL SECURITY;

-- STEP 5: Drop existing policies
DROP POLICY IF EXISTS "Service role full access" ON public.mail_forwarding_applications;
DROP POLICY IF EXISTS "Users can read own records" ON public.mail_forwarding_applications;
DROP POLICY IF EXISTS "Anyone can insert" ON public.mail_forwarding_applications;

-- STEP 6: Create RLS policies
CREATE POLICY "Service role full access"
  ON public.mail_forwarding_applications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read own records"
  ON public.mail_forwarding_applications
  FOR SELECT
  TO authenticated
  USING (auth.email() = email);

CREATE POLICY "Anyone can insert"
  ON public.mail_forwarding_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- STEP 7: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT ON public.mail_forwarding_applications TO anon, authenticated;
GRANT ALL ON public.mail_forwarding_applications TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.mail_forwarding_applications_id_seq TO anon, authenticated, service_role;

-- STEP 8: Create indexes
CREATE INDEX IF NOT EXISTS idx_mf_email ON public.mail_forwarding_applications(email);
CREATE INDEX IF NOT EXISTS idx_mf_status ON public.mail_forwarding_applications(status);
CREATE INDEX IF NOT EXISTS idx_mf_payment_status ON public.mail_forwarding_applications(payment_status);
CREATE INDEX IF NOT EXISTS idx_mf_order_id ON public.mail_forwarding_applications(order_id);
CREATE INDEX IF NOT EXISTS idx_mf_created_at ON public.mail_forwarding_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mf_jurisdiction ON public.mail_forwarding_applications(jurisdiction);

-- STEP 9: Create trigger for updated_at
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

-- STEP 10: Update orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'orders'
    AND column_name = 'mail_forwarding_count'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN mail_forwarding_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'orders'
    AND column_name = 'has_mail_forwarding'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN has_mail_forwarding BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- STEP 11: Create views (recreate after table is fixed)
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

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✓ Mail forwarding table fixed and secured!';
  RAISE NOTICE '✓ RLS policies created';
  RAISE NOTICE '✓ Permissions granted';
  RAISE NOTICE '';
END $$;
