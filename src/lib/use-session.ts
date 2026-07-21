import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

/**
 * Live Supabase session. `session` is null while signed out (or when the
 * Supabase env is absent entirely); `loading` covers the initial fetch so
 * the UI can avoid a signed-out flash on reload.
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(false)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return { session, loading }
}

/** Where OAuth/magic-link redirects land — the app root, base-path aware. */
export function authRedirectUrl() {
  return new URL(import.meta.env.BASE_URL, window.location.origin).href
}
