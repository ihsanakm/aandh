-- Add updated_at column to bookings table
-- Run this in Supabase SQL Editor

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
