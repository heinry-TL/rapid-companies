-- Insert professional services into the database (Fixed version)
-- This version uses JSON() function to ensure proper JSON formatting

DELETE FROM professional_services;

INSERT INTO professional_services (
    id,
    name,
    description,
    short_description,
    features,
    category,
    icon_svg,
    display_order,
    active,
    created_at,
    updated_at
) VALUES
(
    'trusts',
    'Offshore Trust Formation',
    'Asset protection trusts and discretionary trusts for wealth preservation and estate planning.',
    'Asset protection trusts for wealth preservation and estate planning',
    JSON_ARRAY('Discretionary & Fixed Trusts', 'Asset Protection Structures', 'Charitable Foundations', 'Trust Administration'),
    'trusts',
    NULL,
    1,
    TRUE,
    NOW(),
    NOW()
),
(
    'nominees',
    'Nominee Director Services',
    'Professional nominee directors and shareholders for enhanced privacy and compliance.',
    'Professional nominee directors and shareholders for privacy',
    JSON_ARRAY('Corporate Nominee Directors', 'Nominee Shareholders', 'Privacy Protection', 'Regulatory Compliance'),
    'nominees',
    NULL,
    2,
    TRUE,
    NOW(),
    NOW()
),
(
    'virtual-office',
    'Virtual Office Solutions',
    'Professional business presence worldwide with virtual office services and support.',
    'Professional business presence with virtual office services',
    JSON_ARRAY('Prestigious Business Address', 'Mail Forwarding Service', 'Call Answering & Forwarding', 'Virtual Receptionist'),
    'office',
    NULL,
    3,
    TRUE,
    NOW(),
    NOW()
),
(
    'compliance',
    'Tax & Compliance Services',
    'Ongoing compliance support and tax optimization strategies for your offshore entities.',
    'Ongoing compliance support and tax optimization strategies',
    JSON_ARRAY('Annual Government Filings', 'Tax Planning & Optimization', 'Compliance Monitoring', 'Regulatory Updates'),
    'compliance',
    NULL,
    4,
    TRUE,
    NOW(),
    NOW()
),
(
    'licensing',
    'Financial Licensing',
    'Specialized licensing for financial services, investment management, and trading activities.',
    'Specialized licensing for financial services and trading',
    JSON_ARRAY('Investment Fund Licenses', 'Forex & Trading Licenses', 'Banking Licenses', 'Insurance Licenses'),
    'licensing',
    NULL,
    5,
    TRUE,
    NOW(),
    NOW()
),
(
    'immigration',
    'Residency & Immigration',
    'Investment-based residency and citizenship programs for international mobility.',
    'Investment-based residency and citizenship programs',
    JSON_ARRAY('Investment Residency Programs', 'Citizenship by Investment', 'EU Golden Visa Programs', 'Caribbean Passports'),
    'immigration',
    NULL,
    6,
    TRUE,
    NOW(),
    NOW()
);