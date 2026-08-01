import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { controlSize, type ControlSizeProp } from '@/components/ui/control-size'
import { dayActivityMeta, dayActivityOrder } from './dayActivity'
import type { DayActivity } from '../data'
import { useT } from '../i18n'

/**
 * What a moment *is*, as one control: the activity picker welded to its title.
 *
 * The schedule editor used to ask this twice — a row of seven unlabelled
 * coloured pills, then a separate free-text "Title" field underneath. Two
 * labelled controls for one idea, and the pills carried no words, so the only
 * way to know what the third pill meant was to press it and read what happened.
 *
 * Here the activity is the head of the field: its icon, in its own hue, opens a
 * labelled menu; the title runs on in the same box. One border, one focus ring,
 * one label. `Input` supplies `bare` for exactly this — the group draws the
 * chrome so the field inside it doesn't draw a second set.
 */
export function ActivityField({
  type,
  title,
  onTypeChange,
  onTitleChange,
  id,
  size = 'md',
  placeholder,
  className,
}: {
  type: DayActivity
  title: string
  onTypeChange: (type: DayActivity) => void
  onTitleChange: (title: string) => void
  id?: string
  size?: ControlSizeProp
  placeholder?: string
  className?: string
}) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const s = controlSize(size)
  const meta = dayActivityMeta[type]
  const Icon = meta.icon

  return (
    <div
      className={cn(
        // The shell owns the border and the focus ring. `focus-within` rather
        // than `focus-visible`: the ring belongs to the group whichever of its
        // two children the caret is actually in.
        'flex w-full min-w-0 items-stretch border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30',
        s.height,
        s.radius,
        className,
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          aria-label={t.schedule.typeLabel}
          title={t.fullDay.types[type]}
          className={cn(
            'flex shrink-0 items-center gap-1 border-r border-input px-2.5 outline-none transition-colors hover:bg-accent focus-visible:bg-accent',
            s.radius,
            // Square off the welded edge so the group reads as one field.
            'rounded-r-none',
          )}
        >
          <Icon className={cn('size-4', meta.text)} />
          <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-1.5">
          <ul className="flex flex-col">
            {dayActivityOrder.map((option) => {
              const optionMeta = dayActivityMeta[option]
              const OptionIcon = optionMeta.icon
              const active = option === type
              return (
                <li key={option}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      onTypeChange(option)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm transition-colors hover:bg-accent sm:min-h-9',
                      active && 'bg-accent font-medium',
                    )}
                  >
                    <OptionIcon className={cn('size-4 shrink-0', optionMeta.text)} />
                    {t.fullDay.types[option]}
                  </button>
                </li>
              )
            })}
          </ul>
        </PopoverContent>
      </Popover>

      <Input
        id={id}
        bare
        size={size}
        value={title}
        placeholder={placeholder}
        onChange={(e) => onTitleChange(e.target.value)}
      />
    </div>
  )
}
