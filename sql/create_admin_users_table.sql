CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('super_admin', 'admin', 'editor') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
);

-- Insert default super admin user (password: admin123!)
-- Note: In production, this should be changed immediately
INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@rapidcompanies.com', '$2b$12$JPFXk20I96L0Wq.h/4SKW.akO.t0Y5K0r/0yrwPV6Q9OZc8UwdUKe', 'System Administrator', 'super_admin')
ON DUPLICATE KEY UPDATE password_hash = '$2b$12$JPFXk20I96L0Wq.h/4SKW.akO.t0Y5K0r/0yrwPV6Q9OZc8UwdUKe';