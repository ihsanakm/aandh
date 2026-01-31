-- Fix infinite recursion in user_roles policy
-- Run this in Supabase SQL Editor

-- 1. Drop the problematic recursive policy
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;

-- 2. Create a specific function to check admin status
-- SECURITY DEFINER means it runs with the permissions of the creator (you), bypassing RLS
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-create the policy using the secure function
-- This avoids the "table querying itself" loop
CREATE POLICY "Super admins can manage roles" ON public.user_roles
    FOR ALL USING (
        public.is_super_admin()
    );

-- 4. Just in case, ensure the helper function is accessible
GRANT EXECUTE ON FUNCTION public.is_super_admin TO authenticated;
