import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import DesignSystem from './pages/DesignSystem'
import { useAppStore } from './store'

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
    // Keep the PWA/browser chrome color in sync with the active theme.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', dark ? '#0a0a0a' : '#ffffff')
  }, [dark, palette, locale])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/design-system" element={<DesignSystem />} />
    </Routes>
  )
}
