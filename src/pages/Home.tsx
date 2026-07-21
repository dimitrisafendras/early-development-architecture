import { Hero } from '../components/Hero'
import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { Neurobiology } from '../sections/Neurobiology'
import { ServeReturn } from '../sections/ServeReturn'
import { LanguageMusic } from '../sections/LanguageMusic'
import { TummyTime } from '../sections/TummyTime'
import { Routine } from '../sections/Routine'
import { Environment } from '../sections/Environment'
import { Summary } from '../sections/Summary'

export default function Home() {
  return (
    <>
      <Hero />
      <NavBar />
      <main className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-10">
        <Neurobiology />
        <ServeReturn />
        <LanguageMusic />
        <TummyTime />
        <Routine />
        <Environment />
        <Summary />
      </main>
      <Footer />
    </>
  )
}
