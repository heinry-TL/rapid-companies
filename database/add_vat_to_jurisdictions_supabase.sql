-- Supabase/PostgreSQL Migration: Add VAT applicable field to jurisdictions table
-- Run this in Supabase SQL Editor

ALTER TABLE jurisdictions
ADD COLUMN IF NOT EXISTS vat_applicable BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN jurisdictions.vat_applicable IS 'Whether VAT applies to this jurisdiction pricing (displays +VAT on website when true)';

-- Update the updated_at timestamp for modified rows
-- This is useful if you want to track when VAT settings were added
UPDATE jurisdictions SET updated_at = NOW() WHERE vat_applicable IS NULL;
