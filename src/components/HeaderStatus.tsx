import type { ReactNode } from 'react'
import {
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  Cloudy,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Eyebrow } from './Eyebrow'
import { useBabyAge } from './AgeBadge'
import { useDateLocale, formatDateKey, formatTimeKey } from '../lib/dates'
import { formatAgeLabel, todayKey } from '../lib/schedule'
import { useNow } from '../lib/useNow'
import { useWeather, type Condition } from '../lib/useWeather'
import { useT } from '../i18n'

/**
 * One icon per grouped WMO condition — see `toCondition` in lib/useWeather.
 *
 * **Why raw palette classes here, of all places.** The colour rule is token
 * classes only, so both palettes keep working — with a stated exception for
 * semantically fixed colours. Weather is exactly that: sun is amber and rain is
 * blue whether the app is in the blue palette or the pink one. Tinting these
 * with `--primary` would make the forecast change colour when you switch which
 * child the app is set up for, which is nonsense.
 *
 * **Why the -600/-400 pairing and not -500 everywhere.** Below `sm` the icon is
 * the only *visible* carrier of the condition, so it has to clear WCAG 1.4.11
 * non-text contrast (3:1) against the page background. On white, `amber-500`
 * manages about 2.2:1 and `sky-500` about 2.9:1 — both fail. The -600 step
 * clears it in the light theme, and -400 clears it comfortably against the
 * near-black dark background. Re-check if a step moves.
 */
const CONDITION_ICON: Record<Condition, { icon: LucideIcon; className: string }> = {
  clear: { icon: Sun, className: 'text-amber-600 dark:text-amber-400' },
  partly: { icon: CloudSun, className: 'text-amber-600 dark:text-amber-400' },
  overcast: { icon: Cloudy, className: 'text-slate-500 dark:text-slate-400' },
  fog: { icon: CloudFog, className: 'text-slate-500 dark:text-slate-400' },
  drizzle: { icon: CloudDrizzle, className: 'text-sky-600 dark:text-sky-400' },
  rain: { icon: CloudRain, className: 'text-blue-600 dark:text-blue-400' },
  showers: { icon: CloudRainWind, className: 'text-blue-600 dark:text-blue-400' },
  snow: { icon: CloudSnow, className: 'text-cyan-600 dark:text-cyan-300' },
  thunder: { icon: CloudLightning, className: 'text-violet-600 dark:text-violet-400' },
}

/**
 * One reading in the header bar: a small tracked label, then its value, on a
 * single line.
 *
 * **One line, not two.** The label sat *above* the value at first, which made
 * each reading a two-line stack that could not share a baseline with the
 * one-line page title beside it — whichever way the row was aligned
 * (`items-end`, `items-center`) the title read as sitting too high or too low.
 * Inline label + value gives every reading the same baseline as the `h1`, so the
 * whole band sits on one line.
 *
 * `label` is optional: the weather reading names itself with an icon, so a word
 * in front of it would be the only redundant thing in the band.
 */
function Stat({ label, value, accent }: { label?: string; value: ReactNode; accent?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-2">
      {label && (
        <Eyebrow as="span" size="sm" tone="muted">
          {label}
        </Eyebrow>
      )}
      <span
        className={cn(
          'font-heading text-sm font-semibold tabular-nums',
          accent ? 'text-primary' : 'text-foreground',
        )}
      >
        {value}
      </span>
    </span>
  )
}

/**
 * The condition as a glyph, sitting on the readout's baseline.
 *
 * `aria-hidden`, because the condition is already in the accessibility tree as
 * text beside it — the icon is the *visual* carrier below `sm`, not the
 * semantic one.
 */
function WeatherIcon({ condition }: { condition: Condition }) {
  const { icon: Icon, className } = CONDITION_ICON[condition]
  return <Icon aria-hidden className={cn('mr-1.5 inline size-4 align-[-0.2em]', className)} />
}

/**
 * The right-hand half of the header band: who this is, how old they are, and the
 * live date and time — set on the title's own line.
 *
 * **Not chips.** The first version drew each reading as a rounded pill, which put
 * four competing capsules across the top of every page and made the header look
 * like a filter bar. This is an instrument readout instead: label above value,
 * hairline rules between columns, no fills at all. Nothing here is pressable, so
 * nothing should look pressable.
 *
 * **Colour is rationed to two things**, and both earn it. The child's name takes
 * the palette accent, because every number in this app is read against their
 * age. The weather glyph takes a fixed condition colour, because it is the only
 * reading here that is not a number — a shape alone is slower to read at a
 * glance than a shape plus "amber means sun". Everything else stays type.
 *
 * Rendered by `PageFrame`, so it is identical on every route and no page can
 * drift its own version.
 */
export function HeaderStatus() {
  const t = useT()
  const now = useNow(30_000)
  const locale = useDateLocale()
  const baby = useBabyAge()
  const weather = useWeather()
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  // `key` is separate from `label` because the weather reading has no label —
  // the list needs a stable identity either way.
  const stats: { key: string; label?: string; value: ReactNode; accent?: boolean }[] = [
    ...(baby
      ? [
          { key: 'baby', label: t.header.baby, value: baby.name, accent: true },
          {
            key: 'age',
            label: t.header.age,
            value: formatAgeLabel(baby.months, t.baby.monthsShort, t.baby.yearsShort),
          },
        ]
      : []),
    {
      key: 'today',
      label: t.header.today,
      value: formatDateKey(todayKey(now), locale, { weekday: 'short', day: 'numeric', month: 'short' }),
    },
    { key: 'now', label: t.header.now, value: formatTimeKey(time, locale) },
    // Last in the row, and absent entirely when unknown — the reading is a
    // convenience (is it outing weather?), not something the header owes you.
    // Below `sm` the icon carries the condition on its own: the temperature is
    // what you read at a glance, and "Partly cloudy" is what would wrap the band
    // onto two lines. `sr-only sm:not-sr-only` keeps the words in the
    // accessibility tree at every width while only painting them from `sm` up —
    // one node, so a screen reader never hears the condition twice.
    // No label: the icon already says "weather", and a word in front of it
    // would be the one redundant thing in the band.
    ...(weather
      ? [
          {
            key: 'weather',
            value: (
              <>
                {/* `inline` + a baseline nudge rather than a nested flex: the
                    band is baseline-aligned, and an svg has no baseline of its
                    own to contribute. */}
                <WeatherIcon condition={weather.condition} />
                {weather.tempC}°C
                <span className="sr-only font-normal text-muted-foreground sm:not-sr-only sm:inline">
                  {' '}
                  {t.header.conditions[weather.condition]}
                </span>
              </>
            ),
          },
        ]
      : []),
  ]

  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
      {stats.map((stat, i) => (
        <span key={stat.key} className="inline-flex items-baseline gap-x-4">
          {/* A rule *between* readings, never before the first — drawn on the item
              rather than with `divide-x` so it survives wrapping. `self-center`
              keeps it centred on the line while everything else baseline-aligns. */}
          {i > 0 && <span aria-hidden className="h-3.5 w-px self-center bg-border/70" />}
          <Stat label={stat.label} value={stat.value} accent={stat.accent} />
        </span>
      ))}
    </div>
  )
}
