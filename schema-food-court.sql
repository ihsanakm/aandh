-- Create Food Stalls Table
CREATE TABLE IF NOT EXISTS public.food_stalls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT, -- URL to the image (can use Supabase Storage or external)
    cuisine TEXT, -- e.g., "Fast Food", "Juice Bar", "Healthy"
    price_range TEXT, -- e.g., "$", "$$", "$$$"
    is_active BOOLEAN DEFAULT true
);

-- Add some sample data
INSERT INTO public.food_stalls (name, description, cuisine, price_range, image_url) VALUES 
('Burger Barn', 'Juicy gourmet burgers and fries.', 'American', '$$', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop'),
('Smoothie Station', 'Fresh fruit smoothies and protein shakes.', 'Beverages', '$', 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?q=80&w=600&auto=format&fit=crop'),
('Taco Fiesta', 'Authentic street tacos and nachos.', 'Mexican', '$$', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=600&auto=format&fit=crop'),
('The Wok', 'Spicy noodles and stir-fry.', 'Asian', '$$', 'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=600&auto=format&fit=crop'),
('Pizza Point', 'Wood-fired oven pizzas.', 'Italian', '$$', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop'),
('The Coffee Bean', 'Artisan coffee and pastries.', 'Cafe', '$', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop'),
('Gelato Bliss', 'Handcrafted Italian ice cream.', 'Dessert', '$', 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?q=80&w=600&auto=format&fit=crop'),
('Spice Route', 'Traditional biryani and curries.', 'Indian', '$$', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=600&auto=format&fit=crop'),
('Sushi Roll', 'Fresh sushi and sashmi platters.', 'Japanese', '$$$', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop'),
('Kebab Corner', 'Grilled kebabs and shawarma.', 'Middle Eastern', '$$', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=600&auto=format&fit=crop');

-- Enable RLS
ALTER TABLE public.food_stalls ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view food stalls"
ON public.food_stalls FOR SELECT
USING (true);

CREATE POLICY "Admin can manage food stalls"
ON public.food_stalls FOR ALL
USING (true)
WITH CHECK (true);
