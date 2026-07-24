import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Download, Share, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInstall } from '../lib/useInstall'
import { useT } from '../i18n'

const DISMISS_KEY = 'eda-install-dismissed'

/**
 * Routes where the banner would sit on top of the work. On a short phone
 * (e.g. 320x568) it covers the auth form's own fields, and "install this app"
 * is the wrong thing to ask of someone halfway through signing in.
 */
const SUPPRESSED_ON = new Set(['/signin', '/signup'])

/**
 * "Add to phone" banner. On Android/Chrome it uses the captured
 * `beforeinstallprompt` (shared via useInstall); on iOS Safari it shows the
 * Share → Add to Home Screen hint. Hidden when already installed or dismissed.
 */
export function InstallPrompt() {
  const t = useT()
  const { pathname } = useLocation()
  const { canInstall, installed, ios, promptInstall } = useInstall()
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')

  const show = !dismissed && !installed && (canInstall || ios) && !SUPPRESSED_ON.has(pathname)
  if (!show) return null

  function dismiss() {
    setDismissed(true)
    localStorage.setItem(DISMISS_KEY, '1')
  }

  return (
    // Sits above the mobile bottom tab bar rather than on top of it; drops back
    // to the viewport edge from `xl`, where that bar is hidden.
    <div className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[calc(var(--app-bottom-nav-h)+0.5rem+env(safe-area-inset-bottom))] sm:px-5 xl:pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      {/* The action sits *under* the copy rather than beside it: at 320px an
          inline icon + text + button + dismiss row squeezes the body copy into
          four wrapped lines. */}
      <div className="mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-[0_16px_48px_rgb(0_0_0/0.28)]">
        <span className="inline-flex shrink-0 rounded-xl bg-primary/15 p-2.5 text-primary">
          {canInstall ? <Download className="size-5" /> : <Share className="size-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{t.install.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {canInstall ? t.install.body : t.install.iosBody}
          </p>
          {canInstall && (
            <Button size="sm" className="mt-2.5" onClick={() => void promptInstall().then(dismiss)}>
              {t.install.action}
            </Button>
          )}
        </div>
        <button
          type="button"
          aria-label={t.install.dismiss}
          onClick={dismiss}
          className="-m-2 grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground sm:m-0 sm:size-8"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
