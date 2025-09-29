-- Convert all jurisdiction prices from USD to GBP
-- Using approximate conversion rate of 1 USD = 0.8 GBP

UPDATE jurisdictions SET
    formation_price = CASE
        WHEN name = 'Belize' THEN 239.00
        WHEN name = 'Hong Kong' THEN 479.00
        WHEN name = 'Dubai International Financial Centre' THEN 1039.00
        WHEN name = 'British Virgin Islands' THEN 319.00
        WHEN name = 'Cayman Islands' THEN 719.00
        WHEN name = 'Seychelles' THEN 159.00
        WHEN name = 'Panama' THEN 279.00
        WHEN name = 'Delaware' THEN 159.00
        WHEN name = 'Singapore' THEN 639.00
        ELSE ROUND(formation_price * 0.8, 2)
    END,
    currency = 'GBP'
WHERE currency = 'USD';

-- Verify the update
SELECT name, formation_price, currency FROM jurisdictions ORDER BY name;