import { useEffect, useState } from 'react'

/**
 * Shared PWA-install state. The `beforeinstallprompt` event fires once, early,
 * so it's captured at module load and cached — letting both the install banner
 * and the Settings "download app" button trigger the native prompt.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BeforeInstallPromptEvent | null = null
let installed = false
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as BeforeInstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    installed = true
    notify()
  })
}

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}
export function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function useInstall() {
  const [, force] = useState(0)
  useEffect(() => {
    const l = () => force((n) => n + 1)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])
  return {
    canInstall: deferred !== null,
    installed: installed || isStandalone(),
    ios: isIOS(),
    async promptInstall(): Promise<boolean> {
      if (!deferred) return false
      await deferred.prompt()
      await deferred.userChoice.catch(() => {})
      deferred = null
      notify()
      return true
    },
  }
}
