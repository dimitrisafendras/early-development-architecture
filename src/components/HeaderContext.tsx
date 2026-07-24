import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Baby as BabyIcon, Home as HomeIcon, Radio, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBabies } from '../lib/useBabies'
import { useHousehold } from '../lib/household'
import { useSession } from '../lib/use-session'
import { appAreas } from '../lib/appAreas'
import { ageInMonths, activeBlockIndex } from '../lib/schedule'
import { isLearnGroup, findTopic } from '../sections/registry'
import { useT, type Messages } from '../i18n'

/**
 * Localized label for the current route, for the nav's "you are here" slot.
 *
 * Parsed from the pathname rather than `useParams`, because the nav lives on the
 * layout route and would only ever see the layout's own (empty) params.
 */
export function useRouteTitle(): string | null {
  const t = useT()
  const { pathname } = useLocation()

  // The hub already announces itself through the brand — no title needed.
  if (pathname === '/') return null

  const area = appAreas.find((a) => a.to === pathname)
  if (area) return area.tabLabel(t)

  if (pathname === '/signin') return t.auth.signIn
  if (pathname === '/signup') return t.auth.signUp
  if (pathname === '/design-system') return t.nav.designSystem

  const learn = pathname.startsWith('/learn/') ? pathname.slice('/learn/'.length) : null
  if (learn && isLearnGroup(learn)) return t.hub.groups[learn]

  const topic = pathname.startsWith('/topic/')
    ? findTopic(pathname.slice('/topic/'.length))
    : undefined
  if (topic) return topic.label(t)

  return null
}

/** Which routine block the clock is in right now, re-evaluated every minute. */
function useActiveBlockTitle(t: Messages): string {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  return t.routine.blocks[activeBlockIndex(now)].title
}

const chip =
  'inline-flex min-w-0 items-center gap-1.5 rounded-full bg-foreground/5 px-2.5 py-1 text-xs font-medium text-foreground/80'

function Chip({
  icon,
  children,
  className,
  title,
}: {
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
  title?: string
}) {
  return (
    <span className={cn(chip, className)} title={title}>
      {icon}
      <span className="truncate">{children}</span>
    </span>
  )
}

/**
 * The nav's context strip: where you are, what part of the day it is, whose baby
 * the app is currently tuned to, and which household that baby is shared with.
 *
 * Everything here is progressive — each piece renders only when it has data and
 * when the viewport has room, so the bar degrades from the full picture on a
 * wide screen down to "page title + baby" on a 320px phone rather than
 * overflowing or wrapping.
 */
export function HeaderInfo() {
  const t = useT()
  const routeTitle = useRouteTitle()
  const blockTitle = useActiveBlockTitle(t)
  const { currentBaby } = useBabies()
  const { household } = useHousehold()

  const months = currentBaby ? ageInMonths(currentBaby.birth_date) : null

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
      {routeTitle && (
        <>
          <span className="hidden shrink-0 text-foreground/25 sm:inline" aria-hidden>
            /
          </span>
          <span className="min-w-0 truncate text-sm font-semibold text-foreground/80">
            {routeTitle}
          </span>
        </>
      )}

      {/* Right-aligned context chips. `ml-auto` keeps them off the title even
          when the title is short. */}
      <div className="ml-auto flex min-w-0 items-center gap-1.5">
        {/* Where the day is at. On a phone this competes with the baby chip for
            the same sliver of width, so it yields to the baby when there is one
            and takes the slot when there isn't — which also means the header
            still says something useful before anyone signs in. */}
        <Chip
          className={cn(
            'max-w-[14ch] xl:max-w-[18ch]',
            currentBaby ? 'hidden md:inline-flex' : 'inline-flex',
          )}
          title={blockTitle}
          icon={
            <span className="relative flex size-2 shrink-0" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
          }
        >
          {blockTitle}
        </Chip>

        {currentBaby && months != null && (
          <Chip
            className="max-w-[12ch] sm:max-w-[16ch]"
            title={`${currentBaby.name} · ${months} ${t.baby.monthsShort}`}
            icon={<BabyIcon className="size-3.5 shrink-0 text-primary" aria-hidden />}
          >
            {currentBaby.name} · {months}
            {t.baby.monthsShort}
          </Chip>
        )}

        {household && (
          <Chip
            className="hidden max-w-[16ch] lg:inline-flex"
            title={household.name}
            icon={<HomeIcon className="size-3.5 shrink-0 text-primary" aria-hidden />}
          >
            {household.name}
          </Chip>
        )}
      </div>
    </div>
  )
}

/**
 * Expanded version of the same context for the collapsed nav dropdown, where
 * there is room for the full identity: signed-in user, household, baby, and the
 * current routine block. Renders nothing when there is nothing to say.
 */
export function HeaderIdentity() {
  const t = useT()
  const blockTitle = useActiveBlockTitle(t)
  const { session } = useSession()
  const { currentBaby } = useBabies()
  const { household } = useHousehold()

  if (!session && !currentBaby && !household) return null

  const months = currentBaby ? ageInMonths(currentBaby.birth_date) : null

  return (
    <dl className="mb-3 grid grid-cols-[auto_1fr] items-center gap-x-2.5 gap-y-2 border-b border-border pb-3 text-sm">
      {session?.user.email && (
        <Row icon={<UserRound className="size-4" />} label={t.auth.signedInAs}>
          {session.user.email}
        </Row>
      )}
      {currentBaby && months != null && (
        <Row icon={<BabyIcon className="size-4" />} label={t.baby.selectLabel}>
          {currentBaby.name} · {months} {t.baby.monthsShort}
        </Row>
      )}
      {household && (
        <Row icon={<HomeIcon className="size-4" />} label={t.family.title}>
          {household.name}
        </Row>
      )}
      <Row icon={<Radio className="size-4" />} label={t.daily.nowTitle}>
        {blockTitle}
      </Row>
    </dl>
  )
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <>
      <dt className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        <span className="sr-only">{label}</span>
        {icon}
      </dt>
      <dd className="m-0 min-w-0 truncate font-medium text-foreground">{children}</dd>
    </>
  )
}
