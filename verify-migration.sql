-- =============================================================================
-- VERIFICATION QUERIES - Run these to confirm the migration worked
-- =============================================================================

-- 1. Check all columns in applications table
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'applications'
ORDER BY ordinal_position;

-- 2. Check constraints on applications table
SELECT
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'applications'::regclass;

-- 3. Check indexes on applications table
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'applications';

-- 4. Sample data from applications table (first 5 rows)
SELECT
    id,
    application_identifier,
    jurisdiction_name,
    contact_email,
    payment_status,
    order_id,
    internal_status,
    created_at
FROM applications
ORDER BY created_at DESC
LIMIT 5;

-- 5. Count applications by payment status
SELECT
    payment_status,
    COUNT(*) as count
FROM applications
GROUP BY payment_status
ORDER BY count DESC;

-- 6. Check for any NULL application_identifiers (should be zero)
SELECT COUNT(*) as null_identifiers
FROM applications
WHERE application_identifier IS NULL;

-- 7. Sample orders with their linked applications
SELECT
    o.order_id,
    o.customer_email,
    o.total_amount,
    o.payment_status as order_payment_status,
    o.applications_count,
    o.services_count,
    o.created_at,
    COUNT(a.id) as linked_applications
FROM orders o
LEFT JOIN applications a ON a.order_id = o.order_id
GROUP BY o.order_id, o.customer_email, o.total_amount, o.payment_status, o.applications_count, o.services_count, o.created_at
ORDER BY o.created_at DESC
LIMIT 5;