import { useEffect } from 'react'
import { checklistItemsForAge } from '../data'
import { useBabyAge } from '../components/AgeBadge'
import { useAppStore, computeStreak } from '../store'
import { todayKey } from './schedule'
import { isSupabaseEnabled } from './supabase'
import { useSession } from './use-session'
import { getChecklistForDay, upsertChecklistEntry } from './db'

/**
 * Today's caregiver checklist, shared by the Action-Items section and the
 * daily dashboard. Local-first via the zustand `checklistHistory` map; when
 * signed in it pulls the server's today-set on load and upserts on toggle.
 *
 * The item set is age-gated (`items`), so both the total and the streak follow
 * the child: tummy time drops off at a year and movement, family meals and
 * naming feelings take its place.
 */
export function useDailyChecklist() {
  const checklistHistory = useAppStore((s) => s.checklistHistory)
  const toggleItem = useAppStore((s) => s.toggleItem)
  const setCheckedForToday = useAppStore((s) => s.setCheckedForToday)
  const resetChecklist = useAppStore((s) => s.resetChecklist)
  const { session } = useSession()
  const signedIn = isSupabaseEnabled && Boolean(session)

  const baby = useBabyAge()
  const items = checklistItemsForAge(baby?.months ?? null)

  const day = todayKey()
  const checked = checklistHistory[day] ?? []
  const streak = computeStreak(checklistHistory, items.length)
  const total = items.length
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

  return { items, checked, streak, total, allDone, signedIn, toggle, reset }
}
