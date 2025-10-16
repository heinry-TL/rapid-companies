-- Add VAT applicable field to jurisdictions table
-- This migration adds a boolean field to track whether VAT applies to a jurisdiction's pricing

-- For MySQL/MariaDB (XAMPP)
ALTER TABLE jurisdictions
ADD COLUMN vat_applicable BOOLEAN DEFAULT FALSE AFTER currency;

-- Add comment to document the field
ALTER TABLE jurisdictions
MODIFY COLUMN vat_applicable BOOLEAN DEFAULT FALSE COMMENT 'Whether VAT applies to this jurisdiction pricing';

-- For PostgreSQL/Supabase, use this instead:
-- ALTER TABLE jurisdictions
-- ADD COLUMN vat_applicable BOOLEAN DEFAULT FALSE;
--
-- COMMENT ON COLUMN jurisdictions.vat_applicable IS 'Whether VAT applies to this jurisdiction pricing';
