-- =============================================================================
-- UPDATE EXISTING SUPABASE DATABASE
-- Add missing billing fields without recreating existing tables
-- Safe to run on existing database
-- =============================================================================

-- Add billing fields to orders table if they don't exist
DO $$
BEGIN
    -- Check and add billing_name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'billing_name'
    ) THEN
        ALTER TABLE orders ADD COLUMN billing_name VARCHAR(255);
    END IF;

    -- Check and add billing_address_line1
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'billing_address_line1'
    ) THEN
        ALTER TABLE orders ADD COLUMN billing_address_line1 VARCHAR(500);
    END IF;

    -- Check and add billing_address_line2
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'billing_address_line2'
    ) THEN
        ALTER TABLE orders ADD COLUMN billing_address_line2 VARCHAR(500);
    END IF;

    -- Check and add billing_city
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'billing_city'
    ) THEN
        ALTER TABLE orders ADD COLUMN billing_city VARCHAR(255);
    END IF;

    -- Check and add billing_state
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'billing_state'
    ) THEN
        ALTER TABLE orders ADD COLUMN billing_state VARCHAR(255);
    END IF;

    -- Check and add billing_postal_code
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'billing_postal_code'
    ) THEN
        ALTER TABLE orders ADD COLUMN billing_postal_code VARCHAR(50);
    END IF;

    -- Check and add billing_country
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'billing_country'
    ) THEN
        ALTER TABLE orders ADD COLUMN billing_country VARCHAR(100);
    END IF;
END $$;

-- Create indexes for billing fields if they don't exist
CREATE INDEX IF NOT EXISTS idx_orders_billing_name ON orders(billing_name);
CREATE INDEX IF NOT EXISTS idx_orders_billing_country ON orders(billing_country);

-- Add billing fields to applications table if they don't exist
DO $$
BEGIN
    -- Check and add billing_name to applications
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'applications' AND column_name = 'billing_name'
    ) THEN
        ALTER TABLE applications ADD COLUMN billing_name VARCHAR(255);
    END IF;

    -- Check and add billing_address to applications
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'applications' AND column_name = 'billing_address'
    ) THEN
        ALTER TABLE applications ADD COLUMN billing_address JSONB;
    END IF;
END $$;

-- Verify the changes
SELECT
    'orders' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name LIKE 'billing%'
ORDER BY column_name;

SELECT
    'applications' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'applications'
  AND column_name LIKE 'billing%'
ORDER BY column_name;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed! Billing fields have been added to orders and applications tables.';
END $$;