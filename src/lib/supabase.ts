import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * "Keep me signed in" flag. Stored in localStorage (not the auth store) so the
 * storage adapter below can read it on every token read/write to decide where
 * the session lives. Default is `true` — most people want to stay signed in.
 */
const REMEMBER_KEY = 'eda-auth-remember'

export function setRememberMe(remember: boolean) {
  try {
    localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0')
  } catch {
    /* storage unavailable (private mode) — fall through to the default */
  }
}

export function getRememberMe(): boolean {
  try {
    return localStorage.getItem(REMEMBER_KEY) !== '0'
  } catch {
    return true
  }
}

/**
 * Session storage that follows the "keep me signed in" choice:
 *  - remembering  → localStorage (survives closing the browser)
 *  - not          → sessionStorage (cleared when the tab/browser closes)
 *
 * The client is a singleton created once, so the choice can't be baked in at
 * construction time; this adapter re-reads the flag on every access and keeps
 * the token in exactly one of the two stores (writing one clears the other).
 * Reads fall back across both so a session started under either mode is still
 * found after the flag changes.
 */
const authStorage = {
  getItem: (k: string): string | null => {
    try {
      const primary = getRememberMe() ? localStorage : sessionStorage
      return primary.getItem(k) ?? localStorage.getItem(k) ?? sessionStorage.getItem(k)
    } catch {
      return null
    }
  },
  setItem: (k: string, v: string): void => {
    try {
      if (getRememberMe()) {
        localStorage.setItem(k, v)
        sessionStorage.removeItem(k)
      } else {
        sessionStorage.setItem(k, v)
        localStorage.removeItem(k)
      }
    } catch {
      /* storage unavailable — nothing to persist */
    }
  },
  removeItem: (k: string): void => {
    try {
      localStorage.removeItem(k)
      sessionStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  },
}

/**
 * Supabase client singleton. `null` when the env vars are absent — every
 * feature that syncs must degrade gracefully (local-only) in that case, so
 * the app keeps working in forks/preview builds without credentials.
 */
export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: authStorage,
        },
      })
    : null

export const isSupabaseEnabled = supabase !== null
