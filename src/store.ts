import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  checkedItems: string[]
  toggleItem: (id: string) => void
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
      checkedItems: [],
      toggleItem: (id) =>
        set((state) => ({
          checkedItems: state.checkedItems.includes(id)
            ? state.checkedItems.filter((i) => i !== id)
            : [...state.checkedItems, id],
        })),
      resetChecklist: () => set({ checkedItems: [] }),
    }),
    {
      name: 'eda-theme',
      // Only theming + language choices are persisted; latency/checklist stay ephemeral.
      partialize: (state) => ({ dark: state.dark, palette: state.palette, locale: state.locale }),
    },
  ),
)
