-- ============================================================================
-- UPDATE ORDER ITEMS ENUM TO INCLUDE TRUST FORMATION AND MAIL FORWARDING
-- ============================================================================
-- This migration updates the order_items table to support trust formation
-- and mail forwarding service types in addition to existing application and service types
-- ============================================================================

-- For PostgreSQL (Supabase) - Handle ENUM type if it exists
-- First, check if item_type_enum exists and add new values to it
DO $$
BEGIN
  -- Check if the enum type exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_type_enum') THEN
    -- Add trust_formation if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum
      WHERE enumtypid = 'item_type_enum'::regtype
      AND enumlabel = 'trust_formation'
    ) THEN
      ALTER TYPE item_type_enum ADD VALUE 'trust_formation';
      RAISE NOTICE 'Added trust_formation to item_type_enum';
    ELSE
      RAISE NOTICE 'trust_formation already exists in item_type_enum';
    END IF;

    -- Add mail_forwarding if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum
      WHERE enumtypid = 'item_type_enum'::regtype
      AND enumlabel = 'mail_forwarding'
    ) THEN
      ALTER TYPE item_type_enum ADD VALUE 'mail_forwarding';
      RAISE NOTICE 'Added mail_forwarding to item_type_enum';
    ELSE
      RAISE NOTICE 'mail_forwarding already exists in item_type_enum';
    END IF;

    RAISE NOTICE 'Updated existing ENUM type: item_type_enum';
  ELSE
    RAISE NOTICE 'No ENUM type found. Checking for CHECK constraint...';
  END IF;
END $$;

-- If using CHECK constraint instead of ENUM, update it
DO $$
BEGIN
  -- Drop the existing check constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'order_items_item_type_check'
    AND table_name = 'order_items'
  ) THEN
    ALTER TABLE order_items DROP CONSTRAINT order_items_item_type_check;

    -- Add the new constraint with additional types
    ALTER TABLE order_items ADD CONSTRAINT order_items_item_type_check
      CHECK (item_type IN ('application', 'service', 'trust_formation', 'mail_forwarding'));

    RAISE NOTICE 'Updated CHECK constraint on order_items.item_type';
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN order_items.item_type IS 'Type of order item: application (company formation), service (additional service), trust_formation (trust formation service), mail_forwarding (mail forwarding service)';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show the enum values if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_type_enum') THEN
    RAISE NOTICE 'ENUM values for item_type_enum:';
    PERFORM enumlabel FROM pg_enum
    WHERE enumtypid = 'item_type_enum'::regtype
    ORDER BY enumsortorder;
  END IF;
END $$;

-- Show constraints
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%item_type%';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ Order Items Type Update Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Supported item types:';
  RAISE NOTICE '  - application';
  RAISE NOTICE '  - service';
  RAISE NOTICE '  - trust_formation';
  RAISE NOTICE '  - mail_forwarding';
  RAISE NOTICE '========================================';
END $$;
