import { create } from 'zustand'

export type LatencyMode = 'optimal' | 'delayed' | 'none'

interface AppState {
  dark: boolean
  toggleTheme: () => void
  latency: LatencyMode
  setLatency: (mode: LatencyMode) => void
  checkedItems: string[]
  toggleItem: (id: string) => void
  resetChecklist: () => void
}

export const useAppStore = create<AppState>((set) => ({
  dark: true,
  toggleTheme: () => set((state) => ({ dark: !state.dark })),
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
}))
