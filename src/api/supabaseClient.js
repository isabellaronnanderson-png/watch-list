import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseEnabled = Boolean(url && key)

// Temporary diagnostic - safe to leave in, only logs presence/absence, never
// the actual values. Remove once cloud sync is confirmed working.
console.log('[Ultimate Media List] Supabase config check:', {
  urlPresent: Boolean(url),
  keyPresent: Boolean(key),
  supabaseEnabled,
})

// If env vars are missing, export a null client - callers check supabaseEnabled
// first and fall back to local-only storage, so the app still works without
// cloud sync configured (e.g. while developing, or if someone forks this repo
// without setting up Supabase).
export const supabase = supabaseEnabled ? createClient(url, key) : null
