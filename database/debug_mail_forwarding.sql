-- ============================================================================
-- DEBUG SCRIPT FOR MAIL FORWARDING
-- ============================================================================
-- Use this script to diagnose issues with mail forwarding data
-- ============================================================================

-- ============================================================================
-- 1. CHECK IF TABLE EXISTS
-- ============================================================================

SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'mail_forwarding_applications'
    )
    THEN '✓ Table EXISTS'
    ELSE '✗ Table DOES NOT EXIST'
  END as table_status;

-- ============================================================================
-- 2. CHECK TABLE STRUCTURE
-- ============================================================================

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'mail_forwarding_applications'
ORDER BY ordinal_position;

-- ============================================================================
-- 3. CHECK IF RLS IS ENABLED
-- ============================================================================

SELECT
  tablename,
  rowsecurity as rls_enabled,
  CASE
    WHEN rowsecurity THEN '✓ RLS is ENABLED'
    ELSE '✗ RLS is DISABLED'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'mail_forwarding_applications';

-- ============================================================================
-- 4. LIST ALL RLS POLICIES
-- ============================================================================

SELECT
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'mail_forwarding_applications'
ORDER BY policyname;

-- ============================================================================
-- 5. CHECK INDEXES
-- ============================================================================

SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'mail_forwarding_applications'
ORDER BY indexname;

-- ============================================================================
-- 6. COUNT RECORDS IN TABLE
-- ============================================================================

SELECT
  COUNT(*) as total_records,
  COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_count,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_status_count
FROM mail_forwarding_applications;

-- ============================================================================
-- 7. VIEW RECENT RECORDS (Last 10)
-- ============================================================================

SELECT
  id,
  entity_type,
  entity_name,
  email,
  jurisdiction,
  price,
  currency,
  payment_status,
  status,
  order_id,
  created_at
FROM mail_forwarding_applications
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 8. CHECK ORDERS TABLE FOR MAIL FORWARDING
-- ============================================================================

-- Check if columns exist in orders table
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'orders'
AND column_name IN ('mail_forwarding_count', 'has_mail_forwarding');

-- Count orders with mail forwarding
SELECT
  COUNT(*) as total_orders_with_mf,
  SUM(mail_forwarding_count) as total_mf_count
FROM orders
WHERE has_mail_forwarding = true;

-- ============================================================================
-- 9. CHECK RECENT ORDERS
-- ============================================================================

SELECT
  order_id,
  customer_email,
  total_amount,
  currency,
  payment_status,
  has_mail_forwarding,
  mail_forwarding_count,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- 10. JOIN ORDERS WITH MAIL FORWARDING
-- ============================================================================

SELECT
  o.order_id,
  o.customer_email,
  o.payment_status as order_status,
  o.total_amount,
  mf.id as mf_id,
  mf.jurisdiction,
  mf.entity_name,
  mf.price as mf_price,
  mf.payment_status as mf_payment_status,
  mf.status as mf_status,
  o.created_at
FROM orders o
LEFT JOIN mail_forwarding_applications mf ON o.order_id = mf.order_id
WHERE o.has_mail_forwarding = true
ORDER BY o.created_at DESC
LIMIT 10;

-- ============================================================================
-- 11. CHECK FOR ORPHANED MAIL FORWARDING RECORDS
-- ============================================================================

-- Mail forwarding records without matching orders
SELECT
  mf.id,
  mf.order_id,
  mf.email,
  mf.entity_name,
  mf.payment_status,
  mf.created_at
FROM mail_forwarding_applications mf
LEFT JOIN orders o ON mf.order_id = o.order_id
WHERE o.order_id IS NULL;

-- ============================================================================
-- 12. CHECK PERMISSIONS
-- ============================================================================

SELECT
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name = 'mail_forwarding_applications'
ORDER BY grantee, privilege_type;

-- ============================================================================
-- 13. TEST INSERT (commented out - uncomment to test)
-- ============================================================================

-- This will test if you can insert data
/*
INSERT INTO mail_forwarding_applications (
  entity_type,
  entity_name,
  contact_person,
  email,
  phone,
  address_line1,
  city,
  postcode,
  country,
  jurisdiction,
  forwarding_frequency,
  service_users,
  price,
  currency,
  payment_status,
  status,
  order_id
) VALUES (
  'company',
  'Test Company',
  'John Doe',
  'test@example.com',
  '+44 1234 567890',
  '123 Test Street',
  'London',
  'SW1A 1AA',
  'United Kingdom',
  'BVI',
  'weekly',
  'Testing mail forwarding insert',
  500.00,
  'GBP',
  'pending',
  'pending',
  'test_order_' || NOW()::TEXT
) RETURNING *;
*/

-- ============================================================================
-- 14. CHECK TRIGGER
-- ============================================================================

SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table = 'mail_forwarding_applications';

-- ============================================================================
-- 15. SUMMARY REPORT
-- ============================================================================

DO $$
DECLARE
  table_exists BOOLEAN;
  rls_enabled BOOLEAN;
  policy_count INTEGER;
  record_count INTEGER;
  index_count INTEGER;
BEGIN
  -- Check table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'mail_forwarding_applications'
  ) INTO table_exists;

  -- Check RLS
  SELECT rowsecurity INTO rls_enabled
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename = 'mail_forwarding_applications';

  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'mail_forwarding_applications';

  -- Count records
  SELECT COUNT(*) INTO record_count
  FROM mail_forwarding_applications;

  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND tablename = 'mail_forwarding_applications';

  -- Print report
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MAIL FORWARDING DEBUG REPORT';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Table Exists: %', CASE WHEN table_exists THEN '✓ YES' ELSE '✗ NO' END;
  RAISE NOTICE 'RLS Enabled: %', CASE WHEN rls_enabled THEN '✓ YES' ELSE '✗ NO' END;
  RAISE NOTICE 'RLS Policies: %', policy_count;
  RAISE NOTICE 'Indexes: %', index_count;
  RAISE NOTICE 'Total Records: %', record_count;
  RAISE NOTICE '========================================';

  IF NOT table_exists THEN
    RAISE NOTICE '⚠ ACTION REQUIRED: Run mail_forwarding_setup_with_rls.sql';
  ELSIF NOT rls_enabled THEN
    RAISE NOTICE '⚠ ACTION REQUIRED: Enable RLS on the table';
  ELSIF policy_count = 0 THEN
    RAISE NOTICE '⚠ ACTION REQUIRED: Create RLS policies';
  ELSIF record_count = 0 THEN
    RAISE NOTICE 'ℹ INFO: No records yet - test the checkout flow';
  ELSE
    RAISE NOTICE '✓ Everything looks good!';
  END IF;

  RAISE NOTICE '';
END $$;
