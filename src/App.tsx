import { useEffect } from 'react'
import { ConfigProvider, theme } from 'antd'
import { Hero } from './components/Hero'
import { NavBar } from './components/NavBar'
import { Footer } from './components/Footer'
import { Neurobiology } from './sections/Neurobiology'
import { ServeReturn } from './sections/ServeReturn'
import { LanguageMusic } from './sections/LanguageMusic'
import { TummyTime } from './sections/TummyTime'
import { Routine } from './sections/Routine'
import { Environment } from './sections/Environment'
import { Summary } from './sections/Summary'
import { useAppStore } from './store'

export default function App() {
  const dark = useAppStore((s) => s.dark)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#0284c7',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          borderRadius: 10,
        },
      }}
    >
      <Hero />
      <NavBar />
      <main className="container" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 48 }}>
        <Neurobiology />
        <ServeReturn />
        <LanguageMusic />
        <TummyTime />
        <Routine />
        <Environment />
        <Summary />
      </main>
      <Footer />
    </ConfigProvider>
  )
}
