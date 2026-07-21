import { Ear, Music2, Volume1, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SectionHeader } from '../components/SectionHeader'
import { ParenteseChart } from '../components/charts'

interface InfoCard {
  Icon: LucideIcon
  iconClass: string
  title: string
  text: string
}

const cards: InfoCard[] = [
  {
    Icon: Music2,
    iconClass: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300',
    title: 'Role of Music & Singing',
    text: 'Soft lullabies and rhythmic tunes activate auditory-motor networks simultaneously. Studies show live singing by caregivers reduces infant heart rate and cortisol levels more effectively than spoken voice alone.',
  },
  {
    Icon: Volume1,
    iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    title: 'Acoustic Safety Rules',
    text: 'Keep music and environment sound below 60 decibels (about conversational volume). Continuous loud background audio disrupts phoneme discrimination and creates sensory fatigue.',
  },
  {
    Icon: Ear,
    iconClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    title: 'Phonetic Discrimination',
    text: 'Newborns are born "citizens of the world," able to distinguish all 800+ human language sounds. Parentese elongates vowel formants, allowing the brain to map native phonetic categories quickly.',
  },
]

export function LanguageMusic() {
  return (
    <section id="language-music">
      <SectionHeader
        module={3}
        title="Acoustic Scaffolding: Parentese & Musical Stimuli"
        description='Infant-directed speech ("Parentese") and rhythmic melody act as acoustic scaffolding for language processing and neuro-auditory mapping.'
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardContent>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[15px] font-semibold text-foreground">
                  Acoustic Architecture Comparison
                </p>
                <div className="text-xs text-muted-foreground">
                  Standard Adult Speech vs. Parentese Speech Profile
                </div>
              </div>
              <Badge className="shrink-0 bg-fuchsia-100 text-fuchsia-700 border-transparent dark:bg-fuchsia-500/15 dark:text-fuchsia-300">
                Language Acquisition
              </Badge>
            </div>
            <ParenteseChart />
            <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <strong className="text-foreground">Note on Parentese:</strong> Parentese is{' '}
              <em>not</em> baby talk or nonsensical words. It uses real grammar and vocabulary spoken
              at a higher pitch, slower tempo, with exaggerated vowel sounds ("Heeellloo baby!").
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-5">
          {cards.map(({ Icon, iconClass, title, text }) => (
            <Card key={title}>
              <CardContent>
                <div className="flex items-start gap-3">
                  <span className={`inline-flex shrink-0 rounded-xl p-2.5 ${iconClass}`}>
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <div>
                    <p className="m-0 font-semibold text-foreground">{title}</p>
                    <p className="mt-1 mb-0 text-[13px] text-muted-foreground">{text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
