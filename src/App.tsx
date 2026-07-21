import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import DesignSystem from './pages/DesignSystem'
import { useAppStore } from './store'

export default function App() {
  const dark = useAppStore((s) => s.dark)
  const palette = useAppStore((s) => s.palette)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', dark ? 'dark' : 'light')
    root.classList.toggle('dark', dark)
    root.setAttribute('data-palette', palette)
  }, [dark, palette])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/design-system" element={<DesignSystem />} />
    </Routes>
  )
}
