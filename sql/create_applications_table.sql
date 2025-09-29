-- Create applications table for storing form data
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(36) PRIMARY KEY,
    jurisdiction_id INT NOT NULL,
    jurisdiction_name VARCHAR(255) NOT NULL,
    jurisdiction_price DECIMAL(10, 2) NOT NULL,
    jurisdiction_currency CHAR(3) NOT NULL,

    -- Contact Details
    contact_first_name VARCHAR(255),
    contact_last_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_address_line1 VARCHAR(500),
    contact_address_line2 VARCHAR(500),
    contact_city VARCHAR(255),
    contact_county VARCHAR(255),
    contact_postcode VARCHAR(20),
    contact_country VARCHAR(100) DEFAULT 'United Kingdom',

    -- Company Details
    company_proposed_name VARCHAR(500),
    company_alternative_name VARCHAR(500),
    company_business_activity TEXT,
    company_authorized_capital DECIMAL(15, 2) DEFAULT 50000,
    company_number_of_shares INT DEFAULT 50000,

    -- Registered Address
    registered_address_line1 VARCHAR(500),
    registered_address_line2 VARCHAR(500),
    registered_city VARCHAR(255),
    registered_county VARCHAR(255),
    registered_postcode VARCHAR(20),
    registered_country VARCHAR(100) DEFAULT 'United Kingdom',
    use_contact_address BOOLEAN DEFAULT FALSE,

    -- Directors JSON data
    directors JSON,

    -- Shareholders JSON data
    shareholders JSON,

    -- Additional Services JSON data
    additional_services JSON,

    -- Form completion tracking
    step_completed INT DEFAULT 0,
    is_complete BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_jurisdiction_id (jurisdiction_id),
    INDEX idx_contact_email (contact_email),
    INDEX idx_step_completed (step_completed),
    INDEX idx_created_at (created_at)
);