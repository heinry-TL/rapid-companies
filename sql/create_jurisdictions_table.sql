-- Create jurisdictions table for offshore formation services
CREATE TABLE IF NOT EXISTS jurisdictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country_code CHAR(2) NOT NULL,
    flag_url VARCHAR(500),
    description TEXT,
    formation_price DECIMAL(10, 2) NOT NULL,
    currency CHAR(3) DEFAULT 'GBP',
    processing_time VARCHAR(100),
    features JSON,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_country_code (country_code)
);

-- Insert sample jurisdiction data
INSERT INTO jurisdictions (name, country_code, flag_url, description, formation_price, currency, processing_time, features) VALUES
('Belize', 'BZ', 'https://flagcdn.com/w320/bz.png', 'Fast incorporation with excellent privacy protection and tax advantages. Ideal for international business operations.', 239.00, 'GBP', '1-2 business days', '["No minimum capital required", "100% foreign ownership allowed", "No annual filing requirements", "Bearer shares permitted", "Tax-free on foreign income"]'),

('Hong Kong', 'HK', 'https://flagcdn.com/w320/hk.png', 'Gateway to Asian markets with strong legal framework and excellent business reputation worldwide.', 479.00, 'GBP', '3-5 business days', '["Professional business reputation", "Access to Asian markets", "Strong legal system", "Banking facilities available", "No tax on foreign income"]'),

('Dubai International Financial Centre', 'AE', 'https://flagcdn.com/w320/ae.png', 'Premier financial hub in the Middle East with 100% foreign ownership and zero corporate tax on qualifying income.', 1039.00, 'GBP', '5-7 business days', '["100% foreign ownership", "Zero corporate tax", "World-class infrastructure", "Access to MENA markets", "English common law", "DIFC Courts"]'),

('British Virgin Islands', 'VG', 'https://flagcdn.com/w320/vg.png', 'Most popular offshore jurisdiction with maximum privacy protection and flexible corporate structure.', 319.00, 'GBP', '1-3 business days', '["Maximum privacy protection", "No minimum capital", "Flexible share structures", "Bearer shares available", "No annual returns required", "Tax-free on foreign income"]'),

('Cayman Islands', 'KY', 'https://flagcdn.com/w320/ky.png', 'Premier jurisdiction for investment funds and financial services with excellent regulatory framework.', 719.00, 'GBP', '3-5 business days', '["Preferred for investment funds", "Strong regulatory framework", "No corporate tax", "Confidentiality protection", "Access to global markets", "Experienced service providers"]'),

('Seychelles', 'SC', 'https://flagcdn.com/w320/sc.png', 'Cost-effective offshore solution with minimal ongoing compliance requirements and strong privacy laws.', 159.00, 'GBP', '1-2 business days', '["Very affordable", "Minimal compliance", "Strong privacy laws", "No minimum capital", "100% foreign ownership", "No exchange control"]'),

('Panama', 'PA', 'https://flagcdn.com/w320/pa.png', 'Excellent for asset protection and holding companies with territorial tax system and strong banking sector.', 279.00, 'GBP', '2-4 business days', '["Territorial tax system", "Asset protection friendly", "Strong banking sector", "Bearer shares permitted", "No minimum capital", "Flexible structures"]'),

('Delaware', 'US', 'https://flagcdn.com/w320/us.png', 'Premier US jurisdiction for corporations with sophisticated legal framework and business-friendly environment.', 159.00, 'GBP', '1-2 business days', '["Business-friendly laws", "Sophisticated legal system", "Court of Chancery", "Privacy protection", "No minimum capital", "Flexible structures"]'),

('Singapore', 'SG', 'https://flagcdn.com/w320/sg.png', 'Leading Asian financial hub with excellent reputation, strong legal system and access to regional markets.', 639.00, 'GBP', '3-7 business days', '["Excellent reputation", "Gateway to Asia", "Strong legal system", "Government incentives", "Skilled workforce", "Strategic location"]');