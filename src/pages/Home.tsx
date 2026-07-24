import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, GripVertical } from 'lucide-react'
import { Hero } from '../components/Hero'
import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  groupOrder,
  topicsInGroup,
  topicPath,
  type Topic,
  type TopicGroup,
} from '../sections/registry'
import { useAppStore } from '../store'
import { useT } from '../i18n'

/**
 * Landing hub — an overview grid, one card per topic, grouped by theme and
 * routing into a focused single-topic page (`/topic/:slug`). Cards can be
 * dragged to reorder within their group; the order persists per browser.
 */
export default function Home() {
  const t = useT()
  const cardOrder = useAppStore((s) => s.cardOrder)
  const setCardOrder = useAppStore((s) => s.setCardOrder)
  const [dragSlug, setDragSlug] = useState<string | null>(null)
  const [overSlug, setOverSlug] = useState<string | null>(null)

  const orderIndex = (slug: string) => {
    const i = cardOrder.indexOf(slug)
    return i === -1 ? Infinity : i
  }
  // Topics of a group, sorted by the saved order (stable → registry order when
  // a slug isn't in cardOrder yet, e.g. a newly added topic).
  const orderedGroup = (group: TopicGroup): Topic[] =>
    topicsInGroup(group)
      .map((topic, i) => ({ topic, i }))
      .sort((a, b) => orderIndex(a.topic.slug) - orderIndex(b.topic.slug) || a.i - b.i)
      .map((x) => x.topic)

  /** Move dragSlug to sit before targetSlug within the same group; persist. */
  function reorder(group: TopicGroup, targetSlug: string) {
    if (!dragSlug || dragSlug === targetSlug) return
    const slugs = orderedGroup(group).map((tp) => tp.slug)
    if (!slugs.includes(dragSlug) || !slugs.includes(targetSlug)) return // different group
    const without = slugs.filter((s) => s !== dragSlug)
    const at = without.indexOf(targetSlug)
    without.splice(at, 0, dragSlug)
    // Rebuild a full canonical order across every group so it round-trips.
    const next = groupOrder.flatMap((g) =>
      g === group ? without : orderedGroup(g).map((tp) => tp.slug),
    )
    setCardOrder(next)
  }

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
                <span className="hidden shrink-0 text-[11px] font-medium normal-case tracking-normal text-muted-foreground/70 sm:inline">
                  {t.hub.reorderHint}
                </span>
              </h3>
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {orderedGroup(group).map((topic) => (
                  <li
                    key={topic.slug}
                    draggable
                    onDragStart={() => setDragSlug(topic.slug)}
                    onDragEnd={() => {
                      setDragSlug(null)
                      setOverSlug(null)
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      if (topic.slug !== overSlug) setOverSlug(topic.slug)
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      reorder(group, topic.slug)
                      setDragSlug(null)
                      setOverSlug(null)
                    }}
                    className={cn(
                      'transition-opacity',
                      dragSlug === topic.slug && 'opacity-40',
                      overSlug === topic.slug && dragSlug && dragSlug !== topic.slug
                        ? 'rounded-xl ring-2 ring-primary/50'
                        : '',
                    )}
                  >
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
    <div className="group relative h-full">
      {/* Drag affordance (whole card is draggable via the <li>). */}
      <span
        className="pointer-events-none absolute right-3 top-3 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground"
        aria-hidden
      >
        <GripVertical className="size-4" />
      </span>
      <Link
        to={topicPath(topic.slug)}
        draggable={false}
        className="block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
      >
        <Card className="h-full transition-[transform,box-shadow,border-color] group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-lg">
          <CardContent className="flex h-full flex-col">
            <div className="flex items-center justify-between">
              <span className="inline-flex rounded-xl bg-primary/10 p-2.5 text-primary">
                <Icon className="size-5" />
              </span>
              <span className="mr-6 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
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
    </div>
  )
}
