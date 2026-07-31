import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, BellOff, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { GlassScrollArea } from '@dimitrisafendras/liquid-glass'
import { cn } from '@/lib/utils'
import { useNotificationCenter } from './NotificationsProvider'
import { useT } from '../i18n'

/**
 * The notification bell — an unread count on the trigger, and a popover listing
 * today's notifications. Every row is a link into the section it belongs to, so
 * the panel is a set of shortcuts rather than a log; opening one marks it read
 * and closes the panel.
 *
 * Rendered in both navigation surfaces (the desktop rail and the mobile bar);
 * the state behind it lives once in `NotificationsProvider`.
 */
export function NotificationBell({
  className,
  withLabel = false,
  align = 'end',
}: {
  /** The host nav's row/button shape — the bell adopts it like `SettingsMenu`. */
  className: string
  withLabel?: boolean
  align?: 'start' | 'center' | 'end'
}) {
  const t = useT()
  const n = t.notifications
  const [open, setOpen] = useState(false)
  const { items, unreadIds, unreadCount, markAllSeen, markSeen, dismiss } = useNotificationCenter()

  const label = unreadCount > 0 ? `${n.title} — ${n.unread.replace('{n}', String(unreadCount))}` : n.title

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger aria-label={label} title={label} className={cn('relative', className)}>
        <Bell className="size-4 shrink-0" aria-hidden />
        {withLabel && <span>{n.title}</span>}
        {unreadCount > 0 && (
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.625rem] leading-4 font-semibold text-primary-foreground',
              // Anchored to the icon in the icon-only rail, to the row's end
              // once a label is present.
              withLabel ? 'top-1 left-5' : 'top-0.5 right-0.5',
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align={align} className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between gap-3 px-3 py-2.5">
          <span className="text-sm font-semibold">{n.title}</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllSeen}
              className="rounded-md text-xs font-medium text-primary transition-colors outline-none hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-ring/70"
            >
              {n.markAllRead}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 border-t border-border px-4 py-8 text-center">
            <BellOff className="size-5 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium">{n.empty}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{n.emptyHint}</p>
          </div>
        ) : (
          <GlassScrollArea maxHeight="min(24rem, 60vh)" className="border-t border-border">
            <ul className="flex flex-col p-1.5">
              {items.map((item) => {
                const unread = unreadIds.includes(item.id)
                return (
                <li key={item.id} className="group/notif relative">
                  <Link
                    to={item.to}
                    onClick={() => {
                      markSeen(item.id)
                      setOpen(false)
                    }}
                    className="flex items-start gap-2.5 rounded-xl p-2.5 pr-9 transition-colors outline-none hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-ring/70 active:bg-foreground/10"
                  >
                    <span
                      className={cn(
                        'mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg',
                        item.urgent ? 'bg-primary/15 text-primary' : 'bg-foreground/5 text-foreground/60',
                      )}
                    >
                      <item.Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block text-sm leading-snug',
                          unread ? 'font-semibold' : 'font-medium text-foreground/80',
                        )}
                      >
                        {item.title}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
                        {item.body}
                      </span>
                    </span>
                    {unread && (
                      <span
                        aria-hidden
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                      />
                    )}
                  </Link>
                  {/* Dismiss sits outside the link so it can't be triggered by
                      following the notification. */}
                  <button
                    type="button"
                    aria-label={n.dismiss}
                    title={n.dismiss}
                    onClick={() => dismiss(item.id)}
                    className="absolute top-2.5 right-2 grid size-6 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity outline-none group-hover/notif:opacity-100 hover:bg-foreground/10 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/70 max-sm:opacity-100"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </li>
                )
              })}
            </ul>
          </GlassScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}
