import { Outlet } from 'react-router-dom'
import { NavBar } from './NavBar'
import { Footer } from './Footer'
import { InstallPrompt } from './InstallPrompt'

/**
 * Persistent app shell: NavBar and Footer stay mounted across route changes,
 * so only the page content (the <Outlet/>) swaps. Keeps the floating nav from
 * flickering on navigation. Pages render their own <main> (and Home its Hero).
 */
export function Layout() {
  return (
    <>
      <NavBar />
      <Outlet />
      <Footer />
      <InstallPrompt />
    </>
  )
}
