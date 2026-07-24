import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Topic from './pages/Topic'
import Daily from './pages/Daily'
import Tracker from './pages/Tracker'
import Baby from './pages/Baby'
import Family from './pages/Family'
import DesignSystem from './pages/DesignSystem'
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
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/topic/:slug" element={<Topic />} />
      <Route path="/daily" element={<Daily />} />
      <Route path="/tracker" element={<Tracker />} />
      <Route path="/baby" element={<Baby />} />
      <Route path="/family" element={<Family />} />
      <Route path="/design-system" element={<DesignSystem />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
