-- Activity logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id),
    INDEX idx_admin_user_id (admin_user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
);

-- Content management table
CREATE TABLE IF NOT EXISTS cms_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page VARCHAR(50) NOT NULL,
    section VARCHAR(50) NOT NULL,
    key_name VARCHAR(50) NOT NULL,
    content TEXT,
    content_type ENUM('text', 'html', 'json') DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_content (page, section, key_name),
    INDEX idx_page (page),
    INDEX idx_section (section)
);

-- Add admin tracking to jurisdictions (modify existing table)
-- Run these one by one, ignore errors if column already exists
ALTER TABLE jurisdictions ADD COLUMN last_modified_by INT;
ALTER TABLE jurisdictions ADD COLUMN last_modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE jurisdictions ADD CONSTRAINT fk_jurisdiction_modified_by FOREIGN KEY (last_modified_by) REFERENCES admin_users(id);

-- Add admin notes to applications (modify existing table)
-- Run these one by one, ignore errors if column already exists
ALTER TABLE applications ADD COLUMN admin_notes TEXT;
ALTER TABLE applications ADD COLUMN internal_status ENUM('new', 'in_progress', 'completed', 'on_hold') DEFAULT 'new';
ALTER TABLE applications ADD COLUMN assigned_to INT;
ALTER TABLE applications ADD CONSTRAINT fk_application_assigned_to FOREIGN KEY (assigned_to) REFERENCES admin_users(id);

-- Create additional services table if it doesn't exist
CREATE TABLE IF NOT EXISTS additional_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_modified_by INT,
    FOREIGN KEY (last_modified_by) REFERENCES admin_users(id),
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
);

-- Insert default additional services
INSERT INTO additional_services (name, description, price, currency, category) VALUES
('Registered Office Service', 'Professional registered office address for 1 year', 150.00, 'GBP', 'compliance'),
('Company Secretary Service', 'Professional company secretary services', 300.00, 'GBP', 'compliance'),
('Bank Account Opening Assistance', 'Help with opening corporate bank accounts', 500.00, 'GBP', 'banking'),
('Apostille Service', 'Document apostille and legalization', 200.00, 'GBP', 'documents'),
('Annual Return Filing', 'Annual return preparation and filing', 100.00, 'GBP', 'compliance')
ON DUPLICATE KEY UPDATE name = name;

-- Banking jurisdictions table
CREATE TABLE IF NOT EXISTS banking_jurisdictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);