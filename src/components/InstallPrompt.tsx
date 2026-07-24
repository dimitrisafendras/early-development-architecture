import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '../i18n'

const DISMISS_KEY = 'eda-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}
function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/**
 * "Add to phone" banner. On Android/Chrome it captures `beforeinstallprompt`
 * and triggers the native install; on iOS Safari (no such event) it shows the
 * Share → Add to Home Screen hint. Hidden when already installed or dismissed.
 */
export function InstallPrompt() {
  const t = useT()
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOS, setShowIOS] = useState(false)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')

  useEffect(() => {
    if (dismissed || isStandalone()) return
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    // iOS gives no event — offer the manual hint after a short delay.
    let timer: number | undefined
    if (isIOS()) timer = window.setTimeout(() => setShowIOS(true), 1500)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      if (timer) clearTimeout(timer)
    }
  }, [dismissed])

  if (dismissed || (!deferred && !showIOS)) return null

  function dismiss() {
    setDismissed(true)
    localStorage.setItem(DISMISS_KEY, '1')
  }

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice.catch(() => {})
    dismiss()
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-5">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-[0_16px_48px_rgb(0_0_0/0.28)]">
        <span className="inline-flex shrink-0 rounded-xl bg-primary/15 p-2.5 text-primary">
          {deferred ? <Download className="size-5" /> : <Share className="size-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{t.install.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {deferred ? t.install.body : t.install.iosBody}
          </p>
        </div>
        {deferred && (
          <Button size="sm" onClick={() => void install()}>
            {t.install.action}
          </Button>
        )}
        <button
          type="button"
          aria-label={t.install.dismiss}
          onClick={dismiss}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
