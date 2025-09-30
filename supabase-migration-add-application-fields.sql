-- =============================================================================
-- MIGRATION: Add Missing Fields to Applications Table
-- This migration adds the missing fields needed for proper order tracking
-- Run this in your Supabase SQL Editor if you already have the applications table
-- =============================================================================

-- Add payment_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add missing columns to applications table (without unique constraint initially)
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS application_identifier VARCHAR(500),
ADD COLUMN IF NOT EXISTS payment_status payment_status_enum DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS step_completed INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS additional_services JSONB;

-- Add foreign key constraint for order_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_applications_order_id'
    ) THEN
        ALTER TABLE applications
        ADD CONSTRAINT fk_applications_order_id
            FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_payment_status ON applications(payment_status);
CREATE INDEX IF NOT EXISTS idx_applications_order_id ON applications(order_id);
CREATE INDEX IF NOT EXISTS idx_applications_contact_email ON applications(contact_email);
CREATE INDEX IF NOT EXISTS idx_applications_application_identifier ON applications(application_identifier);

-- Update existing applications to have default values
UPDATE applications
SET
    payment_status = 'pending'
WHERE payment_status IS NULL;

UPDATE applications
SET
    step_completed = 1
WHERE step_completed IS NULL;

-- Generate application_identifier for existing records if they don't have one
-- Add a sequence number to prevent duplicates
WITH ranked_apps AS (
    SELECT
        id,
        LOWER(CONCAT(
            COALESCE(contact_email, 'unknown'), '_',
            COALESCE(REGEXP_REPLACE(company_proposed_name, '[^a-z0-9]', '_', 'gi'), 'unknown'), '_',
            COALESCE(REGEXP_REPLACE(jurisdiction_name, '[^a-z0-9]', '_', 'gi'), 'unknown')
        )) as base_identifier,
        ROW_NUMBER() OVER (
            PARTITION BY
                LOWER(CONCAT(
                    COALESCE(contact_email, 'unknown'), '_',
                    COALESCE(REGEXP_REPLACE(company_proposed_name, '[^a-z0-9]', '_', 'gi'), 'unknown'), '_',
                    COALESCE(REGEXP_REPLACE(jurisdiction_name, '[^a-z0-9]', '_', 'gi'), 'unknown')
                ))
            ORDER BY created_at
        ) as row_num
    FROM applications
    WHERE application_identifier IS NULL
)
UPDATE applications
SET application_identifier = CASE
    WHEN ranked_apps.row_num = 1 THEN ranked_apps.base_identifier
    ELSE CONCAT(ranked_apps.base_identifier, '_', ranked_apps.row_num)
END
FROM ranked_apps
WHERE applications.id = ranked_apps.id;

-- Now add the unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'unique_application_identifier'
    ) THEN
        ALTER TABLE applications
        ADD CONSTRAINT unique_application_identifier UNIQUE (application_identifier);
    END IF;
END $$;

-- Verify the migration
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'applications'
ORDER BY ordinal_position;

-- Migration completed successfully!