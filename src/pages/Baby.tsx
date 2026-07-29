import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Baby as BabyIcon, Trash2, Ruler, Weight, Pencil } from 'lucide-react'
import { ChoiceGroup } from '../components/ChoiceGroup'
import { EmptyState } from '../components/EmptyState'
import { StatTile } from '../components/StatTile'
import { WidgetPage, WidgetCard, WidgetStatGrid, WidgetSplit } from '../components/WidgetPage'
import { GlassScrollArea } from '@/design-system/components'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { NumberInput } from '@/components/ui/number-input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { GrowthChart } from '../components/charts'
import { useBabies } from '../lib/useBabies'
import { useHousehold } from '../lib/household'
import { useFieldLabels } from '../lib/useFieldLabels'
import { formatDateKey, useDateLocale } from '../lib/dates'
import { ageInMonths, todayKey } from '../lib/schedule'
import {
  listMeasurements,
  addMeasurement,
  deleteMeasurement,
  type Measurement,
  type Baby as BabyRecord,
} from '../lib/db'
import type { Palette } from '../store'
import { useT } from '../i18n'

export default function Baby() {
  const t = useT()
  const {
    babies,
    currentBaby,
    currentBabyId,
    setCurrentBabyId,
    createBaby,
    updateBaby,
    deleteBaby,
    ready,
    loading,
  } = useBabies()
  const { household } = useHousehold()

  // New babies join the family automatically when the user is in one.
  const onCreate = (input: { name: string; birth_date: string; palette: Palette }) =>
    createBaby({ ...input, household_id: household?.id ?? null })

  // Shared header props for every state below (gated / loading / first-run /
  // full). No age pill any more: the frame's header band already reads the
  // child's name and age on every route, so a second badge beside the title was
  // the same fact twice.
  const page = {
    title: t.baby.title,
  }

  const toolbar =
    babies.length > 1 ? (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">{t.baby.selectLabel}:</span>
        <ChoiceGroup
          ariaLabel={t.baby.selectLabel}
          size="default"
          value={currentBabyId ?? babies[0].id}
          onChange={setCurrentBabyId}
          options={babies.map((b) => ({ value: b.id, label: b.name }))}
        />
      </div>
    ) : null

  // Pre-tier states: gated, loading, and first-run all precede the glance →
  // input → detail rhythm, so they go in `children` rather than a tier.
  if (!ready) {
    return (
      <WidgetPage {...page}>
        <EmptyState icon={<BabyIcon />}>{t.baby.signInPrompt}</EmptyState>
      </WidgetPage>
    )
  }

  if (loading && babies.length === 0) {
    return (
      <WidgetPage {...page}>
        <div className="flex flex-col gap-6">
          {/* The real stat row's grid, so the skeleton can never drift from it. */}
          <WidgetStatGrid>
            {Array.from({ length: 4 }).map((_, i) => (
              <StatTileSkeleton key={i} />
            ))}
          </WidgetStatGrid>
          <Skeleton className="h-40" />
          <Skeleton className="h-56" />
        </div>
      </WidgetPage>
    )
  }

  if (!currentBaby) {
    return (
      <WidgetPage {...page} toolbar={toolbar}>
        <CreateBabyForm onCreate={onCreate} />
      </WidgetPage>
    )
  }

  return (
    <BabyDetail
      key={currentBaby.id}
      page={page}
      toolbar={toolbar}
      baby={currentBaby}
      updateBaby={updateBaby}
      deleteBaby={deleteBaby}
      onCreate={onCreate}
    />
  )
}

/**
 * The loading stand-in for one `StatTile`.
 *
 * It **mirrors the tile's box model instead of naming a height**, because a
 * height here is a copy of a number that lives in `StatTile`: it was
 * `<Skeleton className="h-20" />`, and when the audit dropped the tile's doubled
 * `CardContent` padding the tile went 136px → 104px while the 80px placeholder
 * stood still. Every version of that number is wrong the moment the tile is
 * touched, so this one derives it — same `Card` (16px of block padding), same
 * 32px `IconChip size="sm"` square beside its label, same 8px gap above the
 * value — and lands on the tile's height on its own.
 *
 * `h-[1lh]` is the whole trick for the two text rows: one line box of whatever
 * type the placeholder is set in, so `text-xs` measures 16px and `text-2xl`
 * measures 32px without either being written down.
 */
