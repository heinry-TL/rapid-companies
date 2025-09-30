-- =============================================================================
-- CHECK ORDER ITEMS - Run this to see if items are being created
-- =============================================================================

-- 1. Check if order_items table exists and has data
SELECT COUNT(*) as total_order_items FROM order_items;

-- 2. See all order items
SELECT
    id,
    order_id,
    item_type,
    item_name,
    jurisdiction_name,
    unit_price,
    total_price,
    currency,
    created_at
FROM order_items
ORDER BY created_at DESC
LIMIT 20;

-- 3. See orders and their item counts
SELECT
    o.order_id,
    o.customer_email,
    o.total_amount,
    o.payment_status,
    o.applications_count,
    o.services_count,
    COUNT(oi.id) as actual_items_count
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.order_id
GROUP BY o.order_id, o.customer_email, o.total_amount, o.payment_status, o.applications_count, o.services_count
ORDER BY o.created_at DESC
LIMIT 10;

-- 4. Find orders with missing items (should have items but don't)
SELECT
    o.order_id,
    o.customer_email,
    o.applications_count,
    o.services_count,
    COUNT(oi.id) as actual_items
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.order_id
WHERE (o.applications_count > 0 OR o.services_count > 0)
GROUP BY o.order_id, o.customer_email, o.applications_count, o.services_count
HAVING COUNT(oi.id) = 0
ORDER BY o.created_at DESC;