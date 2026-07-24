import { useEffect } from 'react'
import { checklistItems } from '../data'
import { useAppStore, computeStreak } from '../store'
import { todayKey } from './schedule'
import { isSupabaseEnabled } from './supabase'
import { useSession } from './use-session'
import { getChecklistForDay, upsertChecklistEntry } from './db'

/**
 * Today's caregiver checklist, shared by the Action-Items section and the
 * daily dashboard. Local-first via the zustand `checklistHistory` map; when
 * signed in it pulls the server's today-set on load and upserts on toggle.
 */
export function useDailyChecklist() {
  const checklistHistory = useAppStore((s) => s.checklistHistory)
  const toggleItem = useAppStore((s) => s.toggleItem)
  const setCheckedForToday = useAppStore((s) => s.setCheckedForToday)
  const resetChecklist = useAppStore((s) => s.resetChecklist)
  const { session } = useSession()
  const signedIn = isSupabaseEnabled && Boolean(session)

  const day = todayKey()
  const checked = checklistHistory[day] ?? []
  const streak = computeStreak(checklistHistory, checklistItems.length)
  const total = checklistItems.length
  const allDone = checked.length === total

  useEffect(() => {
    if (!signedIn) return
    let cancelled = false
    getChecklistForDay(day)
      .then((ids) => {
        if (!cancelled && ids.length) setCheckedForToday(ids)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [signedIn, day, setCheckedForToday])

  function toggle(id: string) {
    const willCheck = !checked.includes(id)
    toggleItem(id)
    if (signedIn) void upsertChecklistEntry(day, id, willCheck).catch(() => {})
  }

  function reset() {
    const prev = checked
    resetChecklist()
    if (signedIn) for (const id of prev) void upsertChecklistEntry(day, id, false).catch(() => {})
  }

  return { checked, streak, total, allDone, signedIn, toggle, reset }
}
