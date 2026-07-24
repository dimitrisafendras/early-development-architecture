import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Hero } from '../components/Hero'
import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { groupOrder, topicsInGroup, topicPath, type Topic } from '../sections/registry'
import { useT } from '../i18n'

/**
 * Landing hub. Instead of stacking all seven modules on one long scroll, the
 * home route is an overview grid — one card per topic — that routes into a
 * focused single-topic page (`/topic/:slug`).
 */
export default function Home() {
  const t = useT()
  return (
    <>
      <Hero />
      <NavBar />
      <main className="mx-auto w-full max-w-7xl px-6 py-14">
        <div className="mb-10 max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {t.hub.eyebrow}
          </p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t.hub.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t.hub.subtitle}</p>
        </div>

        <div className="flex flex-col gap-12">
          {groupOrder.map((group) => (
            <section key={group}>
              <h3 className="mb-5 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <span className="text-foreground">{t.hub.groups[group]}</span>
                <span className="h-px flex-1 bg-border" />
              </h3>
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {topicsInGroup(group).map((topic) => (
                  <li key={topic.slug}>
                    <TopicCard topic={topic} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}

function TopicCard({ topic }: { topic: Topic }) {
  const t = useT()
  const Icon = topic.icon
  return (
    <Link
      to={topicPath(topic.slug)}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
    >
      <Card className="h-full transition-[transform,box-shadow,border-color] group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-lg">
        <CardContent className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <span className="inline-flex rounded-xl bg-primary/10 p-2.5 text-primary">
              <Icon className="size-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {t.common.module} {topic.module}
            </span>
          </div>
          <p className="mt-4 text-lg font-semibold text-foreground">{topic.label(t)}</p>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {topic.blurb(t)}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            {t.hub.open}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}
