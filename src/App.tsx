import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Topic from './pages/Topic'
import LearnGroup from './pages/LearnGroup'
import Daily from './pages/Daily'
import Tracker from './pages/Tracker'
import Baby from './pages/Baby'
import Family from './pages/Family'
import FeedLog from './pages/FeedLog'
import DesignSystem from './pages/DesignSystem'
import { Layout } from './components/Layout'
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
          <Route path="/" element={<Home />} />
          <Route path="/topic/:slug" element={<Topic />} />
          <Route path="/learn/:group" element={<LearnGroup />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/baby" element={<Baby />} />
          <Route path="/family" element={<Family />} />
          <Route path="/feed" element={<FeedLog />} />
        </Route>
        <Route path="/design-system" element={<DesignSystem />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

/** Reset scroll to the top on every route change so pages don't open mid-scroll. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
