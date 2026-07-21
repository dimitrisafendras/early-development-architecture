import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Supabase client singleton. `null` when the env vars are absent — every
 * feature that syncs must degrade gracefully (local-only) in that case, so
 * the app keeps working in forks/preview builds without credentials.
 */
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null

export const isSupabaseEnabled = supabase !== null
