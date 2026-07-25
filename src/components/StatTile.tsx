import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * A compact metric tile: a gradient icon chip, a label, and a big value with an
 * optional unit. Shared across the tracker/feed dashboards so every stat reads
 * as one system. Lifts and glows a touch on hover.
 */
export function StatTile({
  icon,
  label,
  value,
  unit,
  className,
}: {
  icon: ReactNode
  label: string
  value: string
  unit?: string
  className?: string
}) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-border/70 bg-gradient-to-br from-card to-muted/30 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-16px] hover:shadow-primary/40',
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-primary/20 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
      />
      <CardContent className="relative py-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/25 to-primary/5 text-primary ring-1 ring-inset ring-primary/20">
            {icon}
          </span>
          <span className="truncate">{label}</span>
        </div>
        <div className="mt-2 truncate font-heading text-2xl font-semibold text-foreground">
          {value}
          {unit && <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
