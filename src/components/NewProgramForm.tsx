import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import { Label } from '@/components/ui/label'
import { Eyebrow } from './Eyebrow'
import { ChoiceGroup } from './ChoiceGroup'
import { useFieldLabels } from '../lib/useFieldLabels'
import { formatAgeRange } from '../lib/schedule'
import type { AgeSchedule } from '../store'
import { useT } from '../i18n'

/** Where a new program's moments come from. */
export type ProgramSource = 'suggested' | 'copy' | 'empty'

/**
 * Making a new program: pick the age it starts at, and what it starts from.
 *
 * The first version did neither. It silently claimed whatever age the child
 * happened to be — bumping by a month if that was taken, which is an arbitrary
 * answer to a question it never asked — always seeded from the built-in day,
 * and then left you to find the "Starts at" stepper further down the page to
 * correct it. Two decisions were being made for you and one of them was
 * guessed.
 *
 * Both are now asked outright, with the age validated against the programs that
 * already exist, so "create" cannot produce a duplicate that the resolver would
 * then have to break a tie between.
 */
export function NewProgramForm({
  bands,
  currentBand,
  defaultFrom,
  onCreate,
  onCancel,
}: {
  bands: AgeSchedule[]
  /** The program open in the editor — the only sensible thing "copy" can mean. */
  currentBand: AgeSchedule | null
  defaultFrom: number
  onCreate: (fromMonths: number, source: ProgramSource) => void
  onCancel: () => void
}) {
  const t = useT()
  const ts = t.schedule
  const fields = useFieldLabels()
  const [fromMonths, setFromMonths] = useState(defaultFrom)
  const [source, setSource] = useState<ProgramSource>('suggested')

  const taken = bands.some((b) => b.fromMonths === fromMonths)
  const currentIndex = currentBand ? bands.findIndex((b) => b.id === currentBand.id) : -1
  const currentRange =
    currentBand && currentIndex >= 0
      ? formatAgeRange(
          currentBand.fromMonths,
          bands[currentIndex + 1]?.fromMonths ?? null,
          t.baby.monthsShort,
          t.baby.yearsShort,
        )
      : ''

  const options: { value: ProgramSource; label: string }[] = [
    { value: 'suggested', label: ts.programSourceSuggested },
    // Only offered when there is something to copy.
    ...(currentBand
      ? [
          {
            value: 'copy' as const,
            label: ts.programSourceCopy.replace('{range}', currentRange),
          },
        ]
      : []),
    { value: 'empty', label: ts.programSourceEmpty },
  ]

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-accent/30 p-4 ring-1 ring-primary/30">
      <Eyebrow as="span">{ts.programNewTitle}</Eyebrow>

      <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="new-program-from">{ts.programNewFrom}</Label>
          <NumberInput
            id="new-program-from"
            {...fields.stepper}
            size="md"
            value={fromMonths}
            floor={0}
            max={36}
            step={1}
            unit={t.baby.monthsShort}
            invalid={taken}
            onValueChange={(v) => setFromMonths(v ?? 0)}
            className="w-36"
          />
        </div>

        <div className="min-w-0 space-y-1.5">
          <Label>{ts.programNewSource}</Label>
          <ChoiceGroup
            ariaLabel={ts.programNewSource}
            size="md"
            value={source}
            onChange={setSource}
            options={options}
          />
        </div>
      </div>

      {/* Say what each choice will actually produce — "Suggested day" and
          "Empty" are not self-explanatory until after you have picked one. */}
      <p className="text-xs leading-relaxed text-muted-foreground">
        {taken
          ? ts.programTaken.replace('{n}', String(fromMonths))
          : ts.programSourceHint[source]}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="md" disabled={taken} onClick={() => onCreate(fromMonths, source)}>
          <Check className="mr-2 size-4" /> {ts.programCreate}
        </Button>
        <Button size="md" variant="ghost" onClick={onCancel} className="text-muted-foreground">
          <X className="mr-2 size-4" /> {t.common.cancel}
        </Button>
      </div>
    </div>
  )
}
