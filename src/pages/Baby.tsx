import { useEffect, useState, type FormEvent } from 'react'
import { Baby as BabyIcon, Plus, Trash2, Ruler, Weight } from 'lucide-react'
import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { SectionHeader } from '../components/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { GrowthChart } from '../components/charts'
import { useBabies } from '../lib/useBabies'
import { useHousehold } from '../lib/household'
import { ageInMonths, todayKey } from '../lib/schedule'
import {
  listMeasurements,
  addMeasurement,
  deleteMeasurement,
  type Measurement,
} from '../lib/db'
import type { Palette } from '../store'
import { useT } from '../i18n'

export default function Baby() {
  const t = useT()
  const { babies, currentBaby, currentBabyId, setCurrentBabyId, createBaby, ready, loading } =
    useBabies()
  const { household } = useHousehold()

  // New babies join the family automatically when the user is in one.
  const onCreate = (input: { name: string; birth_date: string; palette: Palette }) =>
    createBaby({ ...input, household_id: household?.id ?? null })

  return (
    <>
      <NavBar />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10">
        <SectionHeader title={t.baby.title} description={t.baby.subtitle} />

        {!ready ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              {t.baby.signInPrompt}
            </CardContent>
          </Card>
        ) : loading && babies.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">…</CardContent>
          </Card>
        ) : (
          <>
            {babies.length > 1 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">{t.baby.selectLabel}:</span>
                {babies.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setCurrentBabyId(b.id)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                      b.id === currentBabyId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            )}

            {currentBaby ? (
              <BabyDetail
                babyId={currentBaby.id}
                birthDate={currentBaby.birth_date}
                name={currentBaby.name}
                householdId={currentBaby.household_id}
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
      <Footer />
    </>
  )
}

function CreateBabyForm({
  onCreate,
}: {
  onCreate: (i: { name: string; birth_date: string; palette: Palette }) => Promise<unknown>
}) {
  const t = useT()
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
            <Input
              id="baby-birth"
              type="date"
              value={birthDate}
              max={todayKey()}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t.baby.paletteLabel}</Label>
            <div className="flex gap-2">
              {(['blue', 'red'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPalette(p)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    palette === p
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent',
                  )}
                >
                  {p === 'blue' ? t.nav.boy : t.nav.girl}
                </button>
              ))}
            </div>
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
  babyId,
  birthDate,
  name,
  householdId,
}: {
  babyId: string
  birthDate: string
  name: string
  householdId: string | null
}) {
  const t = useT()
  const [rows, setRows] = useState<Measurement[]>([])
  const [loading, setLoading] = useState(true)

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

  const labels = rows.map((r) => new Date(r.measured_on).toLocaleDateString([], { month: 'short', day: 'numeric' }))
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
            <p className="text-sm text-muted-foreground">…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.baby.noMeasurements}</p>
          ) : (
            <ul className="divide-y divide-border">
              {[...rows].reverse().map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-muted-foreground">
                    {new Date(r.measured_on).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="text-foreground">
                      {r.weight_kg != null && <span className="mr-3">{r.weight_kg} kg</span>}
                      {r.height_cm != null && <span className="mr-3">{r.height_cm} cm</span>}
                      {r.head_cm != null && <span>{r.head_cm} cm ⌀</span>}
                    </span>
                    <button
                      type="button"
                      aria-label={t.baby.delete}
                      onClick={() => void deleteMeasurement(r.id).then(refresh)}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
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
          <span className="text-primary">{icon}</span>
          {label}
        </div>
        <div className="mt-1 truncate font-heading text-xl font-semibold text-foreground">{value}</div>
      </CardContent>
    </Card>
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
  const [date, setDate] = useState(todayKey())
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [head, setHead] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!weight && !height && !head) return
    setBusy(true)
    setError('')
    try {
      await addMeasurement({
        baby_id: babyId,
        measured_on: date,
        weight_kg: weight ? Number(weight) : null,
        height_cm: height ? Number(height) : null,
        head_cm: head ? Number(head) : null,
        note: note.trim() || null,
        household_id: householdId,
      })
      setWeight('')
      setHeight('')
      setHead('')
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
            <Input id="m-date" type="date" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-weight">{t.baby.weightLabel}</Label>
            <Input id="m-weight" type="number" step="0.01" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-height">{t.baby.heightLabel}</Label>
            <Input id="m-height" type="number" step="0.1" min="0" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-head">{t.baby.headLabel}</Label>
            <Input id="m-head" type="number" step="0.1" min="0" value={head} onChange={(e) => setHead(e.target.value)} />
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
