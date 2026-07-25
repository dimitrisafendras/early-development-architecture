import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronUp, ChevronDown, Trash2, Plus, RotateCcw, Check } from 'lucide-react'
import { PageFrame } from '../components/PageFrame'
import { EmptyState } from '../components/EmptyState'
import { ChoiceGroup } from '../components/ChoiceGroup'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
        <Button
          variant="ghost"
          size="sm"
          render={<Link to="/" />}
          className="w-fit text-muted-foreground xl:hidden"
        >
          <ArrowLeft /> {ts.done}
        </Button>
      }
    >
      {rows.length === 0 ? (
        <EmptyState>{ts.empty}</EmptyState>
      ) : (
        // `gap-4`: the one card-stack gap. This was the tightest stack in the app
        // at `gap-3`, against `gap-8` for the same stack on /family.
        <ol className="flex flex-col gap-4">
          {rows.map((row, i) => (
            <li key={i}>
              <SlotRow
                row={row}
                index={i}
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

      {/* Pulled up against the list it annotates — as a plain frame child it got
          the full block gap above *and* below and read as orphaned. */}
      <p className="-mt-3 text-xs text-muted-foreground sm:-mt-5">{ts.orderNote}</p>

      <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
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
  index,
  first,
  last,
  onPatch,
  onMove,
  onRemove,
}: {
  row: ScheduleSlot
  /** Stable id source for the row's labels — the time value is not one: it
   *  changes on every keystroke, so `htmlFor` pointed at a moving target. */
  index: number
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
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`slot-time-${index}`}>{ts.timeLabel}</Label>
            <Input
              id={`slot-time-${index}`}
              type="time"
              value={row.time}
              onChange={(e) => onPatch({ time: e.target.value })}
              className="w-32 tabular-nums"
            />
          </div>

          {/* `ChoiceGroup`, not eight hand-rolled buttons. Those were a
              non-responsive `size-9` (36px) sitting in an `items-end` row beside
              an `Input` at `h-11 sm:h-8` and three icon `Button`s at
              `size-11 sm:size-8` — so the row was 36/44/44 on a phone and
              36/32/32 from `sm`, misaligned at *both* breakpoints. It also
              re-implemented pressed state by hand instead of using the toggle
              group's own. */}
          {/* Full width on its own row below `sm`. Six 44px pills cannot share a
              390px row with a 128px time field and three icon buttons: they
              wrapped to two ragged rows and `items-end` then bottom-aligned the
              time field against the *second* row, so "Type" read above "Time". */}
          <div className="order-last w-full space-y-1.5 sm:order-none sm:w-auto sm:min-w-0 sm:flex-1">
            <Label id={`slot-type-${index}`}>{ts.typeLabel}</Label>
            <ChoiceGroup
              ariaLabel={ts.typeLabel}
              value={row.type}
              onChange={(type) => onPatch({ type })}
              options={dayActivityOrder.map((type) => {
                const Icon = dayActivityMeta[type].icon
                return {
                  value: type,
                  ariaLabel: t.fullDay.types[type],
                  label: <Icon className="size-4" />,
                }
              })}
            />
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
          <Label htmlFor={`slot-title-${index}`}>{ts.titleLabel}</Label>
          <Input
            id={`slot-title-${index}`}
            value={row.title}
            placeholder={ts.titlePlaceholder}
            onChange={(e) => onPatch({ title: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`slot-detail-${index}`}>{ts.detailLabel}</Label>
          <Input
            id={`slot-detail-${index}`}
            value={row.detail}
            placeholder={ts.detailPlaceholder}
            onChange={(e) => onPatch({ detail: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  )
}
