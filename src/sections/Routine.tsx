import { Link } from 'react-router-dom'
import { Check, ArrowRight, Hourglass } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Eyebrow } from '@/components/Eyebrow'
import { cn } from '@/lib/utils'
import { scheduleTone } from '../lib/tone'
import { scheduleBlocks } from '../data'
import { useT } from '../i18n'

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scheduleBlocks.map((block, i) => {
          const ts = scheduleTone[block.tone]
          const tb = t.routine.blocks[i]
          return (
            <Card key={block.time} className="h-full">
              <CardContent className="flex h-full flex-col justify-between">
                <div>
                  <Eyebrow as="h3" size="sm" tone="inherit" className={cn('mb-2', ts.text)}>
                    {block.time}
                  </Eyebrow>
                  <p className="m-0 text-[15px] font-semibold text-foreground">{tb.title}</p>
                  <div className="mt-3 space-y-2">
                    {tb.items.map((item) => (
                      <div
                        key={item.strong}
                        className="flex gap-2 text-[13px] leading-relaxed text-muted-foreground"
                      >
                        <Check className={cn('mt-0.5 size-4 shrink-0', ts.icon)} aria-hidden />
                        <span>
                          <strong className="text-foreground">{item.strong}</strong> {item.text}
                          {/* How long the practice runs, on its own line under
                              the instruction — the block header gives the window
                              of the day, this gives the dose inside it. */}
                          <span className="mt-1 flex items-center gap-1.5 text-xs font-medium">
                            <Hourglass className={cn('size-3.5 shrink-0', ts.icon)} aria-hidden />
                            <span className="sr-only">{t.routine.durationLabel}: </span>
                            {item.dur}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* The block's focus is a full sentence, so it stays sentence
                    case — an uppercase eyebrow would be a wall of caps here,
                    and ~30% longer again in Greek. */}
                <div
                  className={cn(
                    'mt-4 rounded-xl p-4 text-xs font-semibold',
                    ts.soft,
                    ts.text,
                  )}
                >
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
