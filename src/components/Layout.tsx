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
    <>
      <NavBar />
      <div className="pb-bottom-nav">
        <Outlet />
        <Footer />
      </div>
      <BottomNav />
      <InstallPrompt />
    </>
  )
}
