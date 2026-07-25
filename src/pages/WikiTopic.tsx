import { useEffect } from 'react'
import { Link, Navigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronRight, BookOpen } from 'lucide-react'
import { PageFrame } from '../components/PageFrame'
import { wikiTopics, wikiPath, findTopic, groupOfTopic } from '../sections/registry'
import { useT } from '../i18n'

/**
 * A single Wiki topic on its own route (`/wiki/:slug`). Renders the matching
 * theory section standalone, with a breadcrumb back to the Wiki home and a
 * prev/next pager across the ordered list of Wiki topics.
 *
 * The page header is the frame's, not the section's: the topic's editorial title
 * and blurb go through `PageFrame` so this route's title sits at exactly the same
 * X and Y as every other route's. The sections themselves are pure content — they
 * no longer render a `SectionHeader`, and the long title they used to own now
 * lives on the registry entry as `title`. The breadcrumb goes in the `toolbar`
 * slot (under the header) for the same reason — above the title it pushed the
 * heading ~40px down and made this the one page whose title never lined up.
 */
export default function WikiTopic() {
  const { slug } = useParams()
  const { hash } = useLocation()
  const t = useT()
  const topic = findTopic(slug)

  // Reset scroll when moving between topics (client-side nav keeps the scroll
  // position otherwise). Skip when the URL carries a hash — the target section
  // scrolls to its own anchor.
  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [slug, hash])

  // Only real Wiki topics render here; promoted surfaces (full-day, action-items)
  // and unknown slugs bounce to the Wiki home.
  const index = topic ? wikiTopics.indexOf(topic) : -1
  if (!topic || index === -1) return <Navigate to="/wiki" replace />

  const prev = index > 0 ? wikiTopics[index - 1] : undefined
  const next = index < wikiTopics.length - 1 ? wikiTopics[index + 1] : undefined
  const group = groupOfTopic(topic.slug)
  const Section = topic.Component

  return (
    <PageFrame
      title={topic.title(t)}
      description={topic.blurb(t)}
      toolbar={
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
        >
          <Link
            to="/wiki"
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium transition-colors outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/70"
          >
            <BookOpen className="size-4" />
            {t.wiki.index}
          </Link>
          {group && (
            <>
              <ChevronRight className="size-3.5 shrink-0" aria-hidden />
              <span className="text-muted-foreground">{t.hub.groups[group]}</span>
            </>
          )}
          <ChevronRight className="size-3.5 shrink-0" aria-hidden />
          <span className="font-medium text-foreground">{topic.label(t)}</span>
        </nav>
      }
    >
      <Section />

      {/* Pager */}
      <nav
        aria-label={t.nav.sections}
        className="grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-2"
      >
        {prev ? (
          <PagerLink slug={prev.slug} title={prev.label(t)} label={t.hub.prev} direction="prev" />
        ) : (
          <span />
        )}
        {next && (
          <PagerLink
            slug={next.slug}
            title={next.label(t)}
            label={t.hub.next}
            direction="next"
            alignEnd
          />
        )}
      </nav>
    </PageFrame>
  )
}

function PagerLink({
  slug,
  title,
  label,
  direction,
  alignEnd,
}: {
  slug: string
  title: string
  label: string
  direction: 'prev' | 'next'
  alignEnd?: boolean
}) {
  const isPrev = direction === 'prev'
  return (
    <Link
      to={wikiPath(slug)}
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
        <span className="mt-0.5 block truncate font-semibold text-foreground">{title}</span>
      </span>
      {!isPrev && (
        <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:order-2" />
      )}
    </Link>
  )
}
