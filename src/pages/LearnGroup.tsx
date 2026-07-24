import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { LayoutGrid, ArrowLeft, ArrowRight } from 'lucide-react'
import {
  learnGroups,
  groupMeta,
  groupPath,
  topicsInGroup,
  isLearnGroup,
} from '../sections/registry'
import { useT } from '../i18n'

/**
 * A whole theme group on one page: its topics stacked with an "on this page"
 * jump nav, plus prev/next between groups. Each topic is wrapped in an element
 * id'd by its slug so the jump links and deep links resolve regardless of the
 * section component's own internal id.
 */
export default function LearnGroup() {
  const { group } = useParams()
  const t = useT()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [group])

  if (!isLearnGroup(group)) return <Navigate to="/" replace />

  const topics = topicsInGroup(group)
  const Icon = groupMeta[group].icon
  const index = learnGroups.indexOf(group)
  const prev = index > 0 ? learnGroups[index - 1] : undefined
  const next = index < learnGroups.length - 1 ? learnGroups[index + 1] : undefined

  return (
    <>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/70"
        >
          <LayoutGrid className="size-4" />
          {t.hub.back}
        </Link>

        {/* Group header */}
        <div className="max-w-3xl">
          <span className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
            <Icon className="size-6" />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {t.hub.learn}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t.hub.groups[group]}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {t.hub.groupBlurbs[group]}
          </p>
        </div>

        {/* On this page — jump nav */}
        <nav aria-label={t.hub.onThisPage} className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.hub.onThisPage}:
          </span>
          {topics.map((topic) => (
            <a
              key={topic.slug}
              href={`#${topic.slug}`}
              className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {topic.label(t)}
            </a>
          ))}
        </nav>

        {/* Stacked topics */}
        <div className="flex flex-col gap-16">
          {topics.map((topic) => {
            const Section = topic.Component
            return (
              <div key={topic.slug} id={topic.slug} className="scroll-mt-28">
                <Section />
              </div>
            )
          })}
        </div>

        {/* Group pager */}
        <nav className="grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-2">
          {prev ? (
            <GroupPager group={prev} direction="prev" label={t.hub.prev} title={t.hub.groups[prev]} />
          ) : (
            <span />
          )}
          {next && (
            <GroupPager
              group={next}
              direction="next"
              label={t.hub.next}
              title={t.hub.groups[next]}
              alignEnd
            />
          )}
        </nav>
      </main>
    </>
  )
}

function GroupPager({
  group,
  direction,
  label,
  title,
  alignEnd,
}: {
  group: (typeof learnGroups)[number]
  direction: 'prev' | 'next'
  label: string
  title: string
  alignEnd?: boolean
}) {
  const isPrev = direction === 'prev'
  return (
    <Link
      to={groupPath(group)}
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
