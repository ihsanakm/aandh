import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase Environment Variables. Falling back to mock data mode implies mocked behavior outside of this client.')
    // We can't really "fallback" the client itself easily without erroring, so we normally check this before use in a real app.
    // For this MVP, we will allow it to be created but it might fail calls if not set.
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
)
