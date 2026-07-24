import { useEffect } from 'react'
import { Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SectionHeader } from '../components/SectionHeader'
import { checklistItems } from '../data'
import { useAppStore, computeStreak } from '../store'
import { todayKey } from '../lib/schedule'
import { isSupabaseEnabled } from '../lib/supabase'
import { useSession } from '../lib/use-session'
import { getChecklistForDay, upsertChecklistEntry } from '../lib/db'
import { useT } from '../i18n'

export function Summary() {
  const checklistHistory = useAppStore((s) => s.checklistHistory)
  const toggleItem = useAppStore((s) => s.toggleItem)
  const setCheckedForToday = useAppStore((s) => s.setCheckedForToday)
  const resetChecklist = useAppStore((s) => s.resetChecklist)
  const t = useT()
  const { session } = useSession()
  const signedIn = isSupabaseEnabled && Boolean(session)

  const day = todayKey()
  const checkedItems = checklistHistory[day] ?? []
  const streak = computeStreak(checklistHistory, checklistItems.length)

  // Pull today's entries from the server on sign-in (cross-device sync).
  useEffect(() => {
    if (!signedIn) return
    let cancelled = false
    getChecklistForDay(day)
      .then((ids) => {
        if (!cancelled && ids.length) setCheckedForToday(ids)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [signedIn, day, setCheckedForToday])

  function handleToggle(id: string) {
    const willCheck = !checkedItems.includes(id)
    toggleItem(id)
    if (signedIn) void upsertChecklistEntry(day, id, willCheck).catch(() => {})
  }

  function handleReset() {
    const previouslyChecked = checkedItems
    resetChecklist()
    if (signedIn) {
      for (const id of previouslyChecked) void upsertChecklistEntry(day, id, false).catch(() => {})
    }
  }

  return (
    <section id="summary">
      <SectionHeader module={7} title={t.summary.title} description={t.summary.description} />
      <Card>
        <CardContent>
          {(streak > 0 || checkedItems.length === checklistItems.length) && (
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {streak > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  <Flame className="size-4" /> {streak} {t.checklistUI.streak}
                </span>
              )}
              {checkedItems.length === checklistItems.length && (
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {t.checklistUI.allDone}
                </span>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {checklistItems.map((item, i) => {
              const checked = checkedItems.includes(item.id)
              return (
                <label
                  key={item.id}
                  className={cn(
                    'flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors',
                    checked
                      ? 'border-emerald-400 bg-emerald-500/10 dark:border-emerald-500/50'
                      : 'border-border bg-muted hover:bg-accent',
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => handleToggle(item.id)}
                    className="mt-0.5"
                  />
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
              {t.common.progress}:{' '}
              <span className="font-bold text-primary">{checkedItems.length}</span> /{' '}
              {checklistItems.length} {t.common.completed}
              {signedIn && <span className="ml-2">· {t.checklistUI.synced}</span>}
            </span>
            <Button variant="link" size="sm" onClick={handleReset} className="text-muted-foreground">
              {t.common.reset}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
