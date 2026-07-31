import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sun, Moon, Palette, SlidersHorizontal, Download } from 'lucide-react'
import { GlassToggleGroup } from '@/design-system/components'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '../store'
import { useInstall } from '../lib/useInstall'
import {
  pushPermission,
  pushSupported,
  requestPushPermission,
  showPushNotification,
} from '../lib/push'
import { useT } from '../i18n'

/**
 * Theme / palette / language switchers, the install prompt and the design-system
 * link, in a popover. Shared by every navigation surface (the top bar, its
 * collapsed dropdown, and the desktop sidebar) so the controls can't drift.
 */
export function SettingsMenu({
  triggerClassName,
  withLabel = false,
  align = 'end',
}: {
  triggerClassName: string
  withLabel?: boolean
  align?: 'start' | 'center' | 'end'
}) {
  const t = useT()
  const dark = useAppStore((s) => s.dark)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const palette = useAppStore((s) => s.palette)
  const setPalette = useAppStore((s) => s.setPalette)
  const locale = useAppStore((s) => s.locale)
  const setLocale = useAppStore((s) => s.setLocale)
  const { canInstall, installed, ios, promptInstall } = useInstall()
  const [iosHint, setIosHint] = useState(false)
  const showInstall = !installed && (canInstall || ios)
  const notifPush = useAppStore((s) => s.notifPush)
  const setNotifPush = useAppStore((s) => s.setNotifPush)
  const [pushDenied, setPushDenied] = useState(false)

  /**
   * Turning it on asks the browser first — the stored flag only records intent,
   * so setting it without permission would leave a toggle that says "On" and
   * silently delivers nothing. A one-off confirmation notification follows, so
   * the effect of the switch is visible immediately.
   */
  async function togglePush(on: boolean) {
    if (!on) {
      setNotifPush(false)
      setPushDenied(false)
      return
    }
    const permission =
      pushPermission() === 'granted' ? 'granted' : await requestPushPermission()
    if (permission !== 'granted') {
      setPushDenied(true)
      setNotifPush(false)
      return
    }
    setPushDenied(false)
    setNotifPush(true)
    void showPushNotification({
      tag: 'push-enabled',
      title: t.notifications.pushTestTitle,
      body: t.notifications.pushTestBody,
      path: '/',
    })
  }

  return (
    <Popover>
      <PopoverTrigger aria-label={t.nav.settings} title={t.nav.settings} className={triggerClassName}>
        <SlidersHorizontal className="size-4 shrink-0" aria-hidden />
        {withLabel && <span>{t.nav.settings}</span>}
      </PopoverTrigger>
      <PopoverContent align={align} className="w-60 space-y-4">
        <Field label={t.nav.theme}>
          <GlassToggleGroup
            ariaLabel={t.nav.theme}
            size="sm"
            value={dark ? 'dark' : 'light'}
            onChange={(v) => {
              if ((v === 'dark') !== dark) toggleTheme()
            }}
            options={[
              { value: 'light', label: <Sun className="size-3.5" />, ariaLabel: t.nav.lightTheme },
              { value: 'dark', label: <Moon className="size-3.5" />, ariaLabel: t.nav.darkTheme },
            ]}
          />
        </Field>
        <Field label={t.nav.palette}>
          <GlassToggleGroup
            ariaLabel={t.nav.palette}
            size="sm"
            value={palette}
            onChange={setPalette}
            options={[
              { value: 'blue', label: t.nav.boy },
              { value: 'red', label: t.nav.girl },
            ]}
          />
        </Field>
        <Field label={t.nav.language}>
          <GlassToggleGroup
            ariaLabel={t.nav.language}
            size="sm"
            value={locale}
            onChange={setLocale}
            options={[
              { value: 'en', label: 'EN' },
              { value: 'el', label: 'ΕΛ' },
            ]}
          />
        </Field>
        {pushSupported() && (
          <>
            <Separator />
            <Field label={t.notifications.push}>
              <GlassToggleGroup
                ariaLabel={t.notifications.push}
                size="sm"
                value={notifPush ? 'on' : 'off'}
                onChange={(v) => void togglePush(v === 'on')}
                options={[
                  { value: 'off', label: t.notifications.pushOff },
                  { value: 'on', label: t.notifications.pushOn },
                ]}
              />
            </Field>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {pushDenied ? t.notifications.pushDenied : t.notifications.pushHint}
            </p>
          </>
        )}
        {showInstall && (
          <>
            <Separator />
            <button
              type="button"
              onClick={() => {
                if (canInstall) void promptInstall()
                else setIosHint((v) => !v)
              }}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:min-h-0"
            >
              <Download className="size-4" aria-hidden />
              {t.install.title}
            </button>
            {iosHint && !canInstall && (
              <p className="text-xs leading-relaxed text-muted-foreground">{t.install.iosBody}</p>
            )}
          </>
        )}
        <Separator />
        <Link
          to="/design-system"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:min-h-0"
        >
          <Palette className="size-4" aria-hidden />
          {t.nav.designSystem}
        </Link>
      </PopoverContent>
    </Popover>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}
