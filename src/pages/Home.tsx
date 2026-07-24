import { Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck } from 'lucide-react'
import { Hero } from '../components/Hero'
import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { learnGroups, groupMeta, groupPath, topicsInGroup, type TopicGroup } from '../sections/registry'
import { useT } from '../i18n'

/**
 * Landing hub, split into two zones:
 * - Your day: a prominent card into the /daily dashboard (the do-it-now surface)
 * - Learn: one card per theme group, each opening a combined /learn/:group page
 */
export default function Home() {
  const t = useT()
  return (
    <>
      <Hero />
      <NavBar />
      <main className="mx-auto w-full max-w-7xl px-6 py-14">
        {/* Your day */}
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {t.hub.yourDay}
        </p>
        <Link
          to="/daily"
          className="group mb-12 block rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-primary/5 p-6 outline-none transition-[border-color,box-shadow] hover:border-primary/50 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring/70 sm:p-8"
        >
          <div className="flex items-center gap-5">
            <span className="inline-flex shrink-0 rounded-2xl bg-primary/15 p-3.5 text-primary">
              <CalendarCheck className="size-7" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
                {t.hub.dailyCardTitle}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t.hub.dailyCardBlurb}
              </p>
            </div>
            <ArrowRight className="size-6 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Learn */}
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {t.hub.learn}
          </p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t.hub.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t.hub.subtitle}</p>
        </div>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {learnGroups.map((group) => (
            <li key={group}>
              <GroupCard group={group} />
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  )
}

function GroupCard({ group }: { group: TopicGroup }) {
  const t = useT()
  const Icon = groupMeta[group].icon
  const topics = topicsInGroup(group)
  return (
    <Link
      to={groupPath(group)}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
    >
      <Card className="h-full transition-[transform,box-shadow,border-color] group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-lg">
        <CardContent className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <span className="inline-flex rounded-xl bg-primary/10 p-2.5 text-primary">
              <Icon className="size-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {topics.length} {t.hub.topicsCount}
            </span>
          </div>
          <p className="mt-4 text-lg font-semibold text-foreground">{t.hub.groups[group]}</p>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {t.hub.groupBlurbs[group]}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {topics.map((topic) => (
              <span key={topic.slug} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {topic.label(t)}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
