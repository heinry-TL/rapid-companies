-- Insert professional services into the database
-- Run this script to populate the professional_services table

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
    '["Discretionary & Fixed Trusts", "Asset Protection Structures", "Charitable Foundations", "Trust Administration"]',
    'trusts',
    '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>',
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
    '["Corporate Nominee Directors", "Nominee Shareholders", "Privacy Protection", "Regulatory Compliance"]',
    'nominees',
    '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>',
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
    '["Prestigious Business Address", "Mail Forwarding Service", "Call Answering & Forwarding", "Virtual Receptionist"]',
    'office',
    '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>',
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
    '["Annual Government Filings", "Tax Planning & Optimization", "Compliance Monitoring", "Regulatory Updates"]',
    'compliance',
    '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>',
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
    '["Investment Fund Licenses", "Forex & Trading Licenses", "Banking Licenses", "Insurance Licenses"]',
    'licensing',
    '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>',
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
    '["Investment Residency Programs", "Citizenship by Investment", "EU Golden Visa Programs", "Caribbean Passports"]',
    'immigration',
    '<svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
    6,
    TRUE,
    NOW(),
    NOW()
);