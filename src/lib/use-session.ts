import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

/**
 * App-wide Supabase session as a module singleton. The auth listener is
 * attached once (not per component), and the resolved session is cached — so
 * navigating between routes reuses the known session instantly instead of
 * re-entering a loading state and flashing the UI.
 */
let cachedSession: Session | null = null
let hasResolved = false
let started = false
const listeners = new Set<() => void>()

function notify() {
  for (const l of listeners) l()
}

function ensureStarted() {
  if (started || !supabase) return
  started = true
  supabase.auth.getSession().then(({ data }) => {
    cachedSession = data.session
    hasResolved = true
    notify()
  })
  supabase.auth.onAuthStateChange((_event, next) => {
    cachedSession = next
    hasResolved = true
    notify()
  })
}

export function useSession() {
  ensureStarted()
  const [, force] = useState(0)
  useEffect(() => {
    const l = () => force((n) => n + 1)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])
  // `loading` is true only until the very first resolve, ever — not per mount.
  return { session: cachedSession, loading: Boolean(supabase) && !hasResolved }
}

/** Where OAuth/magic-link redirects land — the app root, base-path aware. */
export function authRedirectUrl() {
  return new URL(import.meta.env.BASE_URL, window.location.origin).href
}
