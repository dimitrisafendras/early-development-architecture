import { useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInstall } from '../lib/useInstall'
import { useT } from '../i18n'

const DISMISS_KEY = 'eda-install-dismissed'

/**
 * "Add to phone" banner. On Android/Chrome it uses the captured
 * `beforeinstallprompt` (shared via useInstall); on iOS Safari it shows the
 * Share → Add to Home Screen hint. Hidden when already installed or dismissed.
 */
export function InstallPrompt() {
  const t = useT()
  const { canInstall, installed, ios, promptInstall } = useInstall()
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')

  const show = !dismissed && !installed && (canInstall || ios)
  if (!show) return null

  function dismiss() {
    setDismissed(true)
    localStorage.setItem(DISMISS_KEY, '1')
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-5">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-[0_16px_48px_rgb(0_0_0/0.28)]">
        <span className="inline-flex shrink-0 rounded-xl bg-primary/15 p-2.5 text-primary">
          {canInstall ? <Download className="size-5" /> : <Share className="size-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{t.install.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {canInstall ? t.install.body : t.install.iosBody}
          </p>
        </div>
        {canInstall && (
          <Button size="sm" onClick={() => void promptInstall().then(dismiss)}>
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
