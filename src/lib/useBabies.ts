import { useCallback, useEffect, useState } from 'react'
import { isSupabaseEnabled } from './supabase'
import { useSession } from './use-session'
import { listBabies, createBaby as dbCreateBaby, type Baby } from './db'
import type { Palette } from '../store'

const CURRENT_BABY_KEY = 'eda-current-baby'

/**
 * Babies for the signed-in user, plus the currently-selected baby. Baby data
 * is inherently per-account, so it only loads when Supabase is configured and
 * a session exists; otherwise `babies` is empty and the UI shows a sign-in
 * nudge. The selected baby id is remembered in localStorage.
 */
export function useBabies() {
  const { session, loading: sessionLoading } = useSession()
  const [babies, setBabies] = useState<Baby[]>([])
  const [loading, setLoading] = useState(false)
  const [currentBabyId, setCurrentBabyIdState] = useState<string | null>(
    () => localStorage.getItem(CURRENT_BABY_KEY),
  )

  const refresh = useCallback(async () => {
    if (!isSupabaseEnabled || !session) {
      setBabies([])
      return
    }
    setLoading(true)
    try {
      setBabies(await listBabies())
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const setCurrentBabyId = useCallback((id: string | null) => {
    setCurrentBabyIdState(id)
    if (id) localStorage.setItem(CURRENT_BABY_KEY, id)
    else localStorage.removeItem(CURRENT_BABY_KEY)
  }, [])

  const createBaby = useCallback(
    async (input: { name: string; birth_date: string; palette: Palette }) => {
      const baby = await dbCreateBaby(input)
      await refresh()
      setCurrentBabyId(baby.id)
      return baby
    },
    [refresh, setCurrentBabyId],
  )

  // Keep the selection valid: fall back to the first baby when the stored id
  // is gone (e.g. deleted, or a different account signed in).
  const resolvedId =
    currentBabyId && babies.some((b) => b.id === currentBabyId)
      ? currentBabyId
      : (babies[0]?.id ?? null)
  const currentBaby = babies.find((b) => b.id === resolvedId) ?? null

  return {
    babies,
    currentBaby,
    currentBabyId: resolvedId,
    setCurrentBabyId,
    createBaby,
    refresh,
    loading: loading || sessionLoading,
    session,
    ready: isSupabaseEnabled && Boolean(session),
  }
}
