# Order Registration Fix - Summary

## Issues Identified

### 1. **Orders Not Registering in Database**
**Status**: ✅ FIXED (Partially - needs database migration)

**Root Cause**:
- The webhook handler in `app/api/webhooks/stripe/route.ts` was trying to update the `applications` table with fields that don't exist (`payment_status`, `order_id`)
- The applications table schema was missing critical fields needed for order tracking

**What Was Working**:
- Orders were being created in the `orders` table via the webhook
- Order items were being tracked in the `order_items` table
- Stripe webhooks were functioning correctly

**What Wasn't Working**:
- Applications couldn't be linked to orders (missing `order_id` field)
- Payment status couldn't be tracked on applications (missing `payment_status` field)
- No unique identifier for preventing duplicate applications

### 2. **Standalone Services Not Creating Applications**
**Status**: ✅ FIXED

**Root Cause**:
- When users purchased only additional services (without company formation), no application record was created
- The webhook only updated existing applications, but didn't create new ones for standalone services
- This meant standalone service orders appeared in orders table but not in applications/dashboard

## Changes Made

### 1. **Database Schema Updates**

#### Updated `supabase-complete-setup.sql`
Added missing fields to the `applications` table:
- `application_identifier VARCHAR(500) UNIQUE` - Prevents duplicate applications
- `payment_status payment_status_enum DEFAULT 'pending'` - Tracks payment status
- `order_id VARCHAR(255)` - Links applications to orders
- `step_completed INTEGER DEFAULT 1` - Tracks application progress
- `additional_services JSONB` - Stores additional services data
- Foreign key constraint linking to orders table

Added new indexes for performance:
- `idx_applications_payment_status`
- `idx_applications_order_id`
- `idx_applications_contact_email`

### 2. **Webhook Handler Updates**

#### Modified `app/api/webhooks/stripe/route.ts`
Added logic to create applications for standalone services:

```typescript
// Create applications for standalone services (services purchased without company formation)
if (standaloneServices && standaloneServices.length > 0) {
  for (const service of standaloneServices) {
    const serviceApplicationIdentifier = `service_${orderId}_${service.id || service.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const serviceApplication = {
      application_identifier: serviceApplicationIdentifier,
      jurisdiction_name: service.name,
      jurisdiction_price: service.price,
      jurisdiction_currency: service.currency || 'GBP',
      contact_email: customerEmail,
      company_proposed_name: `Standalone Service: ${service.name}`,
      company_business_activity: 'Additional Service Purchase',
      internal_status: 'paid',
      payment_status: 'paid',
      order_id: orderId,
      step_completed: 3,
      additional_services: { standalone_service: service },
    };

    await supabaseAdmin.from('applications').upsert([serviceApplication]);
  }
}
```

### 3. **Migration Script Created**

Created `supabase-migration-add-application-fields.sql` to update existing databases without data loss.

## Required Actions

### For New Deployments
1. Run the updated `supabase-complete-setup.sql` in Supabase SQL Editor
2. The schema will include all necessary fields

### For Existing Deployments
1. **CRITICAL**: Run `supabase-migration-add-application-fields.sql` in Supabase SQL Editor
2. This will add missing fields to existing applications table
3. Existing data will be preserved and updated with default values

## How It Works Now

### Company Formation Orders
1. User completes application form → Creates application record with `payment_status: 'pending'`
2. User proceeds to checkout → Payment intent created with application IDs in metadata
3. Payment succeeds → Webhook receives payment_intent.succeeded event
4. Webhook creates order in `orders` table
5. Webhook updates application with `payment_status: 'paid'` and links `order_id`
6. Application appears in dashboard as paid

### Standalone Service Orders
1. User adds services to cart (no company formation)
2. User proceeds to checkout → Payment intent created with standalone services in metadata
3. Payment succeeds → Webhook receives payment_intent.succeeded event
4. Webhook creates order in `orders` table
5. **NEW**: Webhook creates application records for each standalone service
6. Service orders now appear in dashboard as paid applications

## Testing Checklist

- [ ] Run migration script in Supabase
- [ ] Test company formation purchase
- [ ] Verify order appears in admin orders page
- [ ] Verify application appears in admin applications page
- [ ] Verify application shows correct payment status
- [ ] Test standalone service purchase (no company formation)
- [ ] Verify standalone service creates application record
- [ ] Verify standalone service order appears in dashboard
- [ ] Test combined purchase (company + services)
- [ ] Verify all items tracked correctly

## Files Modified

1. `supabase-complete-setup.sql` - Updated applications table schema
2. `app/api/webhooks/stripe/route.ts` - Added standalone service application creation
3. `supabase-migration-add-application-fields.sql` - NEW migration file
4. `ORDER-FIX-SUMMARY.md` - NEW documentation (this file)

## Database Configuration

Current setup uses Supabase (confirmed in `.env.local`):
```
DATABASE_TYPE=supabase
```

## Next Steps

1. **Immediate**: Run the migration script
2. **Testing**: Perform test transactions for both scenarios
3. **Monitoring**: Check Supabase logs and webhook logs
4. **Future Enhancement**: Consider adding email notifications for service-only purchases

## Benefits

✅ All orders now properly tracked in database
✅ Standalone services create application records
✅ Dashboard shows all purchases (company formations + services)
✅ Payment status properly linked between orders and applications
✅ No duplicate applications (unique identifier)
✅ Better data integrity with foreign key constraints
✅ Improved query performance with new indexes

## Notes

- The orders table was working correctly - issue was with applications table
- Webhook handler was functional but incomplete
- Database schema was the primary issue
- No changes needed to checkout flow or payment intent creation
- All fixes are backward compatible with existing code