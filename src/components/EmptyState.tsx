import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * The one "there is nothing here yet / you need to sign in" surface.
 *
 * **Why it exists.** Five routes each wrote their own version of the same card —
 * `<Card><CardContent className="py-10 text-center text-muted-foreground">` on
 * `/schedule` and `/family`, but a bare centred `<p>` with no card at all
 * elsewhere, and different vertical padding in each. An empty state is the first
 * thing a new user sees on a page, so it is the *worst* place for the app to
 * look like two different apps.
 *
 * Fixed: a real `Card` (so its radius and edge match every other surface on the
 * page), `py-10` of breathing room, centred 14px muted text, and an optional
 * icon above / action below.
 */
export function EmptyState({
  icon,
  children,
  action,
  className,
}: {
  /** Bare lucide icon — sized and tinted here. */
  icon?: ReactNode
  children: ReactNode
  /** A single `Button` or link, below the message. */
  action?: ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        {icon && (
          <span aria-hidden className="text-muted-foreground/60 [&_svg]:size-6">
            {icon}
          </span>
        )}
        <p className={cn('max-w-md text-sm text-muted-foreground')}>{children}</p>
        {action}
      </CardContent>
    </Card>
  )
}
