import { cn } from '@/lib/utils'

interface Props {
  /** Legacy module number — accepted for back-compat but no longer displayed. */
  module?: number
  title: string
  description: string
  /** Give the page's own content the room on a phone: smaller title, tighter
   *  spacing, and the description only from `sm` up. Full size from `sm` on. */
  compact?: boolean
}

export function SectionHeader({ title, description, compact = false }: Props) {
  return (
    <div className={cn('max-w-3xl', compact ? 'mb-3 sm:mb-8' : 'mb-8')}>
      <h2
        className={cn(
          'font-heading font-semibold tracking-tight text-foreground sm:text-4xl',
          compact ? 'text-2xl' : 'text-3xl',
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          'leading-relaxed text-muted-foreground',
          compact ? 'mt-2 hidden text-sm sm:mt-4 sm:block sm:text-base' : 'mt-4 text-base',
        )}
      >
        {description}
      </p>
    </div>
  )
}
