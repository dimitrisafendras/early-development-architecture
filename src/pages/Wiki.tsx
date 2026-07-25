import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Eyebrow } from '../components/Eyebrow'
import { IconChip } from '../components/IconChip'
import { PageFrame } from '../components/PageFrame'
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
    <PageFrame
      title={t.wiki.title}
      description={t.wiki.subtitle}
      // The eyebrow pill stays in the header row as trailing content — the same
      // slot every other route uses for a badge. Above the title it would push
      // the H2 down and break the cross-route alignment this frame exists for.
      // Same `Badge` as `AgeBadge`, so the header's trailing slot has one shape
      // across routes. It used to be an 11px bordered pill here and a 12px
      // borderless one on /tracker.
      aside={
        <Badge variant="soft" className="uppercase tracking-[0.16em]">
          <Sparkles aria-hidden /> {t.wiki.eyebrow}
        </Badge>
      }
    >
      <div className="flex flex-col gap-12">
        {learnGroups.map((group, i) => (
          <Chapter key={group} group={group} number={i + 1} />
        ))}
      </div>
    </PageFrame>
  )
}

function Chapter({ group, number }: { group: TopicGroup; number: number }) {
  const t = useT()
  const Icon = groupMeta[group].icon
  const topics = wikiTopicsInGroup(group)
  return (
    <section aria-labelledby={`chapter-${group}`}>
      <div className="flex items-center gap-3">
        {/* `text-3xl font-semibold`: at `text-4xl font-bold` this numeral was the
            same size as the page `h1` from `sm` up and the only `font-bold`
            heading in the app, so a chapter marker outweighed the page title. */}
        <span className="bg-gradient-to-b from-primary/45 to-primary/5 bg-clip-text font-heading text-3xl font-semibold leading-none tabular-nums text-transparent">
          {String(number).padStart(2, '0')}
        </span>
        <IconChip>
          <Icon />
        </IconChip>
        <div className="min-w-0">
          <Eyebrow tone="muted">{t.wiki.chapter}</Eyebrow>
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

      {/* Reaches 4-up at `lg`, the same step every stat row uses
          (`WidgetStatGrid`). It used to hold 3-up until `xl`, so on a 1024–1280px
          screen the topic grid and the stat grids disagreed about their column
          count on the same page width. */}
      <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {topics.map((topic) => {
          const TopicIcon = topic.icon
          return (
            <li key={topic.slug}>
              <Link
                to={wikiPath(topic.slug)}
                className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
              >
                {/* The hover affordance is a *ring*, not a border: `Card` has no
                    border-width, so the `group-hover:border-primary/50` this used
                    to carry never rendered and only the shadow moved. */}
                <Card className="relative h-full overflow-hidden bg-gradient-to-br from-card to-muted/30 transition-[transform,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:ring-primary/50 group-hover:shadow-[0_14px_44px_-16px] group-hover:shadow-primary/40">
                  {/* Corner glow on hover. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-primary/25 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <CardContent className="relative flex h-full flex-col">
                    <div className="flex items-center gap-2.5">
                      <IconChip size="sm" className="transition-transform duration-300 group-hover:scale-110">
                        <TopicIcon />
                      </IconChip>
                      <p className="text-[15px] font-semibold leading-tight text-foreground">
                        {topic.label(t)}
                      </p>
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
