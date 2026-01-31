-- GRANT SUPER ADMIN ACCESS
-- Replace 'YOUR_EMAIL@EXAMPLE.COM' with your actual Supabase login email

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'admin@admin.com' -- <--- CHANGE THIS EMAIL
ON CONFLICT (user_id) DO UPDATE
SET role = 'super_admin';

-- Verify the update
SELECT u.email, r.role 
FROM public.user_roles r
JOIN auth.users u ON r.user_id = u.id
WHERE u.email = 'admin@admin.com'; -- <--- CHANGE THIS EMAIL
