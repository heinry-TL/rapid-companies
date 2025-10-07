-- Orders and Order Items tables for Supabase (PostgreSQL)
-- Run this in your Supabase SQL Editor

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(100) UNIQUE NOT NULL,
    stripe_payment_intent_id VARCHAR(100) UNIQUE,

    -- Customer information
    customer_email VARCHAR(100),
    customer_name VARCHAR(100),
    customer_phone VARCHAR(50),

    -- Billing address
    billing_name VARCHAR(255),
    billing_address_line1 VARCHAR(500),
    billing_address_line2 VARCHAR(500),
    billing_city VARCHAR(255),
    billing_state VARCHAR(255),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(100),

    -- Order totals
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',

    -- Payment status
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(50),

    -- Order details
    applications_count INT DEFAULT 0,
    services_count INT DEFAULT 0,
    order_items JSONB, -- Store detailed breakdown of applications and services

    -- Metadata from Stripe
    stripe_metadata JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(100) NOT NULL,

    -- Item details
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('application', 'service')),
    item_name VARCHAR(100) NOT NULL,
    jurisdiction_name VARCHAR(100), -- For applications

    -- Pricing
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',

    -- Additional data
    item_metadata JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Foreign key relationship
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Create indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_type ON order_items(item_type);

-- Add comments
COMMENT ON TABLE orders IS 'Stores completed orders with payment information';
COMMENT ON TABLE order_items IS 'Stores individual line items for each order';
COMMENT ON COLUMN orders.order_items IS 'Legacy JSON field for backward compatibility - actual items are in order_items table';
COMMENT ON COLUMN orders.stripe_metadata IS 'Metadata from Stripe payment intent';
COMMENT ON COLUMN order_items.item_metadata IS 'Additional metadata about the item (application or service details)';

-- Enable Row Level Security (RLS) - adjust policies as needed
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (adjust service role key check as needed)
-- These policies allow full access for service role (used by your API)
CREATE POLICY "Enable all operations for service role on orders" ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for service role on order_items" ON order_items
  FOR ALL
  USING (true)
  WITH CHECK (true);
