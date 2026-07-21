import { Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from '../components/SectionHeader'
import { scheduleBlocks } from '../data'

export function Routine() {
  return (
    <section id="routine">
      <SectionHeader
        module={5}
        title="📅 Daily Routine Architecture (Caregiver & Infant)"
        description="A predictable yet adaptable rhythm balancing direct engagement, physical tummy sessions, sensory regulation, and caregiver recovery."
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {scheduleBlocks.map((block) => (
          <Card
            key={block.time}
            className="h-full"
            style={
              block.dark
                ? { background: '#0f172a', boxShadow: 'inset 0 0 0 1px #1e293b' }
                : undefined
            }
          >
            <CardContent className="flex h-full flex-col justify-between">
              <div>
                <div
                  className="mb-2 text-xs font-bold uppercase tracking-wider"
                  style={{ color: block.color }}
                >
                  {block.time}
                </div>
                <p
                  className="m-0 text-lg font-semibold"
                  style={{ color: block.dark ? '#fff' : undefined }}
                >
                  {block.title}
                </p>
                <div className="mt-3 space-y-2">
                  {block.items.map((item) => (
                    <div
                      key={item.strong}
                      className="flex gap-2 text-[13px]"
                      style={{ color: block.dark ? '#cbd5e1' : undefined }}
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0"
                        style={{ color: block.dark ? '#818cf8' : '#10b981' }}
                        aria-hidden
                      />
                      <span className={block.dark ? '' : 'text-muted-foreground'}>
                        <strong className={block.dark ? 'text-slate-100' : 'text-foreground'}>
                          {item.strong}
                        </strong>{' '}
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="mt-4 rounded-lg p-2 text-[11px] font-semibold"
                style={{
                  color: block.color,
                  background: block.dark ? '#1e293b' : block.bg,
                }}
              >
                {block.focus}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
