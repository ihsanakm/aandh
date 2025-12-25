-- Enhanced Schema for Admin Panel
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER ROLES & PROFILES
-- ============================================

-- User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('super_admin', 'moderator', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- ============================================
-- 2. PRICING CONFIGURATION
-- ============================================

-- Pricing Table (allows dynamic pricing changes)
CREATE TABLE IF NOT EXISTS public.pricing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    time_slot TEXT NOT NULL UNIQUE, -- e.g., "18:00"
    price_lkr DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_prime_time BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Default pricing for all 24 hourly slots
INSERT INTO public.pricing (time_slot, price_lkr, is_prime_time) VALUES
    ('00:00', 5000, false), ('01:00', 5000, false), ('02:00', 5000, false),
    ('03:00', 5000, false), ('04:00', 5000, false), ('05:00', 5000, false),
    ('06:00', 5000, false), ('07:00', 5000, false), ('08:00', 5000, false),
    ('09:00', 5000, false), ('10:00', 5000, false), ('11:00', 5000, false),
    ('12:00', 5000, false), ('13:00', 5000, false), ('14:00', 5000, false),
    ('15:00', 5000, false), ('16:00', 5000, false), ('17:00', 5000, false),
    ('18:00', 6000, true), ('19:00', 6000, true), ('20:00', 6000, true),
    ('21:00', 6000, true), ('22:00', 6000, true), ('23:00', 6000, true)
ON CONFLICT (time_slot) DO NOTHING;

-- ============================================
-- 3. BOOKINGS TABLE (Enhanced)
-- ============================================

-- Drop existing table if you want to recreate (CAREFUL - this deletes data!)
-- DROP TABLE IF EXISTS public.bookings CASCADE;

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Booking Details
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    court_id TEXT DEFAULT 'court_1',
    
    -- Customer Details
    user_name TEXT NOT NULL,
    user_mobile TEXT NOT NULL,
    
    -- Pricing
    price_lkr DECIMAL(10, 2) DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'pending')),
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'online')),
    
    -- Admin Notes
    notes TEXT,
    cancelled_reason TEXT,
    
    -- Tracking
    user_id UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_date_court ON public.bookings(date, court_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);

-- ============================================
-- 4. SLOT CLOSURES (Block specific slots/days)
-- ============================================

CREATE TABLE IF NOT EXISTS public.slot_closures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    time_slot TEXT, -- NULL means entire day is closed
    court_id TEXT DEFAULT 'court_1',
    reason TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Index for faster closure checks
CREATE INDEX IF NOT EXISTS idx_slot_closures_date ON public.slot_closures(date, is_active);

-- ============================================
-- 5. PAYMENTS TABLE (Enhanced)
-- ============================================

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    amount_lkr DECIMAL(10, 2) NOT NULL,
    method TEXT CHECK (method IN ('cash', 'card', 'bank_transfer', 'online')),
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending', 'refunded')),
    transaction_id TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- ============================================
-- 6. ACTIVITY LOG (Audit Trail)
-- ============================================

CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- 'create_booking', 'cancel_booking', 'update_price', etc.
    entity_type TEXT NOT NULL, -- 'booking', 'pricing', 'user_role', etc.
    entity_id UUID,
    details JSONB,
    ip_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at);

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Bookings Policies
CREATE POLICY "Public can insert bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view bookings" ON public.bookings
    FOR SELECT USING (true);

CREATE POLICY "Admins can update bookings" ON public.bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('super_admin', 'moderator')
        )
    );

CREATE POLICY "Admins can delete bookings" ON public.bookings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'super_admin'
        )
    );

-- Pricing Policies
CREATE POLICY "Public can view pricing" ON public.pricing
    FOR SELECT USING (true);

CREATE POLICY "Admins can update pricing" ON public.pricing
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('super_admin', 'moderator')
        )
    );

-- User Roles Policies
CREATE POLICY "Users can view their own role" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'super_admin'
        )
    );

-- Slot Closures Policies
CREATE POLICY "Public can view active closures" ON public.slot_closures
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage closures" ON public.slot_closures
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('super_admin', 'moderator')
        )
    );

-- Payments Policies
CREATE POLICY "Admins can view payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('super_admin', 'moderator')
        )
    );

CREATE POLICY "Admins can manage payments" ON public.payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('super_admin', 'moderator')
        )
    );

-- Activity Log Policies
CREATE POLICY "Admins can view activity log" ON public.activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('super_admin', 'moderator')
        )
    );

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = required_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get total income
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

-- Function to get booking statistics
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

-- ============================================
-- 9. TRIGGERS
-- ============================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to tables
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pricing_updated_at ON public.pricing;
CREATE TRIGGER update_pricing_updated_at
    BEFORE UPDATE ON public.pricing
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Create your first super admin user in Supabase Auth
-- 2. Add their user_id to user_roles table with role 'super_admin'
-- 3. Use the admin panel to manage everything else
