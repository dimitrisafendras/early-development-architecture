import { Outlet } from 'react-router-dom'
import { AuroraBackground } from './AuroraBackground'
import { NavBar } from './NavBar'
import { SideNav } from './SideNav'
import { BottomNav } from './BottomNav'
import { InstallPrompt } from './InstallPrompt'

/** The scrolling element at `xl` (the shell itself doesn't scroll there), so
 *  route changes can reset *its* scrollTop instead of the window's. */
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
 * From `xl` the shell is exactly one viewport tall and never scrolls itself: the
 * rail stays put and the content column scrolls. Pages that fill the column (the
 * Day dashboard) therefore keep a stable height and scroll inside their cards,
 * while long documents (Wiki, Baby) scroll the column as usual. Below `xl` the
 * document scrolls normally, which is what a phone expects.
 */
export function Layout() {
  return (
    <div className="flex min-h-svh flex-col xl:h-svh xl:flex-row xl:overflow-hidden">
      {/* Mounted once for the whole app — see AuroraBackground's mounting
          contract: no ancestor may create a containing block for `fixed`. */}
      <AuroraBackground />
      <SideNav />
      {/* `min-w-0` so wide page content (tables, charts) can't push the rail. */}
      <div id={APP_SCROLL_ID} className="flex min-w-0 flex-1 flex-col xl:min-h-0 xl:overflow-y-auto">
        <NavBar />
        {/* Grow the content region so a short page (e.g. sign-in) fills the
            viewport instead of floating mid-screen. */}
        <div className="flex flex-1 flex-col pb-bottom-nav xl:min-h-0">
          <Outlet />
        </div>
      </div>
      <BottomNav />
      <InstallPrompt />
    </div>
  )
}
