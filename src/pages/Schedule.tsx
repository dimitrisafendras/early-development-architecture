import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronUp, ChevronDown, Trash2, Plus, RotateCcw, Check } from 'lucide-react'
import { PageFrame } from '../components/PageFrame'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { dayActivityMeta, dayActivityOrder } from '../components/dayActivity'
import type { ScheduleSlot } from '../data'
import { useSchedule, buildDefaultSchedule } from '../lib/useSchedule'
import { useAppStore } from '../store'
import { useT } from '../i18n'

export default function Schedule() {
  const t = useT()
  const ts = t.schedule
  const setCustomSchedule = useAppStore((s) => s.setCustomSchedule)
  const initial = useSchedule()
  const [rows, setRows] = useState<ScheduleSlot[]>(initial)
  const [saved, setSaved] = useState(false)

  const dirty = () => setSaved(false)
  const patch = (i: number, p: Partial<ScheduleSlot>) => {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...p } : row)))
    dirty()
  }
  const move = (i: number, dir: -1 | 1) => {
    setRows((r) => {
      const j = i + dir
      if (j < 0 || j >= r.length) return r
      const next = [...r]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
    dirty()
  }
  const remove = (i: number) => {
    setRows((r) => r.filter((_, idx) => idx !== i))
    dirty()
  }
  const add = () => {
    setRows((r) => [...r, { time: '12:00', type: 'feed', title: '', detail: '' }])
    dirty()
  }
  const save = () => {
    setCustomSchedule(rows)
    setSaved(true)
  }
  const reset = () => {
    if (!window.confirm(ts.resetConfirm)) return
    setCustomSchedule(null)
    setRows(buildDefaultSchedule(t))
    setSaved(true)
  }

  return (
    <PageFrame
      title={ts.title}
      description={ts.subtitle}
      // Under the header, never above it: as the first child it pushed the title
      // ~44px lower than every other route's. Hidden from `xl`, where the SideNav
      // rail is always on screen and already offers the way back.
      toolbar={
        <Link
          to="/"
          className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/70 xl:hidden"
        >
          <ArrowLeft className="size-4" /> {ts.done}
        </Link>
      }
    >
      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">{ts.empty}</CardContent>
        </Card>
      ) : (
        <ol className="flex flex-col gap-3">
          {rows.map((row, i) => (
            <li key={i}>
              <SlotRow
                row={row}
                first={i === 0}
                last={i === rows.length - 1}
                onPatch={(p) => patch(i, p)}
                onMove={(dir) => move(i, dir)}
                onRemove={() => remove(i)}
              />
            </li>
          ))}
        </ol>
      )}

      <p className="text-xs text-muted-foreground">{ts.orderNote}</p>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <Button variant="secondary" onClick={add}>
          <Plus className="mr-2 size-4" /> {ts.addSlot}
        </Button>
        <Button onClick={save}>
          {saved ? <Check className="mr-2 size-4" /> : null}
          {saved ? ts.saved : ts.save}
        </Button>
        <Button
          variant="ghost"
          onClick={reset}
          className="ml-auto text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="mr-2 size-4" /> {ts.reset}
        </Button>
      </div>
    </PageFrame>
  )
}

function SlotRow({
  row,
  first,
  last,
  onPatch,
  onMove,
  onRemove,
}: {
  row: ScheduleSlot
  first: boolean
  last: boolean
  onPatch: (p: Partial<ScheduleSlot>) => void
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
}) {
  const t = useT()
  const ts = t.schedule
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`time-${row.time}`}>{ts.timeLabel}</Label>
            <Input
              type="time"
              value={row.time}
              onChange={(e) => onPatch({ time: e.target.value })}
              className="w-32 tabular-nums"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <Label>{ts.typeLabel}</Label>
            <div className="flex flex-wrap gap-1.5">
              {dayActivityOrder.map((type) => {
                const meta = dayActivityMeta[type]
                const Icon = meta.icon
                const active = row.type === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onPatch({ type })}
                    aria-pressed={active}
                    title={t.fullDay.types[type]}
                    className={cn(
                      'inline-flex size-9 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/70',
                      active ? meta.dot : 'bg-muted text-muted-foreground hover:bg-accent',
                      active && 'ring-2 ring-primary ring-offset-1 ring-offset-card',
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={ts.moveUp}
              disabled={first}
              onClick={() => onMove(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronUp className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={ts.moveDown}
              disabled={last}
              onClick={() => onMove(1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={ts.remove}
              onClick={onRemove}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`title-${row.time}`}>{ts.titleLabel}</Label>
          <Input
            id={`title-${row.time}`}
            value={row.title}
            placeholder={ts.titlePlaceholder}
            onChange={(e) => onPatch({ title: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`detail-${row.time}`}>{ts.detailLabel}</Label>
          <Input
            id={`detail-${row.time}`}
            value={row.detail}
            placeholder={ts.detailPlaceholder}
            onChange={(e) => onPatch({ detail: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  )
}
