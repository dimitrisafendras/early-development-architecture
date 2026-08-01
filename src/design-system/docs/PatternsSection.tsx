import { Gauge, PenLine, BookOpen } from 'lucide-react'

import { DocSection, DocBlock, Panel, DoDont } from './primitives'

const tiers = [
  {
    icon: Gauge,
    n: '1',
    name: 'Glance — the four quick tiles',
    slot: 'glance',
    body: 'The answer to "where am I right now?" in one glance: a WidgetStatGrid of StatTiles, and nothing else. Read-only. No hero visuals, no forms, no history, no charts — the tiles are all that may stand above the input.',
  },
  {
    icon: PenLine,
    n: '2',
    name: 'Input — the one thing you came to do',
    slot: 'input',
    body: 'Start the timer, log the feed, add the measurement. Sits directly under the tiles, reachable without scrolling. Its tier eyebrow names the action, so the card inside carries no title of its own — and a hero visual that belongs with the action (the tracker session bar) lives inside this card, with its control.',
  },
  {
    icon: BookOpen,
    n: '3',
    name: 'Detail — extensive info',
    slot: 'detail',
    body: 'History lists, charts, guidance, profile editing and destructive actions. Everything you read rather than answer. Opens with a hairline rule so scrolling into it feels like entering reference material.',
  },
]

const pages = [
  {
    route: '/tracker',
    glance: '4 stat tiles',
    input: 'Timer console — ring + start / stop',
    detail: 'Session history · 7-day chart',
  },
  {
    route: '/feed',
    glance: '4 stat tiles',
    input: 'Today vs typical + log a feed',
    detail: "Today's feeds · 7-day chart",
  },
  {
    route: '/baby',
    glance: 'Age, weight, height, name tiles',
    input: 'Add measurement',
    detail: 'Growth charts · measurements · profile & delete',
  },
]

