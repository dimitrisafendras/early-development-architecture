import { useEffect, useState } from 'react'
import { Check, Radio, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from '../components/SectionHeader'
import { scheduleBlocks, type ScheduleTone } from '../data'
import { activeBlockIndex, minutesUntilBlockStart } from '../lib/schedule'
import { useT } from '../i18n'

/** Soft, theme-aware per-block tints — distinct hues on the DS opaque card. */
const toneStyles: Record<ScheduleTone, { label: string; chip: string; check: string }> = {
  // Time labels are small text on the opaque card — light uses -700 to clear AA;
  // dark keeps -400 on the dark card. Chips already use accessible -700 text.
  amber: {
    label: 'text-amber-700 dark:text-amber-400',
    chip: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    check: 'text-amber-500',
  },
  emerald: {
    label: 'text-emerald-700 dark:text-emerald-400',
    chip: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    check: 'text-emerald-500',
  },
  sky: {
    label: 'text-sky-700 dark:text-sky-400',
    chip: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    check: 'text-sky-500',
  },
  cyan: {
    label: 'text-cyan-700 dark:text-cyan-400',
    chip: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
    check: 'text-cyan-500',
  },
  fuchsia: {
    label: 'text-fuchsia-700 dark:text-fuchsia-400',
    chip: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300',
    check: 'text-fuchsia-500',
  },
  indigo: {
    label: 'text-indigo-700 dark:text-indigo-400',
    chip: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    check: 'text-indigo-500',
  },
}

/** Format a minute count as "Xh Ym" / "Ym", localized units. */
function formatCountdown(mins: number, hourUnit: string, minUnit: string): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}${hourUnit} ${m}${minUnit}` : `${m}${minUnit}`
}

export function Routine() {
  const t = useT()
  const [now, setNow] = useState(() => new Date())

  // Live: re-evaluate the active block every 30s (cheap, no backend).
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  const activeIndex = activeBlockIndex(now)
  const nextIndex = (activeIndex + 1) % scheduleBlocks.length
  const untilNext = minutesUntilBlockStart(nextIndex, now)
  const tl = t.routineLive

  return (
    <section id="routine">
      <SectionHeader module={5} title={t.routine.title} description={t.routine.description} />

      {/* Live "what's now" banner */}
      <Card className="mb-6 border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                {tl.rightNow}
              </div>
              <div className="font-semibold text-foreground">{t.routine.blocks[activeIndex].title}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="uppercase tracking-wider">{tl.upNext}</span>
            <ArrowRight className="size-4" />
            <span className="font-medium text-foreground">{t.routine.blocks[nextIndex].title}</span>
            <span>
              {tl.in} {formatCountdown(untilNext, tl.hour, tl.minute)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {scheduleBlocks.map((block, i) => {
          const ts = toneStyles[block.tone]
          const tb = t.routine.blocks[i]
          const isActive = i === activeIndex
          return (
            <Card
              key={block.time}
              className={`h-full transition-shadow ${
                isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
              }`}
            >
              <CardContent className="flex h-full flex-col justify-between">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${ts.label}`}>
                      {block.time}
                    </span>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                        <Radio className="size-3" /> {tl.nowBadge}
                      </span>
                    )}
                  </div>
                  <p className="m-0 text-lg font-semibold text-foreground">{tb.title}</p>
                  <div className="mt-3 space-y-2">
                    {tb.items.map((item) => (
                      <div key={item.strong} className="flex gap-2 text-[13px] text-muted-foreground">
                        <Check className={`mt-0.5 size-4 shrink-0 ${ts.check}`} aria-hidden />
                        <span>
                          <strong className="text-foreground">{item.strong}</strong> {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`mt-4 rounded-lg p-2 text-[11px] font-semibold ${ts.chip}`}>
                  {tb.focus}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
