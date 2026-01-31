-- Function to get booking statistics
-- Run this in your Supabase SQL Editor to fix the "function not found" error

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

-- Also re-creating get_total_income just in case it's needed elsewhere
CREATE OR REPLACE FUNCTION public.get_total_income(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS DECIMAL AS $$
DECLARE
    total DECIMAL;
BEGIN
    SELECT COALESCE(SUM(price_lkr), 0) INTO total
    FROM public.bookings
    WHERE status IN ('confirmed', 'completed')
    AND payment_status = 'paid'
    AND (start_date IS NULL OR date >= start_date)
    AND (end_date IS NULL OR date <= end_date);
    
    RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
