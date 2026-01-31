import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isMockMode = !supabaseUrl || !supabaseAnonKey;

if (isMockMode) {
    console.warn('Missing Supabase Environment Variables. Falling back to mock data mode. Network requests will be skipped.')
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
)
