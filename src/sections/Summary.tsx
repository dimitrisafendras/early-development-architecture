import { Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SectionHeader } from '../components/SectionHeader'
import { checklistItems } from '../data'
import { useDailyChecklist } from '../lib/useDailyChecklist'
import { useT } from '../i18n'

export function Summary() {
  const t = useT()
  const { checked, streak, total, allDone, signedIn, toggle, reset } = useDailyChecklist()

  return (
    <section id="summary">
      <SectionHeader module={7} title={t.summary.title} description={t.summary.description} />
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
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {t.checklistUI.allDone}
                </span>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {checklistItems.map((item, i) => {
              const isChecked = checked.includes(item.id)
              return (
                <label
                  key={item.id}
                  className={cn(
                    'flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors',
                    isChecked
                      ? 'border-emerald-400 bg-emerald-500/10 dark:border-emerald-500/50'
                      : 'border-border bg-muted hover:bg-accent',
                  )}
                >
                  <Checkbox checked={isChecked} onCheckedChange={() => toggle(item.id)} className="mt-0.5" />
                  <div>
                    <span className="mb-0.5 block font-semibold text-foreground">
                      {t.summary.items[i].title}
                    </span>
                    <span className="text-xs text-muted-foreground">{t.summary.items[i].desc}</span>
                  </div>
                </label>
              )
            })}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">
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
