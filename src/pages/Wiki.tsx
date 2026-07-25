import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  learnGroups,
  groupMeta,
  wikiTopicsInGroup,
  wikiPath,
  type TopicGroup,
} from '../sections/registry'
import { useT } from '../i18n'

/**
 * The Wiki home: every theory topic organized into chapters by theme
 * (Foundations / Connection / Rhythm). Each chapter lists its topics as cards
 * that open a focused subpage at `/wiki/:slug`.
 */
export default function Wiki() {
  const t = useT()
  return (
    <main className="relative mx-auto w-full max-w-6xl page-px py-12">
      {/* Soft brand glow behind the header. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-10 -z-10 mx-auto h-64 max-w-3xl rounded-full bg-primary/15 opacity-60 blur-3xl"
      />

      <header className="max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          <Sparkles className="size-3.5" /> {t.wiki.eyebrow}
        </span>
        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-transparent">
            {t.wiki.title}
          </span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t.wiki.subtitle}</p>
      </header>

      <div className="mt-12 flex flex-col gap-12">
        {learnGroups.map((group, i) => (
          <Chapter key={group} group={group} number={i + 1} />
        ))}
      </div>
    </main>
  )
}

function Chapter({ group, number }: { group: TopicGroup; number: number }) {
  const t = useT()
  const Icon = groupMeta[group].icon
  const topics = wikiTopicsInGroup(group)
  return (
    <section aria-labelledby={`chapter-${group}`}>
      <div className="flex items-center gap-3">
        <span className="bg-gradient-to-b from-primary/45 to-primary/5 bg-clip-text font-heading text-4xl font-bold leading-none tabular-nums text-transparent">
          {String(number).padStart(2, '0')}
        </span>
        <span className="inline-flex shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-2.5 text-primary ring-1 ring-inset ring-primary/20">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t.wiki.chapter}
          </p>
          <h2
            id={`chapter-${group}`}
            className="truncate font-heading text-xl font-semibold tracking-tight text-foreground"
          >
            {t.hub.groups[group]}
          </h2>
        </div>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {t.hub.groupBlurbs[group]}
      </p>
      <div className="mt-4 h-px w-full bg-gradient-to-r from-primary/40 via-border to-transparent" />

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {topics.map((topic) => {
          const TopicIcon = topic.icon
          return (
            <li key={topic.slug}>
              <Link
                to={wikiPath(topic.slug)}
                className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
              >
                <Card className="relative h-full overflow-hidden border-border/70 bg-gradient-to-br from-card to-muted/30 transition-[transform,box-shadow,border-color] duration-300 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-[0_14px_44px_-16px] group-hover:shadow-primary/40">
                  {/* Corner glow on hover. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-primary/25 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <CardContent className="relative flex h-full flex-col p-4">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex shrink-0 rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 p-2 text-primary ring-1 ring-inset ring-primary/20 transition-transform duration-300 group-hover:scale-110">
                        <TopicIcon className="size-4" />
                      </span>
                      <p className="font-semibold leading-tight text-foreground">{topic.label(t)}</p>
                    </div>
                    <p className="mt-2 line-clamp-2 flex-1 text-[13px] leading-relaxed text-muted-foreground">
                      {topic.blurb(t)}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-primary">
                      {t.wiki.readTopic}
                      <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
