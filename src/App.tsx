import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import Day from './pages/Day'
import Schedule from './pages/Schedule'
import Wiki from './pages/Wiki'
import WikiTopic from './pages/WikiTopic'
import Tracker from './pages/Tracker'
import Baby from './pages/Baby'
import Family from './pages/Family'
import FeedLog from './pages/FeedLog'
import SleepLog from './pages/SleepLog'
import Export from './pages/Export'
import Auth from './pages/Auth'
import DesignSystem from './pages/DesignSystem'
import { Layout, APP_SCROLL_ID } from './components/Layout'
import { useAppStore } from './store'
import { isSupabaseEnabled } from './lib/supabase'

export default function App() {
  const dark = useAppStore((s) => s.dark)
  const palette = useAppStore((s) => s.palette)
  const locale = useAppStore((s) => s.locale)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', dark ? 'dark' : 'light')
    root.classList.toggle('dark', dark)
    root.setAttribute('data-palette', palette)
    root.setAttribute('lang', locale)
    // Debugging touchpoint: shows whether the Supabase client initialized
    // (env present at build time) or the app is running local-only.
    root.setAttribute('data-backend', isSupabaseEnabled ? 'supabase' : 'local')
    // Keep the PWA/browser chrome color in sync with the active theme.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', dark ? '#0a0a0a' : '#ffffff')
  }, [dark, palette, locale])

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Day />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/wiki" element={<Wiki />} />
          <Route path="/wiki/:slug" element={<WikiTopic />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/baby" element={<Baby />} />
          <Route path="/family" element={<Family />} />
          <Route path="/feed" element={<FeedLog />} />
          <Route path="/sleep" element={<SleepLog />} />
          <Route path="/export" element={<Export />} />
          <Route path="/signin" element={<Auth mode="signin" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />
          <Route path="/design-system" element={<DesignSystem />} />
          {/* Back-compat redirects for the pre-refactor routes. */}
          <Route path="/daily" element={<Navigate to="/" replace />} />
          <Route path="/learn/:group" element={<Navigate to="/wiki" replace />} />
          <Route path="/topic/:slug" element={<TopicRedirect />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

/** Redirect the legacy `/topic/:slug` route to its new home: the two promoted
 *  topics became first-class surfaces (full-day → the Day page, action-items →
 *  the Day checklist); every other topic now lives under `/wiki/:slug`. */
function TopicRedirect() {
  const { slug } = useParams()
  if (slug === 'full-day' || slug === 'action-items') return <Navigate to="/" replace />
  return <Navigate to={`/wiki/${slug}`} replace />
}

/** Reset scroll to the top on every route change so pages don't open mid-scroll —
 *  unless the URL carries a hash (a deep-link to an in-page anchor).
 *
 *  From `xl` the document doesn't scroll: the shell is one viewport tall and the
 *  content column is the scroller, so reset that element too (the window call
 *  stays for the mobile layout, where the document is the scroller). */
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
    document.getElementById(APP_SCROLL_ID)?.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}