function StatTileSkeleton() {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-2">
          {/* `IconChip size="sm"`: `rounded-lg`, `p-2` around a 16px icon. */}
          <Skeleton className="size-8 shrink-0 rounded-lg" />
          <Skeleton className="h-[1lh] w-2/3 text-xs" />
        </div>
        <Skeleton className="mt-2 h-[1lh] w-1/2 text-2xl" />
      </CardContent>
    </Card>
  )
}

function CreateBabyForm({
  onCreate,
  bare,
}: {
  onCreate: (i: { name: string; birth_date: string; palette: Palette }) => Promise<unknown>
  /** Set when this form is already inside a `Card` (the "add another baby"
   *  disclosure): keeps the header and the fields, drops the second edge and the
   *  second layer of padding. */
  bare?: boolean
}) {
  const t = useT()
  const fields = useFieldLabels()
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState(todayKey())
  const [palette, setPalette] = useState<Palette>('red')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    setError('')
    try {
      await onCreate({ name: name.trim(), birth_date: birthDate, palette })
      setName('')
    } catch {
      setError(t.baby.error)
    } finally {
      setBusy(false)
    }
  }

  // The form itself, so `bare` can skip the card and its title entirely: inside
  // the "add another baby" disclosure the `<summary>` already carries that exact
  // title, and with the inner surface gone the two sat 16px apart saying the same
  // thing. One title per block.
  const form = (
    <form onSubmit={submit} className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="baby-name">{t.baby.nameLabel}</Label>
          <Input
            id="baby-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.baby.namePlaceholder}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="baby-birth">{t.baby.birthDateLabel}</Label>
          <DatePicker
            id="baby-birth"
            value={birthDate}
            onValueChange={setBirthDate}
            max={todayKey()}
            {...fields.datePicker}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t.baby.paletteLabel}</Label>
          <ChoiceGroup
            value={palette}
            onChange={setPalette}
            options={[
              { value: 'blue', label: t.nav.boy },
              { value: 'red', label: t.nav.girl },
            ]}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={busy}>
            {busy ? t.baby.creating : t.baby.create}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
      </form>
  )

  if (bare) return form

  // `WidgetCard`, not a hand-rolled copy of its header: the icon + 15px semibold
  // title + `mb-4` here was the same block, spelled out a second time.
  return (
    <WidgetCard icon={<BabyIcon />} title={t.baby.addTitle}>
      {form}
    </WidgetCard>
  )
}

