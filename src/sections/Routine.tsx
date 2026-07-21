import { Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from '../components/SectionHeader'
import { scheduleBlocks, type ScheduleTone } from '../data'

/** Soft, theme-aware per-block tints — distinct hues on the DS opaque card. */
const toneStyles: Record<ScheduleTone, { label: string; chip: string; check: string }> = {
  amber: {
    label: 'text-amber-600 dark:text-amber-400',
    chip: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    check: 'text-amber-500',
  },
  emerald: {
    label: 'text-emerald-600 dark:text-emerald-400',
    chip: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    check: 'text-emerald-500',
  },
  sky: {
    label: 'text-sky-600 dark:text-sky-400',
    chip: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    check: 'text-sky-500',
  },
  cyan: {
    label: 'text-cyan-600 dark:text-cyan-400',
    chip: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
    check: 'text-cyan-500',
  },
  fuchsia: {
    label: 'text-fuchsia-600 dark:text-fuchsia-400',
    chip: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300',
    check: 'text-fuchsia-500',
  },
  indigo: {
    label: 'text-indigo-600 dark:text-indigo-400',
    chip: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    check: 'text-indigo-500',
  },
}

export function Routine() {
  return (
    <section id="routine">
      <SectionHeader
        module={5}
        title="📅 Daily Routine Architecture (Caregiver & Infant)"
        description="A predictable yet adaptable rhythm balancing direct engagement, physical tummy sessions, sensory regulation, and caregiver recovery."
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {scheduleBlocks.map((block) => {
          const t = toneStyles[block.tone]
          return (
            <Card key={block.time} className="h-full">
              <CardContent className="flex h-full flex-col justify-between">
                <div>
                  <div className={`mb-2 text-xs font-bold uppercase tracking-wider ${t.label}`}>
                    {block.time}
                  </div>
                  <p className="m-0 text-lg font-semibold text-foreground">{block.title}</p>
                  <div className="mt-3 space-y-2">
                    {block.items.map((item) => (
                      <div key={item.strong} className="flex gap-2 text-[13px] text-muted-foreground">
                        <Check className={`mt-0.5 size-4 shrink-0 ${t.check}`} aria-hidden />
                        <span>
                          <strong className="text-foreground">{item.strong}</strong> {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`mt-4 rounded-lg p-2 text-[11px] font-semibold ${t.chip}`}>
                  {block.focus}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
