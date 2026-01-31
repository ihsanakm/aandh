-- Create PRICING Table
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

-- Create PAYMENTS Table
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

-- Create ACTIVITY LOG Table
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address TEXT
);

-- ============================================
-- RLS POLICIES (Admin Full Access)
-- ============================================

-- 1. Pricing
ALTER TABLE public.pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage pricing" ON public.pricing;
CREATE POLICY "Admin manage pricing" ON public.pricing FOR ALL USING (public.is_super_admin());
DROP POLICY IF EXISTS "Public view pricing" ON public.pricing;
CREATE POLICY "Public view pricing" ON public.pricing FOR SELECT USING (true);

-- 2. Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage payments" ON public.payments;
CREATE POLICY "Admin manage payments" ON public.payments FOR ALL USING (public.is_super_admin());

-- 3. Activity Log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin view logs" ON public.activity_log;
CREATE POLICY "Admin view logs" ON public.activity_log FOR SELECT USING (public.is_super_admin());

-- 4. Bookings (Ensure Admin Access)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage bookings" ON public.bookings;
CREATE POLICY "Admin manage bookings" ON public.bookings FOR ALL USING (public.is_super_admin());

-- Force reload
NOTIFY pgrst, 'reload schema';
