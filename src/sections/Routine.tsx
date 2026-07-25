import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { scheduleBlocks, type ScheduleTone } from '../data'
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

export function Routine() {
  const t = useT()

  return (
    <section id="routine">
      {/* The live "what's now" view lives on the Day page (one source of
          truth); this page teaches the routine as a framework. */}
      <Link
        to="/"
        className="mb-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary hover:underline sm:min-h-0"
      >
        {t.routine.nowLink} <ArrowRight className="size-3.5" />
      </Link>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {scheduleBlocks.map((block, i) => {
          const ts = toneStyles[block.tone]
          const tb = t.routine.blocks[i]
          return (
            <Card key={block.time} className="h-full">
              <CardContent className="flex h-full flex-col justify-between">
                <div>
                  <div className="mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${ts.label}`}>
                      {block.time}
                    </span>
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
