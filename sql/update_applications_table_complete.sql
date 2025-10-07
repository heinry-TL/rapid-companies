-- Migration to add all missing fields to applications table
-- This ensures the database matches the application form structure

-- Add contact address fields if they don't exist
ALTER TABLE applications ADD COLUMN IF NOT EXISTS contact_address_line1 VARCHAR(500);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS contact_address_line2 VARCHAR(500);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS contact_city VARCHAR(255);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS contact_county VARCHAR(255);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS contact_postcode VARCHAR(20);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS contact_country VARCHAR(100) DEFAULT 'United Kingdom';

-- Add company details fields if they don't exist
ALTER TABLE applications ADD COLUMN IF NOT EXISTS company_alternative_name VARCHAR(500);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS company_authorized_capital DECIMAL(15, 2) DEFAULT 50000;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS company_number_of_shares INTEGER DEFAULT 50000;

-- Add registered address fields if they don't exist
ALTER TABLE applications ADD COLUMN IF NOT EXISTS registered_address_line1 VARCHAR(500);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS registered_address_line2 VARCHAR(500);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS registered_city VARCHAR(255);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS registered_county VARCHAR(255);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS registered_postcode VARCHAR(20);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS registered_country VARCHAR(100) DEFAULT 'United Kingdom';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS use_contact_address BOOLEAN DEFAULT FALSE;

-- Add JSON fields for directors, shareholders, and additional services
ALTER TABLE applications ADD COLUMN IF NOT EXISTS directors JSONB;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS shareholders JSONB;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS additional_services JSONB;

-- Add form completion tracking
ALTER TABLE applications ADD COLUMN IF NOT EXISTS step_completed INTEGER DEFAULT 0;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS is_complete BOOLEAN DEFAULT FALSE;

-- Add payment and order tracking
ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS order_id VARCHAR(255);

-- Add application identifier for upsert operations
ALTER TABLE applications ADD COLUMN IF NOT EXISTS application_identifier VARCHAR(500);

-- Add unique constraint on application_identifier if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'unique_application_identifier'
    ) THEN
        ALTER TABLE applications ADD CONSTRAINT unique_application_identifier UNIQUE (application_identifier);
    END IF;
END $$;

-- Add index on application_identifier for faster lookups
CREATE INDEX IF NOT EXISTS idx_application_identifier ON applications(application_identifier);

-- Add index on payment_status for filtering
CREATE INDEX IF NOT EXISTS idx_payment_status ON applications(payment_status);

-- Add index on order_id for lookups
CREATE INDEX IF NOT EXISTS idx_order_id ON applications(order_id);

-- Add index on step_completed for filtering incomplete applications
CREATE INDEX IF NOT EXISTS idx_step_completed ON applications(step_completed);

-- Add billing information fields if they don't exist (from Stripe webhook)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS billing_name VARCHAR(255);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS billing_address JSONB;

COMMENT ON TABLE applications IS 'Stores complete application data including contact details, company information, directors, shareholders, and additional services';
COMMENT ON COLUMN applications.directors IS 'JSON array of director information including name, nationality, passport, and address';
COMMENT ON COLUMN applications.shareholders IS 'JSON array of shareholder information including name, nationality, and share percentage';
COMMENT ON COLUMN applications.additional_services IS 'JSON array of additional services purchased with this application';
COMMENT ON COLUMN applications.application_identifier IS 'Unique identifier combining email, company name, and jurisdiction for upsert operations';
COMMENT ON COLUMN applications.step_completed IS 'Tracks which step of the multi-step form was last completed (1-5)';