function BabyDetail({
  page,
  toolbar,
  baby,
  updateBaby,
  deleteBaby,
  onCreate,
}: {
  page: { title: string }
  toolbar: ReactNode
  baby: BabyRecord
  updateBaby: (id: string, patch: { name?: string; birth_date?: string; palette?: Palette }) => Promise<unknown>
  deleteBaby: (id: string) => Promise<unknown>
  onCreate: (i: { name: string; birth_date: string; palette: Palette }) => Promise<unknown>
}) {
  const t = useT()
  const locale = useDateLocale()
  const babyId = baby.id
  const birthDate = baby.birth_date
  const name = baby.name
  const householdId = baby.household_id
  const [rows, setRows] = useState<Measurement[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function refresh() {
    setLoading(true)
    try {
      setRows(await listMeasurements(babyId))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [babyId])

  const labels = rows.map((r) => formatDateKey(r.measured_on, locale, { month: 'short', day: 'numeric' }))
  const latestWeight = [...rows].reverse().find((r) => r.weight_kg != null)?.weight_kg ?? null
  const latestHeight = [...rows].reverse().find((r) => r.height_cm != null)?.height_cm ?? null
  const months = ageInMonths(birthDate)

  return (
    <WidgetPage
      {...page}
      toolbar={toolbar}
      inputLabel={t.baby.addMeasurement}
      glance={
        <WidgetStatGrid>
          <StatTile label={t.baby.ageLabel} value={`${months} ${t.baby.monthsShort}`} icon={<BabyIcon className="size-4" />} />
          <StatTile label={t.baby.latestWeight} value={latestWeight != null ? `${latestWeight} kg` : '—'} icon={<Weight className="size-4" />} />
          <StatTile label={t.baby.latestHeight} value={latestHeight != null ? `${latestHeight} cm` : '—'} icon={<Ruler className="size-4" />} />
          <StatTile label={t.baby.selectLabel} value={name} icon={<BabyIcon className="size-4" />} />
        </WidgetStatGrid>
      }
      input={<AddMeasurementForm babyId={babyId} householdId={householdId} onSaved={refresh} />}
      detail={
        <>
          {rows.length >= 1 && (
            <WidgetSplit>
              <WidgetCard title={t.baby.weightChart}>
                <GrowthChart labels={labels} data={rows.map((r) => r.weight_kg)} label={t.baby.weightChart} yTitle="kg" />
              </WidgetCard>
              <WidgetCard title={t.baby.heightChart}>
                <GrowthChart labels={labels} data={rows.map((r) => r.height_cm)} label={t.baby.heightChart} yTitle="cm" />
              </WidgetCard>
            </WidgetSplit>
          )}

          <WidgetCard title={t.baby.measurementsTitle}>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
              </div>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.baby.noMeasurements}</p>
            ) : (
              <GlassScrollArea className="max-h-[18rem]">
                <ul className="divide-y divide-border pr-1">
                  {[...rows].reverse().map((r) => (
                    <li key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="text-muted-foreground">
                        {formatDateKey(r.measured_on, locale, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-4">
                        <span className="text-foreground">
                          {r.weight_kg != null && <span className="mr-3">{r.weight_kg} kg</span>}
                          {r.height_cm != null && <span className="mr-3">{r.height_cm} cm</span>}
                          {r.head_cm != null && <span>{r.head_cm} cm ⌀</span>}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={t.baby.delete}
                          onClick={() => void deleteMeasurement(r.id).then(refresh)}
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </span>
                    </li>
                  ))}
                </ul>
              </GlassScrollArea>
            )}
          </WidgetCard>

          {/* Profile + danger zone — admin, so it sits below the reference data. */}
          <WidgetCard icon={<BabyIcon />} title={t.baby.profileTitle}>
            {editing ? (
              <EditBabyForm
                baby={baby}
                onSave={async (patch) => {
                  await updateBaby(baby.id, patch)
                  setEditing(false)
                }}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateKey(birthDate, locale, { day: '2-digit', month: '2-digit', year: 'numeric' })} · {baby.palette === 'blue' ? t.nav.boy : t.nav.girl}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                    <Pencil className="mr-1.5 size-3.5" /> {t.baby.editProfile}
                  </Button>
                  {confirmDelete ? (
                    <span className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="hidden text-muted-foreground sm:inline">{t.baby.deleteBabyConfirm}</span>
                      <Button size="sm" variant="destructive" onClick={() => void deleteBaby(baby.id)}>
                        {t.baby.deleteBaby}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                        {t.baby.cancel}
                      </Button>
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 className="mr-1.5 size-3.5" /> {t.baby.deleteBaby}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </WidgetCard>

          {/* A real `Card`, not `rounded-xl border border-border bg-card p-4`: the
              same fix as the Wiki topic pager. That spelling matched the Card's
              radius and padding but drew a 1px `border-border` where every other
              surface on this page draws a `ring-1 ring-foreground/10`, so the one
              card at the bottom of the page read as a different kind of surface
              from the four above it. (Restating it as `border-*` on the `Card`
              would render nothing at all — Tailwind v4 zeroes border-width, and
              the Card's edge is the ring.)

              The form inside is `bare`: the disclosure's card is the only surface
              and its `<summary>` is the only title. It used to nest a full titled
              `Card` — two edges 16px apart, 32px of padding down the sides of the
              fields, and "Add a baby" printed twice. */}
          <Card>
            <CardContent>
              <details>
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                  {t.baby.addTitle}
                </summary>
                <div className="mt-4">
                  <CreateBabyForm onCreate={onCreate} bare />
                </div>
              </details>
            </CardContent>
          </Card>
        </>
      }
    />
  )
}

function EditBabyForm({
  baby,
  onSave,
  onCancel,
}: {
  baby: BabyRecord
  onSave: (patch: { name: string; birth_date: string; palette: Palette }) => Promise<void>
  onCancel: () => void
}) {
  const t = useT()
  const fields = useFieldLabels()
  const [name, setName] = useState(baby.name)
  const [birthDate, setBirthDate] = useState(baby.birth_date)
  const [palette, setPalette] = useState<Palette>(baby.palette)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    setError('')
    try {
      await onSave({ name: name.trim(), birth_date: birthDate, palette })
    } catch {
      setError(t.baby.error)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="edit-name">{t.baby.nameLabel}</Label>
        <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edit-birth">{t.baby.birthDateLabel}</Label>
        <DatePicker
          id="edit-birth"
          value={birthDate}
          onValueChange={setBirthDate}
          max={todayKey()}
          {...fields.datePicker}
        />
      </div>
      <div className="space-y-1.5">
        <Label>{t.baby.paletteLabel}</Label>
        <ChoiceGroup
          value={palette}
          onChange={setPalette}
          options={[
            { value: 'blue', label: t.nav.boy },
            { value: 'red', label: t.nav.girl },
          ]}
        />
      </div>
      <div className="flex items-end gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? t.baby.saving : t.baby.saveProfile}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t.baby.cancel}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
    </form>
  )
}

function AddMeasurementForm({
  babyId,
  householdId,
  onSaved,
}: {
  babyId: string
  householdId: string | null
  onSaved: () => Promise<void>
}) {
  const t = useT()
  const fields = useFieldLabels()
  const [date, setDate] = useState(todayKey())
  const [weight, setWeight] = useState<number | null>(null)
  const [height, setHeight] = useState<number | null>(null)
  const [head, setHead] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (weight === null && height === null && head === null) return
    setBusy(true)
    setError('')
    try {
      await addMeasurement({
        baby_id: babyId,
        measured_on: date,
        weight_kg: weight,
        height_cm: height,
        head_cm: head,
        note: note.trim() || null,
        household_id: householdId,
      })
      setWeight(null)
      setHeight(null)
      setHead(null)
      setNote('')
      await onSaved()
    } catch {
      setError(t.baby.error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardContent>
        {/* No card title — the input tier's eyebrow already names the action. */}
        {/*  Four field columns, then the submit button.
            The button only joins the fields' row from `lg`, and takes an `auto`
            track when it does. Five equal columns put it in a ~99px cell at
            640px and ~125px at 768px — narrower than its own `whitespace-nowrap`
            label ("Save measurement", 19 characters in Greek: ~153px), so it
            overflowed its track and dragged the row out of line, and the date
            trigger truncated to "25/07/20…" at the same widths. Four columns
            give every field 128px at 640px and 160px at 768px: one-line labels
            in both languages, and a date that fits.
            `items-end`: a label that does wrap (a longer translation, a 320px
            phone) makes its own cell taller, so bottom-aligning keeps every
            control — and the button — on one baseline. */}
        <form
          onSubmit={submit}
          className="grid grid-cols-2 items-end gap-4 sm:grid-cols-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]"
        >
          <div className="space-y-1.5">
            <Label htmlFor="m-date">{t.baby.dateLabel}</Label>
            <DatePicker
              id="m-date"
              value={date}
              onValueChange={setDate}
              max={todayKey()}
              {...fields.datePicker}
            />
          </div>
          {/*  The three `indicator*` scales are read-outs, not limits: they span the
              plausible range of the first three years (WHO 0–36 months, boys and
              girls, roughly 3rd–97th centile, rounded outward), so the bar under
              the value says "about here in the range" while you step. Weight
              starts at 0 because a newborn's 3kg genuinely belongs near the
              bottom of 0–15; height and head start at their floors (40cm, 30cm),
              or every real reading would sit two-thirds along and barely move. */}
          <div className="space-y-1.5">
            <Label htmlFor="m-weight">{t.baby.weightLabel}</Label>
            <NumberInput
              id="m-weight"
              value={weight}
              onValueChange={setWeight}
              floor={0}
              step={0.1}
              smallStep={0.01}
              indicatorMax={20}
              {...fields.stepper}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-height">{t.baby.heightLabel}</Label>
            <NumberInput
              id="m-height"
              value={height}
              onValueChange={setHeight}
              floor={0}
              step={0.5}
              smallStep={0.1}
              indicatorMin={40}
              indicatorMax={110}
              {...fields.stepper}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-head">{t.baby.headLabel}</Label>
            <NumberInput
              id="m-head"
              value={head}
              onValueChange={setHead}
              floor={0}
              step={0.5}
              smallStep={0.1}
              indicatorMin={30}
              indicatorMax={55}
              {...fields.stepper}
            />
          </div>
          {/* Full width on a phone (never a lonely half cell), its own natural
              width on the row under the fields, then the last cell of the
              fields' row from `lg`. `h-11 sm:h-8` is the shared control height,
              so at `lg` it bottom-aligns with the four fields exactly. */}
          <Button
            type="submit"
            disabled={busy}
            className="col-span-2 w-full sm:col-span-4 sm:w-auto sm:justify-self-start lg:col-span-1"
          >
            {busy ? t.baby.saving : t.baby.save}
          </Button>
          <div className="col-span-2 space-y-1.5 sm:col-span-4 lg:col-span-5">
            <Label htmlFor="m-note">{t.baby.noteLabel}</Label>
            <Input id="m-note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {error && (
            <p className="col-span-2 text-sm text-destructive sm:col-span-4 lg:col-span-5">{error}</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
