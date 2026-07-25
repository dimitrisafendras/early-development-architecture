import { Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { statusTone } from '../lib/tone'
import { checklistItems } from '../data'
import { useDailyChecklist } from '../lib/useDailyChecklist'
import { useT } from '../i18n'

export function Summary() {
  const t = useT()
  const { checked, streak, total, allDone, signedIn, toggle, reset } = useDailyChecklist()

  return (
    <section id="summary">
      <Card>
        <CardContent>
          {(streak > 0 || allDone) && (
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {streak > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  <Flame className="size-4" /> {streak} {t.checklistUI.streak}
                </span>
              )}
              {allDone && (
                <span className={cn('text-sm font-medium', statusTone.success.text)}>
                  {t.checklistUI.allDone}
                </span>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {checklistItems.map((item, i) => {
              const isChecked = checked.includes(item.id)
              return (
                <label
                  key={item.id}
                  className={cn(
                    'flex cursor-pointer gap-3 rounded-xl p-4 transition-colors',
                    // A ticked item is *selected*, not a success state — it takes the
                    // one selected-row treatment, so it reads the same as every
                    // other selection in the app.
                    isChecked
                      ? 'bg-primary/5 ring-1 ring-primary/30'
                      : 'bg-muted hover:bg-accent',
                  )}
                >
                  <Checkbox checked={isChecked} onCheckedChange={() => toggle(item.id)} className="mt-0.5" />
                  <div className="min-w-0">
                    <span className="mb-0.5 block text-[15px] font-semibold text-foreground">
                      {t.summary.items[i].title}
                    </span>
                    <span className="text-[13px] leading-relaxed text-muted-foreground">
                      {t.summary.items[i].desc}
                    </span>
                  </div>
                </label>
              )
            })}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
            <span className="min-w-0 text-xs text-muted-foreground">
              {t.common.progress}: <span className="font-bold text-primary">{checked.length}</span> /{' '}
              {total} {t.common.completed}
              {signedIn && <span className="ml-2">· {t.checklistUI.synced}</span>}
            </span>
            <Button variant="link" size="sm" onClick={reset} className="text-muted-foreground">
              {t.common.reset}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
