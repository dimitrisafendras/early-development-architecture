import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { todayKey } from './lib/schedule'
import type { ScheduleSlot } from './data'

export type LatencyMode = 'optimal' | 'delayed' | 'none'
export type Palette = 'blue' | 'red'
export type Locale = 'en' | 'el'

interface AppState {
  dark: boolean
  toggleTheme: () => void
  palette: Palette
  setPalette: (palette: Palette) => void
  locale: Locale
  setLocale: (locale: Locale) => void
  latency: LatencyMode
  setLatency: (mode: LatencyMode) => void
  /** Checklist checked-item ids keyed by local day (YYYY-MM-DD). Kept as history
   *  so streaks can be computed and so the day rolls over cleanly at midnight. */
  checklistHistory: Record<string, string[]>
  toggleItem: (id: string) => void
  /** Replace today's checked set outright (used to merge a server pull). */
  setCheckedForToday: (ids: string[]) => void
  resetChecklist: () => void
  /** User's preferred hub card order (topic slugs). Empty = registry order. */
  cardOrder: string[]
  setCardOrder: (order: string[]) => void
  /** A user-customized day schedule. `null` = use the built-in localized one. */
  customSchedule: ScheduleSlot[] | null
  setCustomSchedule: (slots: ScheduleSlot[] | null) => void
  /** Desktop sidebar collapsed to an icon rail. Defaults to collapsed so the
   *  page gets the width; expanded state persists across sessions. */
  navCollapsed: boolean
  toggleNav: () => void
  /** Notification ids already opened/marked read. Ids are day-scoped, so the
   *  list is pruned to today on every write and the bell re-lights tomorrow. */
  notifSeen: string[]
  markNotificationsSeen: (ids: string[]) => void
  /** Ids the user swiped away — hidden for the rest of the day. */
  notifDismissed: string[]
  dismissNotification: (id: string) => void
  /** Opt-in to mirroring notifications as OS notifications. The browser
   *  permission is the other half; this only records the user's intent. */
  notifPush: boolean
  setNotifPush: (on: boolean) => void
}

/** Keep only ids belonging to `day` — notification ids carry their own day
 *  (`kind:YYYY-MM-DD:…`), so yesterday's read/dismissed state never piles up. */
function pruneToDay(ids: string[], day: string): string[] {
  return ids.filter((id) => id.split(':')[1] === day)
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Defaults: dark theme + "girl" (soft violet-pink) palette. Persisted user
      // choices in localStorage override these on load (see partialize below
      // and the pre-hydration bootstrap in index.html that prevents a flash).
      dark: true,
      toggleTheme: () => set((state) => ({ dark: !state.dark })),
      palette: 'red',
      setPalette: (palette) => set({ palette }),
      locale: 'en',
      setLocale: (locale) => set({ locale }),
      latency: 'optimal',
      setLatency: (latency) => set({ latency }),
      checklistHistory: {},
      toggleItem: (id) =>
        set((state) => {
          const day = todayKey()
          const current = state.checklistHistory[day] ?? []
          const next = current.includes(id)
            ? current.filter((i) => i !== id)
            : [...current, id]
          return { checklistHistory: { ...state.checklistHistory, [day]: next } }
        }),
      setCheckedForToday: (ids) =>
        set((state) => ({
          checklistHistory: { ...state.checklistHistory, [todayKey()]: ids },
        })),
      resetChecklist: () =>
        set((state) => ({
          checklistHistory: { ...state.checklistHistory, [todayKey()]: [] },
        })),
      cardOrder: [],
      setCardOrder: (cardOrder) => set({ cardOrder }),
      customSchedule: null,
      setCustomSchedule: (customSchedule) => set({ customSchedule }),
      navCollapsed: true,
      toggleNav: () => set((state) => ({ navCollapsed: !state.navCollapsed })),
      notifSeen: [],
      markNotificationsSeen: (ids) =>
        set((state) => {
          const day = todayKey()
          const next = new Set([...pruneToDay(state.notifSeen, day), ...ids])
          return { notifSeen: [...next] }
        }),
      notifDismissed: [],
      dismissNotification: (id) =>
        set((state) => {
          const day = todayKey()
          return { notifDismissed: [...new Set([...pruneToDay(state.notifDismissed, day), id])] }
        }),
      notifPush: false,
      setNotifPush: (notifPush) => set({ notifPush }),
    }),
    {
      name: 'eda-theme',
      // Theming + language choices, checklist history, and the hub card order
      // persist; the latency simulator stays ephemeral.
      partialize: (state) => ({
        dark: state.dark,
        palette: state.palette,
        locale: state.locale,
        checklistHistory: state.checklistHistory,
        cardOrder: state.cardOrder,
        customSchedule: state.customSchedule,
        navCollapsed: state.navCollapsed,
        notifSeen: state.notifSeen,
        notifDismissed: state.notifDismissed,
        notifPush: state.notifPush,
      }),
    },
  ),
)

/** Consecutive days (ending today or yesterday) with all `total` items checked. */
export function computeStreak(history: Record<string, string[]>, total: number): number {
  let streak = 0
  const cursor = new Date()
  // Allow the streak to "hang" from yesterday if today isn't complete yet.
  if ((history[todayKey(cursor)]?.length ?? 0) < total) {
    cursor.setDate(cursor.getDate() - 1)
  }
  for (;;) {
    const key = todayKey(cursor)
    if ((history[key]?.length ?? 0) >= total) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    } else break
  }
  return streak
}
