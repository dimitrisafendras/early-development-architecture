import { useAppStore } from '../store'

/**
 * Whether a folding section is open, and the toggle for it.
 *
 * The store holds only the sections a user has actually touched, so the default
 * is resolved here rather than seeded into the persisted map — a section can
 * ship open (or closed) and change its mind in a later release without a
 * migration, and without overriding anyone who has already made a choice.
 */
export function useSectionOpen(key: string, defaultOpen = true): [boolean, () => void] {
  const stored = useAppStore((s) => s.openSections[key])
  const setSectionOpen = useAppStore((s) => s.setSectionOpen)
  const open = stored ?? defaultOpen
  return [open, () => setSectionOpen(key, !open)]
}
