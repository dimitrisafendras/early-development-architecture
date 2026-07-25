import { Outlet } from 'react-router-dom'
import { NavBar } from './NavBar'
import { BottomNav } from './BottomNav'
import { Footer } from './Footer'
import { InstallPrompt } from './InstallPrompt'

/**
 * Persistent app shell: NavBar, BottomNav and Footer stay mounted across route
 * changes, so only the page content (the <Outlet/>) swaps. Keeps the floating
 * nav from flickering on navigation. Pages render their own <main> (and Home
 * its Hero).
 *
 * `pb-bottom-nav` reserves the height of the mobile tab bar (plus the
 * home-indicator inset) so the footer and the last card on every page stay
 * above it; it collapses to nothing from `xl` up, where the bar is hidden.
 */
export function Layout() {
  return (
    <div className="flex min-h-svh flex-col">
      <NavBar />
      {/* Grow the content region so the footer sits at the bottom of the
          viewport on short pages (e.g. sign-in) instead of floating mid-page.
          Tall pages push past the viewport and the footer trails as usual. */}
      <div className="flex flex-1 flex-col pb-bottom-nav">
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
        <Footer />
      </div>
      <BottomNav />
      <InstallPrompt />
    </div>
  )
}
