-- Create Slot Closures Table (if not exists)
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

-- Enable RLS
ALTER TABLE public.slot_closures ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view active closures (to check availability)
CREATE POLICY "Public can view active closures"
ON public.slot_closures FOR SELECT
USING (is_active = true);

-- Policy: Admin can do everything
CREATE POLICY "Admin can manage closures"
ON public.slot_closures FOR ALL
USING (public.is_super_admin());

-- Force schema reload
NOTIFY pgrst, 'reload schema';