export function PatternsSection() {
  return (
    <DocSection
      id="patterns"
      eyebrow="Patterns"
      title="Widget pages: glance → input → detail"
      intro="Any page whose job is “check one thing, then record one thing” is a widget page, and a widget page always reads top-to-bottom in the same three tiers. The parent arrives mid-task with one hand free: they need the current state instantly, the control immediately after it, and the reference material only when they go looking for it."
    >
      <DocBlock title="The three tiers" description="Fixed order. Any tier may be omitted; none may be reordered.">
        <div className="grid gap-4 sm:grid-cols-3">
          {tiers.map((tier) => {
            const Icon = tier.icon
            return (
              <Panel key={tier.slot}>
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/25 to-primary/5 font-heading text-sm font-semibold text-primary ring-1 ring-inset ring-primary/20">
                    {tier.n}
                  </span>
                  <Icon className="size-5 text-primary" aria-hidden />
                </div>
                <h4 className="mt-3 font-heading text-base font-semibold">{tier.name}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tier.body}</p>
                <code className="mt-3 inline-block rounded bg-muted px-1.5 py-0.5 text-xs">{tier.slot}</code>
              </Panel>
            )
          })}
        </div>
      </DocBlock>

      <DocBlock
        title="The rule has teeth"
        description="The order is enforced by the component, not by convention."
      >
        <Panel>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">WidgetPage</code> takes the tiers as
            slot props — <code className="rounded bg-muted px-1.5 py-0.5 text-xs">glance</code>,{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">input</code>,{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">detail</code> — rather than as children,
            so a page physically cannot render its form above its summary. Its own contribution is just the
            tiers: the eyebrow over each one, the{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">gap-4</code> inside them, and the hairline
            rule opening the detail tier. The frame itself — width, gutter, padding, block gap, header — is
            delegated to <code className="rounded bg-muted px-1.5 py-0.5 text-xs">PageFrame</code> (see{' '}
            <a href="#shell" className="font-medium text-primary hover:underline">
              Shell
            </a>
            ), and the background belongs to the shell's single{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">AuroraBackground</code> — a widget page
            adds no glow of its own.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Loading skeletons, sign-in gating and first-run forms precede the rhythm rather than sitting inside
            it, so they go in <code className="rounded bg-muted px-1.5 py-0.5 text-xs">children</code>. A
            context switcher (which baby) goes in{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">toolbar</code>.
          </p>
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="font-heading text-sm font-semibold">Inside a tier</p>
              <p className="mt-1 text-muted-foreground">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">WidgetStatGrid</code> for the stat
                row, <code className="rounded bg-muted px-1.5 py-0.5 text-xs">WidgetCard</code> for a titled
                block, <code className="rounded bg-muted px-1.5 py-0.5 text-xs">WidgetSplit</code> for a list
                beside its chart.
              </p>
            </div>
            <div>
              <p className="font-heading text-sm font-semibold">Still the DS underneath</p>
              <p className="mt-1 text-muted-foreground">
                Tiers are opaque content surfaces — shadcn <code className="rounded bg-muted px-1.5 py-0.5 text-xs">Card</code>,
                never the glass material. Glass stays in the floating nav layer above the page.
              </p>
            </div>
          </div>
        </Panel>
      </DocBlock>

      <DocBlock
        title="Folding sections"
        description="CollapsibleSection — a titled block on a long page that folds away. Open/closed is the caller's state because the store persists it, so a section a caregiver works with folded stays folded next visit. The whole header is the control, not just the chevron, and folded content is unmounted rather than hidden."
      >
        <Panel>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Used on <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/schedule</code>, which
            grew four stacked sections open at once. Resolve the default with{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">useSectionOpen(key, defaultOpen)</code>{' '}
            rather than seeding the store — a section can change its default later without a
            migration, and without overriding anyone who has already chosen. The setter takes the new
            value rather than toggling, because a section that defaults to <em>open</em> has no key
            until first use and <code className="rounded bg-muted px-1.5 py-0.5 text-xs">!undefined</code>{' '}
            would resolve to <code className="rounded bg-muted px-1.5 py-0.5 text-xs">true</code>.
          </p>
        </Panel>
      </DocBlock>

      <DocBlock
        title="Day shape: stripe + counts"
        description="DayShapeBar draws a day as one pill per moment in its activity's colour; DayShapeSummary states the same day as counts. They ship as a pair on purpose."
      >
        <Panel>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The stripe is an impression — where the sleeps fall, how the feeds thin out — and each
            pill names itself on hover. Hover is a mouse affordance, so the bar stays{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">aria-hidden</code> and the
            summary carries the same information as text. Never ship the stripe alone, and never
            draw it twice for the same day on one screen.
          </p>
        </Panel>
      </DocBlock>

      <DocBlock
        title="Age axis (day programs)"
        description="Contiguous, non-overlapping spans over the first three years are drawn as one proportional bar, not a grid of cards."
      >
        <Panel>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A card grid made the reader rebuild the timeline from nine start ages. Segments grow by
            the months they cover, uncovered stretches are drawn dashed (a gap in cover is
            information — the app falls back to the built-in day there), and a marker sits on the
            line at the child's own age. The axis scrolls inside itself below{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">lg</code>; the shell must never
            scroll sideways.
          </p>
        </Panel>
      </DocBlock>

      <DocBlock
        title="How the app applies it"
        description="The three widget pages, tier by tier. / (the Day dashboard) and /schedule are not widget pages — they are a dashboard and an editor, and they use PageFrame directly."
      >
        <Panel flush className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Page', '1 · Glance', '2 · Input', '3 · Detail'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.route} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{p.route}</code>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{p.glance}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.input}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </DocBlock>

      <DocBlock title="Do & Don't">
        <DoDont
          dos={[
            'Build every logging page with WidgetPage and its three slots.',
            'Keep the glance to the four tiles — read-only state, nothing else.',
            'Let the input tier eyebrow name the action; leave its card untitled.',
            'Put charts, history and destructive actions in the detail tier.',
            'Use children only for loading, gated and first-run states.',
          ]}
          donts={[
            'Hand-roll the page frame (max-width, padding, header) per page.',
            'Put a chart, hero visual or history list above the input.',
            'Bury the primary action below reference material.',
            'Title the input card and its tier eyebrow with the same words.',
            'Use the glass material for any of the three tiers.',
          ]}
        />
      </DocBlock>
    </DocSection>
  )
}
