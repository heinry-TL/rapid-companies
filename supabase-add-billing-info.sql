-- =============================================================================
-- MIGRATION: Add Billing Information Fields to Orders Table
-- Captures billing address and name for standalone orders
-- =============================================================================

-- Add billing information columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS billing_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS billing_address_line1 VARCHAR(500),
ADD COLUMN IF NOT EXISTS billing_address_line2 VARCHAR(500),
ADD COLUMN IF NOT EXISTS billing_city VARCHAR(255),
ADD COLUMN IF NOT EXISTS billing_state VARCHAR(255),
ADD COLUMN IF NOT EXISTS billing_postal_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS billing_country VARCHAR(100);

-- Create index for faster lookups by billing name
CREATE INDEX IF NOT EXISTS idx_orders_billing_name ON orders(billing_name);
CREATE INDEX IF NOT EXISTS idx_orders_billing_country ON orders(billing_country);

-- Update applications table to also store billing info for standalone services
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS billing_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS billing_address JSONB;

-- Verification query
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name LIKE 'billing%'
ORDER BY ordinal_position;