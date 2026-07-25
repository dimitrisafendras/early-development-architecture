import { Baby as BabyIcon, Home as HomeIcon, UserRound } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useBabies } from '../lib/useBabies'
import { useHousehold } from '../lib/household'
import { useSession } from '../lib/use-session'
import { appAreas } from '../lib/appAreas'
import { ageInMonths } from '../lib/schedule'
import { findTopic } from '../sections/registry'
import { useT } from '../i18n'

/**
 * Localized label for the current route, for the nav's "you are here" slot.
 *
 * Parsed from the pathname rather than `useParams`, because the nav lives on the
 * layout route and would only ever see the layout's own (empty) params.
 */
export function useRouteTitle(): string | null {
  const t = useT()
  const { pathname } = useLocation()

  // The Day page is home and the brand already announces the app — no title.
  if (pathname === '/') return null

  const area = appAreas.find((a) => a.to === pathname)
  if (area) return area.tabLabel(t)

  if (pathname === '/wiki') return t.wiki.index
  if (pathname === '/signin') return t.auth.signIn
  if (pathname === '/signup') return t.auth.signUp
  if (pathname === '/design-system') return t.nav.designSystem

  const topic = pathname.startsWith('/wiki/')
    ? findTopic(pathname.slice('/wiki/'.length))
    : undefined
  if (topic) return topic.label(t)

  return null
}

/**
 * The nav's "you are here" slot: just the current page's title. The live
 * "what's now" status that used to live here now sits on the Day page, and the
 * baby/household identity moves to the collapsed-nav dropdown.
 */
export function HeaderInfo() {
  const routeTitle = useRouteTitle()
  if (!routeTitle) return null
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
      <span className="hidden shrink-0 text-foreground/25 sm:inline" aria-hidden>
        /
      </span>
      <span className="min-w-0 truncate text-sm font-semibold text-foreground/80">
        {routeTitle}
      </span>
    </div>
  )
}

/**
 * Expanded identity for the collapsed nav dropdown: signed-in user, the baby the
 * app is tuned to, and the household it's shared with. Renders nothing when
 * there is nothing to say.
 */
export function HeaderIdentity() {
  const t = useT()
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
