-- Orders table to track completed payments and order history
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(100) UNIQUE NOT NULL,
    stripe_payment_intent_id VARCHAR(100) UNIQUE,

    -- Customer information
    customer_email VARCHAR(100),
    customer_name VARCHAR(100),
    customer_phone VARCHAR(50),

    -- Order totals
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',

    -- Payment status
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),

    -- Order details
    applications_count INT DEFAULT 0,
    services_count INT DEFAULT 0,
    order_items JSON, -- Store detailed breakdown of applications and services

    -- Metadata from Stripe
    stripe_metadata JSON,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes for performance
    INDEX idx_order_id (order_id),
    INDEX idx_stripe_payment_intent (stripe_payment_intent_id),
    INDEX idx_customer_email (customer_email),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at)
);

-- Order items table for detailed breakdown
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(100) NOT NULL,

    -- Item details
    item_type ENUM('application', 'service') NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    jurisdiction_name VARCHAR(100), -- For applications

    -- Pricing
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',

    -- Additional data
    item_metadata JSON,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_item_type (item_type)
);

-- Insert some sample data for testing (optional)
-- INSERT INTO orders (
--     order_id,
--     stripe_payment_intent_id,
--     customer_email,
--     customer_name,
--     total_amount,
--     currency,
--     payment_status,
--     applications_count,
--     services_count,
--     order_items,
--     paid_at
-- ) VALUES (
--     'order_1234567890',
--     'pi_test_1234567890',
--     'john.doe@example.com',
--     'John Doe',
--     2500.00,
--     'GBP',
--     'paid',
--     1,
--     2,
--     '{"applications": [{"name": "BVI Company", "price": 1500}], "services": [{"name": "Registered Office", "price": 500}, {"name": "Banking Introduction", "price": 500}]}',
--     NOW()
-- );