import * as React from 'react'

import { cn } from '@/lib/utils'

/** A documentation section with an anchor and a consistent heading block. */
export function DocSection({
  id,
  eyebrow,
  title,
  intro,
  children,
  className,
}: {
  id: string
  eyebrow: string
  title: string
  intro?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cn('mx-auto w-full max-w-6xl scroll-mt-28 px-5 py-16 sm:px-8 sm:py-20', className)}>
      <header className="mb-10 max-w-2xl">
        <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-primary uppercase">{eyebrow}</p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h2>
        {intro && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{intro}</p>}
      </header>
      {children}
    </section>
  )
}

/** A small labelled sub-group inside a section. */
export function DocBlock({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-12 last:mb-0', className)}>
      <div className="mb-4">
        <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}

/** Opaque content card — the correct surface for prose/data (never glass). */
export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.05),0_8px_24px_rgb(0_0_0/0.04)]',
        className
      )}
    >
      {children}
    </div>
  )
}

/** Do / Don't guidance pair. */
export function DoDont({ dos, donts }: { dos: string[]; donts: string[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          <span aria-hidden>✓</span> Do
        </p>
        <ul className="space-y-2 text-sm text-foreground/80">
          {dos.map((d) => (
            <li key={d} className="flex gap-2">
              <span aria-hidden className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
              {d}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
          <span aria-hidden>✕</span> Don't
        </p>
        <ul className="space-y-2 text-sm text-foreground/80">
          {donts.map((d) => (
            <li key={d} className="flex gap-2">
              <span aria-hidden className="mt-1 size-1.5 shrink-0 rounded-full bg-rose-500" />
              {d}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Reads a live CSS custom property value from :root for display. */
export function useCssVar(cssVar: string, deps: React.DependencyList = []) {
  const [value, setValue] = React.useState('')
  React.useEffect(() => {
    const read = () =>
      setValue(getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim())
    read()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return value
}
