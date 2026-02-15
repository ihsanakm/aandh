-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER ROLES (Auth)
-- ============================================

-- Safe Enum Creation
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('super_admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role_enum DEFAULT 'user' NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Safely Recreate Policies
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
CREATE POLICY "Admins can read all roles" ON public.user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'moderator')
        )
    );

DROP POLICY IF EXISTS "Super Admins can update roles" ON public.user_roles;
CREATE POLICY "Super Admins can update roles" ON public.user_roles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Functions & Triggers
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, email, role)
    VALUES (new.id, new.email, 'user')
    ON CONFLICT (user_id) DO NOTHING; -- Handle potential duplicates
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================
-- 2. BOOKINGS
-- ============================================

DO $$ BEGIN
    CREATE TYPE booking_status_enum AS ENUM ('confirmed', 'cancelled', 'completed', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('paid', 'unpaid', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM ('cash', 'card', 'bank_transfer', 'online');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    court_id TEXT NOT NULL DEFAULT 'court_1',
    user_name TEXT NOT NULL,
    user_mobile TEXT NOT NULL,
    price_lkr NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status booking_status_enum DEFAULT 'confirmed',
    payment_status payment_status_enum DEFAULT 'unpaid',
    payment_method payment_method_enum,
    notes TEXT,
    cancelled_reason TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Admins can do everything on bookings" ON public.bookings;
CREATE POLICY "Admins can do everything on bookings" ON public.bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'moderator')
        )
    );

DROP POLICY IF EXISTS "Public can view confirmed bookings (availability)" ON public.bookings;
CREATE POLICY "Public can view confirmed bookings (availability)" ON public.bookings
    FOR SELECT USING (status = 'confirmed');

DROP POLICY IF EXISTS "Public can insert bookings" ON public.bookings;
CREATE POLICY "Public can insert bookings" ON public.bookings
    FOR INSERT WITH CHECK (true); 

-- ============================================
-- 3. PRICING CONFIG
-- ============================================
CREATE TABLE IF NOT EXISTS public.pricing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    time_slot TEXT NOT NULL UNIQUE,
    price_lkr NUMERIC(10, 2) NOT NULL,
    is_prime_time BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pricing ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public can view pricing" ON public.pricing;
CREATE POLICY "Public can view pricing" ON public.pricing
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update pricing" ON public.pricing;
CREATE POLICY "Admins can update pricing" ON public.pricing
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'moderator')
        )
    );

-- Seed Pricing Data (IDEMPOTENT with ON CONFLICT)
INSERT INTO public.pricing (time_slot, price_lkr, is_prime_time) VALUES
('06:00', 1500, false), ('07:00', 1500, false), ('08:00', 1500, false),
('09:00', 1500, false), ('10:00', 1500, false), ('11:00', 1500, false),
('12:00', 1500, false), ('13:00', 1500, false), ('14:00', 1500, false),
('15:00', 1500, false), ('16:00', 2500, true),  ('17:00', 2500, true),
('18:00', 2500, true),  ('19:00', 2500, true),  ('20:00', 2500, true),
('21:00', 2500, true),  ('22:00', 2500, true),  ('23:00', 2500, true)
ON CONFLICT (time_slot) 
DO UPDATE SET price_lkr = EXCLUDED.price_lkr, is_prime_time = EXCLUDED.is_prime_time;


-- ============================================
-- 4. SLOT CLOSURES
-- ============================================
CREATE TABLE IF NOT EXISTS public.slot_closures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    time_slot TEXT, -- NULL means full day closure
    court_id TEXT DEFAULT 'court_1',
    reason TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.slot_closures ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public can view closures" ON public.slot_closures;
CREATE POLICY "Public can view closures" ON public.slot_closures
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage closures" ON public.slot_closures;
CREATE POLICY "Admins can manage closures" ON public.slot_closures
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'moderator')
        )
    );


-- ============================================
-- 5. FOOD STALLS
-- ============================================
CREATE TABLE IF NOT EXISTS public.food_stalls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    cuisine TEXT,
    price_range TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.food_stalls ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public can view food stalls" ON public.food_stalls;
CREATE POLICY "Public can view food stalls" ON public.food_stalls
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage food stalls" ON public.food_stalls;
CREATE POLICY "Admins can manage food stalls" ON public.food_stalls
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'moderator')
        )
    );

-- Seed Food Stalls (Basic Check to avoid pure duplicates if rerunning, though no unique constraint on name)
-- We'll just insert if table is empty for safety, or you can clear and re-insert.
-- For now, let's leave it as is, or use a check.
INSERT INTO public.food_stalls (name, description, cuisine, price_range, image_url)
SELECT 'Burger Barn', 'Juicy gourmet burgers and fries.', 'American', '$$', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM public.food_stalls WHERE name = 'Burger Barn');

INSERT INTO public.food_stalls (name, description, cuisine, price_range, image_url)
SELECT 'Smoothie Station', 'Fresh fruit smoothies and protein shakes.', 'Beverages', '$', 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?q=80&w=600&auto=format&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM public.food_stalls WHERE name = 'Smoothie Station');

INSERT INTO public.food_stalls (name, description, cuisine, price_range, image_url)
SELECT 'Taco Fiesta', 'Authentic street tacos and nachos.', 'Mexican', '$$', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=600&auto=format&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM public.food_stalls WHERE name = 'Taco Fiesta');

INSERT INTO public.food_stalls (name, description, cuisine, price_range, image_url)
SELECT 'The Wok', 'Spicy noodles and stir-fry.', 'Asian', '$$', 'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=600&auto=format&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM public.food_stalls WHERE name = 'The Wok');

INSERT INTO public.food_stalls (name, description, cuisine, price_range, image_url)
SELECT 'Pizza Point', 'Wood-fired oven pizzas.', 'Italian', '$$', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM public.food_stalls WHERE name = 'Pizza Point');


-- ============================================
-- 6. FUNCTIONS (RPC)
-- ============================================

-- Function to calculate total income dynamically
CREATE OR REPLACE FUNCTION get_total_income(start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL)
RETURNS NUMERIC AS $$
DECLARE
    total NUMERIC;
BEGIN
    SELECT COALESCE(SUM(price_lkr), 0)
    INTO total
    FROM bookings
    WHERE payment_status = 'paid'
    AND (start_date IS NULL OR date >= start_date)
    AND (end_date IS NULL OR date <= end_date);
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;
