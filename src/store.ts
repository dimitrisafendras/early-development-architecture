import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { todayKey } from './lib/schedule'
import type { ScheduleSlot } from './data'

export type LatencyMode = 'optimal' | 'delayed' | 'none'

/**
 * One user-authored day and the age it starts applying at.
 *
 * `fromMonths` is an inclusive lower bound; the band runs until the next
 * schedule's `fromMonths`, so the list is a partition of the timeline rather
 * than a set of ranges that could overlap or leave gaps. Keep it sorted —
 * `sortSchedules` is the one place that guarantees it.
 */
export interface AgeSchedule {
  id: string
  fromMonths: number
  slots: ScheduleSlot[]
}

/** Ascending by `fromMonths`, so resolution is a simple scan. */
export function sortSchedules(list: AgeSchedule[]): AgeSchedule[] {
  return [...list].sort((a, b) => a.fromMonths - b.fromMonths)
}

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
  /**
   * User-authored days, each bound to an age.
   *
   * A child's day changes shape several times before three, so one saved
   * schedule could never be right for long: the newborn day a parent tunes at
   * six weeks is actively wrong at eighteen months, and the app would keep
   * serving it. Each entry claims everything from `fromMonths` up to the next
   * entry's start, so the effective day follows the child without anyone
   * re-editing it (see `useSchedule`).
   *
   * Bands are arbitrary rather than the five built-in ones: families split the
   * day where their own child changed, not where the literature does.
   */
  customSchedules: AgeSchedule[]
  setCustomSchedules: (list: AgeSchedule[]) => void
  /** Desktop sidebar collapsed to an icon rail. Defaults to collapsed so the
   *  page gets the width; expanded state persists across sessions. */
  navCollapsed: boolean
  toggleNav: () => void
  /**
   * Which folding sections on /schedule are open, by key.
   *
   * Persisted because the folding exists to let a caregiver shape that page to
   * the job they keep coming back for — re-folding the preset palette on every
   * visit would make the feature cost more than it saves. Absent keys fall back
   * to the page's own default, so a new section can ship open without a
   * migration.
   *
   * The setter takes the new value rather than toggling: with a section that
   * defaults to *open*, its key is absent until first use, and a toggle reading
   * `!undefined` would resolve to `true` — clicking to close it would leave it
   * open. The caller already knows the resolved state, so it passes it.
   */
  openSections: Record<string, boolean>
  setSectionOpen: (key: string, open: boolean) => void
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
  /**
   * Coordinates for the header's weather reading, and whether the user actually
   * refused to give them.
   *
   * `weatherDenied` records a *decision*, not an attempt. The first version
   * recorded the attempt, which quietly conflated three different outcomes: a
   * real refusal, a prompt the user dismissed without answering, and a
   * timeout. Only the first is a decision — the other two leave the browser
   * permission sitting at `prompt`, meaning the user never chose, yet the app
   * had already resolved never to ask again. Weather was then unreachable
   * without clearing site data.
   *
   * Both persist: an allow is remembered too, so the reading is there on the
   * next visit with no prompt at all.
   */
  weatherCoords: { lat: number; lon: number } | null
  weatherDenied: boolean
  setWeatherCoords: (coords: { lat: number; lon: number }) => void
  denyWeather: () => void
  /**
   * Whether the user wants the header's weather reading at all.
   *
   * Deliberately a separate flag from `weatherDenied`, not a reuse of it. The
   * two record different actors: this one is a choice made in the app's own
   * settings, `weatherDenied` is what the *browser* was told. Folding them
   * together would make "I turned it off" indistinguishable from "the browser
   * refused" — and the settings panel has to tell them apart, because only one
   * of the two can be undone from inside this app.
   */
  weatherOn: boolean
  setWeatherOn: (on: boolean) => void
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
      customSchedules: [],
      setCustomSchedules: (list) => set({ customSchedules: sortSchedules(list) }),
      navCollapsed: true,
      toggleNav: () => set((state) => ({ navCollapsed: !state.navCollapsed })),
      openSections: {},
      setSectionOpen: (key, open) =>
        set((state) => ({ openSections: { ...state.openSections, [key]: open } })),
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
      weatherCoords: null,
      weatherDenied: false,
      setWeatherCoords: (weatherCoords) => set({ weatherCoords }),
      // Only ever called for PERMISSION_DENIED — see useWeather.
      denyWeather: () => set({ weatherDenied: true, weatherCoords: null }),
      weatherOn: true,
      // Switching it back on clears the recorded refusal as well: the user is
      // asking to be prompted again, and the browser permission may have been
      // allowed since. A `weatherDenied` left standing would swallow that
      // request, and the toggle would read "On" while showing nothing.
      setWeatherOn: (weatherOn) =>
        set(weatherOn ? { weatherOn, weatherDenied: false } : { weatherOn, weatherCoords: null }),
    }),
    {
      name: 'eda-theme',
      /**
       * v1 turned the single `customSchedule` into a list of age-banded ones.
       * A day saved before this existed was authored for whatever age the child
       * was then, which nothing recorded — so it becomes the band starting at
       * 0 months, which is the only reading that keeps it in effect rather than
       * silently discarding work.
       */
      version: 1,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Record<string, unknown>
        if (version === 0 && Array.isArray(state.customSchedule) && state.customSchedule.length) {
          state.customSchedules = [
            { id: 'migrated', fromMonths: 0, slots: state.customSchedule as ScheduleSlot[] },
          ]
        }
        delete state.customSchedule
        return state
      },
      // Theming + language choices, checklist history, and the hub card order
      // persist; the latency simulator stays ephemeral.
      partialize: (state) => ({
        dark: state.dark,
        palette: state.palette,
        locale: state.locale,
        checklistHistory: state.checklistHistory,
        cardOrder: state.cardOrder,
        customSchedules: state.customSchedules,
        navCollapsed: state.navCollapsed,
        openSections: state.openSections,
        notifSeen: state.notifSeen,
        notifDismissed: state.notifDismissed,
        notifPush: state.notifPush,
        weatherCoords: state.weatherCoords,
        // Renamed from `weatherAsked`, which self-migrates: the old key is no
        // longer read, so anyone the previous logic had wrongly locked out gets
        // asked once more.
        weatherDenied: state.weatherDenied,
        weatherOn: state.weatherOn,
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
