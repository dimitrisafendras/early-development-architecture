import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, LayoutGrid } from 'lucide-react'
import { topics, topicPath, findTopic } from '../sections/registry'
import { useT } from '../i18n'

/**
 * A single infographic topic on its own route. Renders the matching section
 * standalone plus a prev/next pager, so a caregiver reads one focused module
 * at a time rather than the full scroll.
 */
export default function Topic() {
  const { slug } = useParams()
  const t = useT()
  const topic = findTopic(slug)

  // Reset scroll when moving between topics (client-side nav keeps the scroll
  // position otherwise, landing the reader mid-page).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!topic) return <Navigate to="/" replace />

  const index = topics.indexOf(topic)
  const prev = index > 0 ? topics[index - 1] : undefined
  const next = index < topics.length - 1 ? topics[index + 1] : undefined
  const Section = topic.Component

  return (
    <>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 page-px py-10">
        <Link
          to="/"
          className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground sm:min-h-9 transition-colors outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/70"
        >
          <LayoutGrid className="size-4" />
          {t.hub.back}
        </Link>

        <Section />

        <nav
          aria-label={t.nav.sections}
          className="grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-2"
        >
          {prev ? (
            <PagerLink topic={prev} direction="prev" label={t.hub.prev} labelFn={prev.label(t)} />
          ) : (
            <span />
          )}
          {next && (
            <PagerLink
              topic={next}
              direction="next"
              label={t.hub.next}
              labelFn={next.label(t)}
              alignEnd
            />
          )}
        </nav>
      </main>
    </>
  )
}

interface PagerLinkProps {
  topic: (typeof topics)[number]
  direction: 'prev' | 'next'
  label: string
  labelFn: string
  alignEnd?: boolean
}

function PagerLink({ topic, direction, label, labelFn, alignEnd }: PagerLinkProps) {
  const isPrev = direction === 'prev'
  return (
    <Link
      to={topicPath(topic.slug)}
      className={`group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground transition-[border-color,box-shadow] outline-none hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/70 ${
        alignEnd ? 'sm:text-right' : ''
      } ${isPrev ? '' : 'sm:col-start-2'}`}
    >
      {isPrev && (
        <ArrowLeft className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
      )}
      <span className={`min-w-0 flex-1 ${alignEnd ? 'sm:order-1' : ''}`}>
        <span className="block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <span className="mt-0.5 block truncate font-semibold text-foreground">{labelFn}</span>
      </span>
      {!isPrev && (
        <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:order-2" />
      )}
    </Link>
  )
}
