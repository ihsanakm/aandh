-- Fix Admin Permissions for all tables
-- Run this in Supabase SQL Editor to enable Admin Management (Edit/Delete)

-- 1. Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin can manage bookings" ON public.bookings;
CREATE POLICY "Admin can manage bookings"
ON public.bookings FOR ALL
USING (public.is_super_admin());

-- 2. Pricing
ALTER TABLE IF EXISTS public.pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin can manage pricing" ON public.pricing;
CREATE POLICY "Admin can manage pricing"
ON public.pricing FOR ALL
USING (public.is_super_admin());

-- 3. Payments
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin can manage payments" ON public.payments;
CREATE POLICY "Admin can manage payments"
ON public.payments FOR ALL
USING (public.is_super_admin());

-- Force reload
NOTIFY pgrst, 'reload schema';
