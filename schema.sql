-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Bookings Table
CREATE TABLE public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date DATE NOT NULL,
    time_slot TEXT NOT NULL, -- e.g. "18:00"
    court_id TEXT DEFAULT 'court_1',
    
    -- User Details (for guest bookings)
    user_name TEXT NOT NULL,
    user_mobile TEXT NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'pending')),
    
    -- Link to auth user (optional)
    user_id UUID REFERENCES auth.users(id)
);

-- Index for faster availability checks
CREATE INDEX idx_bookings_date_court ON public.bookings(date, court_id);

-- 2. Payments Table
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    booking_id UUID REFERENCES public.bookings(id) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    method TEXT, -- 'card', 'cash', 'upi'
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending'))
);

-- 3. Row Level Security (RLS) policies

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policy: Public can insert bookings (Guest checkout)
CREATE POLICY "Public can insert bookings" 
ON public.bookings FOR INSERT 
WITH CHECK (true);

-- Policy: Public can view their own booking if they have the ID (or we make it public for availability check)
-- For availability check, we might want a separate clear function or policy to only show 'booked' slots without user details.
-- For MVP: Allow public read of date/time/court_id to check availability.
CREATE POLICY "Public see booked slots"
ON public.bookings FOR SELECT
USING (true); 
-- Note: In production, select specific columns (date, time) to not leak user info.

-- Policy: Admin can do everything (needs Admin Role setup or service role key)
-- (Supabase Service Role bypasses RLS)

