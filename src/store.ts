import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { todayKey } from './lib/schedule'

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
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Defaults: light theme + "girl" (soft rose) palette. Persisted user
      // choices in localStorage override these on load (see partialize below
      // and the pre-hydration bootstrap in index.html that prevents a flash).
      dark: false,
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
    }),
    {
      name: 'eda-theme',
      // Theming + language choices and the checklist history persist; the
      // latency simulator stays ephemeral.
      partialize: (state) => ({
        dark: state.dark,
        palette: state.palette,
        locale: state.locale,
        checklistHistory: state.checklistHistory,
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
