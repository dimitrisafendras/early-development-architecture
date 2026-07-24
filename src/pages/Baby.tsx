import { useEffect, useState, type FormEvent } from 'react'
import { Baby as BabyIcon, Plus, Trash2, Ruler, Weight, Pencil } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import { ChoiceGroup } from '../components/ChoiceGroup'
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

  return (
    <>
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 page-px py-10">
        <SectionHeader title={t.baby.title} description={t.baby.subtitle} />

        {!ready ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              {t.baby.signInPrompt}
            </CardContent>
          </Card>
        ) : loading && babies.length === 0 ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
            <Skeleton className="h-40" />
            <Skeleton className="h-56" />
          </div>
        ) : (
          <>
            {babies.length > 1 && (
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
            )}

            {currentBaby ? (
              <BabyDetail
                key={currentBaby.id}
                baby={currentBaby}
                updateBaby={updateBaby}
                deleteBaby={deleteBaby}
              />
            ) : (
              <CreateBabyForm onCreate={onCreate} />
            )}

            {currentBaby && (
              <details className="rounded-xl border border-border bg-card p-4 text-card-foreground">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                  {t.baby.addTitle}
                </summary>
                <div className="mt-4">
                  <CreateBabyForm onCreate={onCreate} />
                </div>
              </details>
            )}
          </>
        )}
      </main>
    </>
  )
}

function CreateBabyForm({
  onCreate,
}: {
  onCreate: (i: { name: string; birth_date: string; palette: Palette }) => Promise<unknown>
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

  return (
    <Card>
      <CardContent>
        <p className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-foreground">
          <BabyIcon className="size-4 text-primary" /> {t.baby.addTitle}
        </p>
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </CardContent>
    </Card>
  )
}

function BabyDetail({
  baby,
  updateBaby,
  deleteBaby,
}: {
  baby: BabyRecord
  updateBaby: (id: string, patch: { name?: string; birth_date?: string; palette?: Palette }) => Promise<unknown>
  deleteBaby: (id: string) => Promise<unknown>
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
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label={t.baby.ageLabel} value={`${months} ${t.baby.monthsShort}`} icon={<BabyIcon className="size-4" />} />
        <Stat label={t.baby.latestWeight} value={latestWeight != null ? `${latestWeight} kg` : '—'} icon={<Weight className="size-4" />} />
        <Stat label={t.baby.latestHeight} value={latestHeight != null ? `${latestHeight} cm` : '—'} icon={<Ruler className="size-4" />} />
        <Stat label={t.baby.selectLabel} value={name} icon={<BabyIcon className="size-4" />} />
      </div>

      {/* Edit profile + danger zone */}
      <Card>
        <CardContent>
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
        </CardContent>
      </Card>

      <AddMeasurementForm babyId={babyId} householdId={householdId} onSaved={refresh} />

      {rows.length >= 1 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardContent>
              <p className="mb-4 text-[15px] font-semibold text-foreground">{t.baby.weightChart}</p>
              <GrowthChart labels={labels} data={rows.map((r) => r.weight_kg)} label={t.baby.weightChart} yTitle="kg" />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="mb-4 text-[15px] font-semibold text-foreground">{t.baby.heightChart}</p>
              <GrowthChart labels={labels} data={rows.map((r) => r.height_cm)} label={t.baby.heightChart} yTitle="cm" />
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent>
          <p className="mb-4 text-[15px] font-semibold text-foreground">{t.baby.measurementsTitle}</p>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.baby.noMeasurements}</p>
          ) : (
            <ul className="divide-y divide-border">
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
          <span className="shrink-0 text-primary">{icon}</span>
          <span className="truncate">{label}</span>
        </div>
        <div className="mt-1 truncate font-heading text-xl font-semibold text-foreground">{value}</div>
      </CardContent>
    </Card>
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
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <p className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-foreground">
          <Plus className="size-4 text-primary" /> {t.baby.addMeasurement}
        </p>
        <form onSubmit={submit} className="grid grid-cols-2 gap-4 sm:grid-cols-5">
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
          <div className="space-y-1.5">
            <Label htmlFor="m-weight">{t.baby.weightLabel}</Label>
            <NumberInput
              id="m-weight"
              value={weight}
              onValueChange={setWeight}
              floor={0}
              step={0.1}
              smallStep={0.01}
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
              {...fields.stepper}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? t.baby.saving : t.baby.save}
            </Button>
          </div>
          <div className="space-y-1.5 sm:col-span-5">
            <Label htmlFor="m-note">{t.baby.noteLabel}</Label>
            <Input id="m-note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive sm:col-span-5">{error}</p>}
        </form>
      </CardContent>
    </Card>
  )
}
