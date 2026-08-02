import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Baby as BabyIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Eyebrow } from '../components/Eyebrow'
import { IconChip } from '../components/IconChip'
import { PageFrame } from '../components/PageFrame'
import {
  ageGroupOrder,
  ageGroupMeta,
  ageGroupForMonths,
  wikiTopicsFiledIn,
  wikiTopicsAlsoIn,
  wikiPath,
  type AgeGroup,
} from '../sections/registry'
import { useBabyAge } from '../components/AgeBadge'
import { useT } from '../i18n'

/**
 * The Wiki home: every topic organized into chapters by the child's stage
 * (Newborn / Baby / Toddler, then the cross-cutting "any age" chapter). Each
 * chapter lists its topics as cards that open a focused subpage at
 * `/wiki/:slug`.
 *
 * **A topic appears once as a card, and as a line thereafter.** Care topics
 * apply across stages, and this page used to draw a full card in every chapter a
 * topic's `ages` named — five of the thirteen name three, so the hub carried 24
 * cards for 13 topics and roughly half its height was the same five cards again
 * with identical label, blurb, icon and "Read →". The card now sits in the
 * topic's own chapter and the later ones carry a one-line row, which keeps every
 * topic findable from the stage you are in without saying it three times.
 *
 * The chapter matching the current baby's age is marked the same way every
 * age-banded row in the app is: a `ring-2 ring-primary` on the chapter mark plus
 * the standard `soft` badge — not a bespoke highlight component.
 */
export default function Wiki() {
  const t = useT()
  // One hook call for the page, then passed down: `Chapter` renders four times
  // and each instance would otherwise re-subscribe to the baby list.
  const baby = useBabyAge()
  const activeAge = baby ? ageGroupForMonths(baby.months) : undefined
  return (
    <PageFrame
      title={t.wiki.title}
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
        {ageGroupOrder.map((age, i) => (
          <Chapter key={age} age={age} number={i + 1} active={age === activeAge} />
        ))}
      </div>
    </PageFrame>
  )
}

function Chapter({ age, number, active }: { age: AgeGroup; number: number; active: boolean }) {
  const t = useT()
  const Icon = ageGroupMeta[age].icon
  const chapter = t.hub.ageGroups[age]
  const filed = wikiTopicsFiledIn(age)
  const also = wikiTopicsAlsoIn(age)
  return (
    <section aria-labelledby={`chapter-${age}`}>
      <div className="flex items-center gap-3">
        {/* `text-3xl font-semibold`: at `text-4xl font-bold` this numeral was the
            same size as the page `h1` from `sm` up and the only `font-bold`
            heading in the app, so a chapter marker outweighed the page title. */}
        <span className="bg-gradient-to-b from-primary/45 to-primary/5 bg-clip-text font-heading text-3xl font-semibold leading-none tabular-nums text-transparent">
          {String(number).padStart(2, '0')}
        </span>
        <IconChip className={active ? 'ring-2 ring-primary' : undefined}>
          <Icon />
        </IconChip>
        <div className="min-w-0">
          <Eyebrow tone="muted">
            {t.wiki.chapter} · {chapter.label}
          </Eyebrow>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2
              id={`chapter-${age}`}
              className="truncate font-heading text-xl font-semibold tracking-tight text-foreground"
            >
              {chapter.title}
            </h2>
            {active && (
              <Badge variant="soft" size="sm">
                <BabyIcon aria-hidden /> {t.hub.ageMatch}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {chapter.blurb}
      </p>
      <div className="mt-4 h-px w-full bg-gradient-to-r from-primary/40 via-border to-transparent" />

      {/* Reaches 4-up at `lg`, the same step every stat row uses
          (`WidgetStatGrid`). It used to hold 3-up until `xl`, so on a 1024–1280px
          screen the topic grid and the stat grids disagreed about their column
          count on the same page width. */}
      {filed.length > 0 && (
      <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filed.map((topic) => {
          const TopicIcon = topic.icon
          return (
            <li key={topic.slug}>
              <Link
                to={wikiPath(topic.slug)}
                className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
              >
                {/* **One hover affordance, not five.** The card carried a
                    gradient fill, a corner glow, a ring, a shadow and a lift, all
                    saying the same thing — and a grid of them is a grid of
                    gradients before it is a list of topics. The ring and the
                    shadow stay, because a hover state has to be visible; the rest
                    was decoration on a surface whose job is to hold a title and
                    two lines. */}
                <Card className="h-full transition-[box-shadow] duration-300 group-hover:ring-primary/50 group-hover:shadow-[0_10px_32px_-18px] group-hover:shadow-primary/40">
                  <CardContent className="flex h-full flex-col">
                    <div className="flex items-center gap-2.5">
                      <IconChip size="sm">
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
      )}

      {/* Carried over from an earlier chapter: the same destination, at the
          weight of a cross-reference rather than of a new topic.
          The label only appears when there are cards above it to distinguish
          these from — a stage that introduces no new topic (nothing about
          bathing changes at three months that bathing's own page does not
          already cover) is simply a chapter of cross-references, and labelling
          the only list on it "also applies here" would be answering a question
          nobody had asked. */}
      {also.length > 0 && (
        <>
          {filed.length > 0 && (
            <Eyebrow tone="muted" className="mt-6 mb-2">
              {t.wiki.alsoApplies}
            </Eyebrow>
          )}
          <ul className="mt-5 flex flex-wrap gap-2">
            {also.map((topic) => {
              const TopicIcon = topic.icon
              return (
                <li key={topic.slug}>
                  <Link
                    to={wikiPath(topic.slug)}
                    className="flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-[13px] font-medium text-foreground transition-colors outline-none hover:border-ring hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/70"
                  >
                    <TopicIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    {topic.label(t)}
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}
