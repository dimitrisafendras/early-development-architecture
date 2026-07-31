import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Download, Share, X } from 'lucide-react'
import { GlassSurface } from '@dimitrisafendras/liquid-glass'
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
 *
 * It is a floating control-layer surface — it hovers above the page content
 * plane rather than sitting in it — so it rides on the Liquid Glass material,
 * the same one the `BottomNav` capsule directly below it uses. The material
 * supplies its own edge stroke and elevation shadow, so the surface carries
 * neither a `border` nor a hand-rolled `shadow-*`.
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
    //
    // `pointer-events-none` on the positioner: its box extends down over the tab
    // bar (that's what the bottom padding is) and outranks it, so without this
    // the banner's empty padding swallows every tap on the bar underneath it.
    // The surface opts taps back in.
    // `z-45`: above the bottom tab bar (`z-40`) it sits on, below the nav rail
    // and any popover/dropdown (`z-50`) — an install nudge must never cover the
    // navigation the user just opened.
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-45 px-3 pb-[calc(var(--app-bottom-nav-h)+0.5rem+env(safe-area-inset-bottom))] sm:px-5 xl:pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      {/* 26px matches the `BottomNav` floating capsule, so the two stacked
          control-layer surfaces read as one system. Fixed at every breakpoint,
          so the inline-style `radius` prop is safe here (unlike in BottomNav,
          where a `sm:` utility has to win). */}
      <GlassSurface
        radius={26}
        role="region"
        aria-label={t.install.title}
        // The action sits *under* the copy rather than beside it: at 320px an
        // inline icon + text + button + dismiss row squeezes the body copy into
        // four wrapped lines.
        className="pointer-events-auto mx-auto max-w-md p-4"
        contentClassName="flex items-start gap-3"
      >
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
        {/* Kept as a bare button, matching the `GlassNav` hamburger and the
            `SideNav` collapse toggle: a control *on* glass needs a translucent
            hover wash, and shadcn's `ghost` variant washes with opaque
            `bg-muted`. Glass-on-glass (a `GlassButton`) is ruled out outright. */}
        <button
          type="button"
          aria-label={t.install.dismiss}
          onClick={dismiss}
          className="-m-2 grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/70 active:bg-foreground/10 sm:m-0 sm:size-8"
        >
          <X className="size-4" />
        </button>
      </GlassSurface>
    </div>
  )
}
