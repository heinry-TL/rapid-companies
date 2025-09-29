-- Insert additional services into the database
-- Run this script to populate the additional_services table

INSERT INTO additional_services (
    id,
    name,
    description,
    base_price,
    currency,
    note,
    active,
    category,
    created_at,
    updated_at
) VALUES
(
    'offshore-banking',
    'Offshore Bank Account Opening',
    'Multi-currency offshore bank accounts in premier banking jurisdictions',
    2000,
    'GBP',
    'Final price varies by jurisdiction and bank requirements',
    TRUE,
    'banking',
    NOW(),
    NOW()
),
(
    'nominee-director',
    'Nominee Director Service',
    'Professional nominee director for enhanced privacy and compliance',
    950,
    'GBP',
    'Annual service fee, varies by jurisdiction',
    TRUE,
    'nominees',
    NOW(),
    NOW()
),
(
    'nominee-shareholder',
    'Nominee Shareholder Service',
    'Nominee shareholder services for ultimate beneficial owner privacy',
    650,
    'GBP',
    'Annual service fee, varies by jurisdiction',
    TRUE,
    'nominees',
    NOW(),
    NOW()
),
(
    'virtual-office',
    'Virtual Office Package',
    'Professional business address, mail forwarding, and call answering',
    480,
    'GBP',
    'Annual fee, includes mail forwarding and phone answering',
    TRUE,
    'office',
    NOW(),
    NOW()
),
(
    'apostille-documents',
    'Document Apostille Service',
    'Apostille certification for international document recognition',
    120,
    'GBP',
    'Per document, processing time 5-10 business days',
    TRUE,
    'documentation',
    NOW(),
    NOW()
),
(
    'tax-planning',
    'Tax Planning Consultation',
    'Professional tax optimization strategies and compliance advice',
    400,
    'GBP',
    'Initial consultation, ongoing services quoted separately',
    TRUE,
    'consultation',
    NOW(),
    NOW()
),
(
    'trust-formation',
    'Offshore Trust Formation',
    'Asset protection trust setup with professional trustees',
    2800,
    'GBP',
    'Setup fee, annual trustee fees apply separately',
    TRUE,
    'trust',
    NOW(),
    NOW()
),
(
    'compliance-package',
    'Annual Compliance Package',
    'Complete annual filing and compliance management service',
    650,
    'GBP',
    'Annual service, includes government filings and registered agent',
    TRUE,
    'compliance',
    NOW(),
    NOW()
);