-- Fix missing columns in bookings table
-- Run this in Supabase SQL Editor

-- 1. Add price_lkr column
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS price_lkr DECIMAL(10, 2) DEFAULT 0;

-- 2. Add other useful columns for admin that might be missing
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS cancelled_reason TEXT;

-- 3. Now re-create the function that depends on these columns
CREATE OR REPLACE FUNCTION public.get_booking_stats(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_bookings BIGINT,
    confirmed_bookings BIGINT,
    cancelled_bookings BIGINT,
    completed_bookings BIGINT,
    paid_bookings BIGINT,
    unpaid_bookings BIGINT,
    total_income DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
        COUNT(*) FILTER (WHERE payment_status = 'paid') as paid_bookings,
        COUNT(*) FILTER (WHERE payment_status = 'unpaid') as unpaid_bookings,
        COALESCE(SUM(price_lkr) FILTER (WHERE payment_status = 'paid'), 0) as total_income
    FROM public.bookings
    WHERE (start_date IS NULL OR date >= start_date)
    AND (end_date IS NULL OR date <= end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
