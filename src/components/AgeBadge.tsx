import { Baby as BabyIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

/**
 * Small chip announcing whose age the section is tuned to. Renders nothing when
 * no baby is selected, so the sections stay generic for signed-out users.
 *
 * This is the app's canonical header pill, and it now goes through the DS
 * `Badge` rather than re-typing one: the header `aside` slot used to hold three
 * different shapes depending on the route — this pill on `/tracker`, an
 * `11px`-text pill *with* a border on `/wiki`, and a 48px `rounded-2xl` icon
 * block on `/signin`. The frame aligned the title but the trailing element's
 * mass changed under it.
 */
export function AgeBadge() {
  const t = useT()
  const baby = useBabyAge()
  if (!baby) return null
  return (
    <Badge variant="soft">
      <BabyIcon />
      {baby.name} · {baby.months} {t.baby.monthsShort}
    </Badge>
  )
}
