import { Baby as BabyIcon } from 'lucide-react'
import { useBabies } from '../lib/useBabies'
import { ageInMonths } from '../lib/schedule'
import { useT } from '../i18n'

/**
 * Current baby + age in months, or null when there's no baby / not signed in.
 * Age-banded sections use this to highlight the row that matches the baby.
 */
export function useBabyAge(): { name: string; months: number } | null {
  const { currentBaby } = useBabies()
  if (!currentBaby) return null
  return { name: currentBaby.name, months: ageInMonths(currentBaby.birth_date) }
}

/** Small chip announcing whose age the section is tuned to. Renders nothing
 *  when no baby is selected, so the sections stay generic for signed-out users. */
export function AgeBadge() {
  const t = useT()
  const baby = useBabyAge()
  if (!baby) return null
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
      <BabyIcon className="size-3.5" />
      {baby.name} · {baby.months} {t.baby.monthsShort}
    </span>
  )
}
