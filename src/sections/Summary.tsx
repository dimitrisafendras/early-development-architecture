import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SectionHeader } from '../components/SectionHeader'
import { checklistItems } from '../data'
import { useAppStore } from '../store'

export function Summary() {
  const checkedItems = useAppStore((s) => s.checkedItems)
  const toggleItem = useAppStore((s) => s.toggleItem)
  const resetChecklist = useAppStore((s) => s.resetChecklist)

  return (
    <section id="summary">
      <SectionHeader
        module={7}
        title="💡 Summary of Key Action Items for Caregivers"
        description="Interactive master checklist to track your daily implementation of science-backed infant development practices."
      />
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {checklistItems.map((item) => {
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
                    onCheckedChange={() => toggleItem(item.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="mb-0.5 block font-semibold text-foreground">
                      {item.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                  </div>
                </label>
              )
            })}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">
              Progress:{' '}
              <span className="font-bold text-primary">{checkedItems.length}</span> /{' '}
              {checklistItems.length} Completed
            </span>
            <Button variant="link" size="sm" onClick={resetChecklist} className="text-muted-foreground">
              Reset Checklist
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
