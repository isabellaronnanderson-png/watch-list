import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseEnabled = Boolean(url && key)

// If env vars are missing, export a null client - callers check supabaseEnabled
// first and fall back to local-only storage, so the app still works without
// cloud sync configured (e.g. while developing, or if someone forks this repo
// without setting up Supabase).
export const supabase = supabaseEnabled ? createClient(url, key) : null
