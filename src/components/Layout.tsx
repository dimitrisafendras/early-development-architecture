import { Outlet } from 'react-router-dom'
import { AuroraBackground } from './AuroraBackground'
import { NavBar } from './NavBar'
import { SideNav } from './SideNav'
import { BottomNav } from './BottomNav'
import { InstallPrompt } from './InstallPrompt'
import { NotificationsProvider } from './NotificationsProvider'

/** The scrolling element from `lg` up (the shell itself doesn't scroll there),
 *  so route changes can reset *its* scrollTop instead of the window's. */
export const APP_SCROLL_ID = 'app-scroll'

/**
 * Persistent app shell: the navigation stays mounted across route changes, so
 * only the page content (the <Outlet/>) swaps and the floating nav never flickers
 * on navigation. Pages render their own <main>.
 *
 * Two navigation forms, one per breakpoint: the `SideNav` rail from `xl` up (the
 * page then owns the full viewport height), and the floating `NavBar` +
 * `BottomNav` tab bar below that. `pb-bottom-nav` reserves the tab bar's height
 * (plus the home-indicator inset) so the last card on every page stays above it;
 * it collapses to nothing from `xl` up, where the bar is hidden.
 *
 * **The height model breaks at `lg`, not at `xl`, and the two are deliberately
 * different breakpoints.** From `lg` the shell is exactly one viewport tall and
 * never scrolls itself: the content column scrolls instead. Pages that fill the
 * column (the Day dashboard) therefore keep a stable height and scroll inside
 * their cards, while long documents (Wiki, Baby) scroll the column as usual.
 * Below `lg` the document scrolls normally, which is what a phone expects.
 *
 * It used to be `xl` here, which left 1024–1279px broken: the Day dashboard
 * switches to its two-column, fills-the-height layout at `lg` and uncaps its
 * inner scroll areas there, so on a landscape tablet it was laying out for a
 * fixed height that nothing was providing. Every card grew to its full content
 * and the page ran to nearly four viewports. Navigation still switches at `xl` —
 * a tablet gets the fixed height without the rail.
 */
export function Layout() {
  return (
    // The notification model is owned here so both navigation surfaces share one
    // set of subscriptions — see NotificationsProvider.
    <NotificationsProvider>
      <div className="flex min-h-svh flex-col lg:h-svh lg:overflow-hidden xl:flex-row">
        {/* Mounted once for the whole app — see AuroraBackground's mounting
            contract: no ancestor may create a containing block for `fixed`. */}
        <AuroraBackground />
        <SideNav />
        {/* `min-w-0` so wide page content (tables, charts) can't push the rail. */}
        <div id={APP_SCROLL_ID} className="flex min-w-0 flex-1 flex-col lg:min-h-0 lg:overflow-y-auto">
          <NavBar />
          {/* Grow the content region so a short page (e.g. sign-in) fills the
              viewport instead of floating mid-screen. */}
          <div className="flex flex-1 flex-col pb-bottom-nav lg:min-h-0">
            <Outlet />
          </div>
        </div>
        <BottomNav />
        <InstallPrompt />
      </div>
    </NotificationsProvider>
  )
}
