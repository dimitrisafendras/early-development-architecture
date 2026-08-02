import { PanelLeft, Smartphone, Sparkles, LayoutTemplate } from 'lucide-react'

import { DocSection, DocBlock, Panel, DoDont } from './primitives'

/** One row of the breakpoint table: what the shell looks like on each side of `xl`. */
const shellByBreakpoint = [
  {
    range: 'below xl (< 1280px)',
    nav: 'Floating NavBar (collapsed to a hamburger) + BottomNav tab bar',
    scroller: 'The document, which is what a phone expects',
    height: 'Grows with content',
  },
  {
    range: 'xl and up (1280px+)',
    nav: 'SideNav glass rail, icon-only by default, expandable to labelled rows',
    scroller: 'The content column (#app-scroll)',
    height: 'Exactly one viewport; the shell never scrolls itself',
  },
]

const frameContract = [
  {
    prop: 'max-width',
    value: 'max-w-6xl = 1152px',
    note: 'Every route. /signin and /signup are the one sanctioned exception (max-w-md).',
  },
  {
    prop: 'gutter',
    value: 'page-px = 12px, 16px from sm',
    note: 'A utility, so the gutter is identical on every route.',
  },
  {
    prop: 'vertical padding',
    value: 'py-6, py-10 from sm',
    note: '24px on a phone, 40px on a desktop.',
  },
  {
    prop: 'block gap',
    value: 'gap-6, gap-8 from sm',
    note: 'The space between the header, the toolbar and each page block.',
  },
  {
    prop: 'header',
    value: 'SectionHeader + optional aside',
    note: 'One h1 per route, at text-2xl / sm:text-4xl. Never hand-rolled.',
  },
  {
    prop: 'toolbar',
    value: 'Full-width row under the header',
    note: 'Breadcrumbs, back-links, context switchers: anything that must not push the title down.',
  },
  {
    prop: 'fill',
    value: 'min-h-0 flex-1',
    note: 'Opt-in, for a dashboard that fills the scroll column instead of scrolling it.',
  },
]

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{children}</code>
)

export function ShellSection() {
  return (
    <DocSection
      id="shell"
      eyebrow="Shell"
      title="One shell, one frame, one background"
      intro="Everything a route renders sits inside three things it does not own: the navigation shell, the page frame, and the aurora behind both. A page that reaches for any of them itself is the single most reliable way to make this app look like two apps."
    >
      <DocBlock
        title="Two navigation forms, one per breakpoint"
        description="Not a responsive rearrangement of one bar. Two different components, and only ever one of them on screen."
      >
        <Panel flush className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Width', 'Navigation', 'What scrolls', 'Shell height'].map((h) => (
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
              {shellByBreakpoint.map((r) => (
                <tr key={r.range} className="border-b border-border align-top last:border-0">
                  <td className="px-5 py-3">
                    <Code>{r.range}</Code>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{r.nav}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.scroller}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.height}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Panel>
            <PanelLeft className="size-5 text-primary" aria-hidden />
            <h4 className="mt-3 font-heading text-base font-semibold">SideNav, the rail</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Glass material, because it is the floating control layer. Collapsed to icons by default; the
              expanded/collapsed choice persists in the store as <Code>navCollapsed</Code>. Its sibling column
              carries <Code>min-w-0</Code> so a wide table or chart can never push the rail off-screen.
            </p>
          </Panel>
          <Panel>
            <Smartphone className="size-5 text-primary" aria-hidden />
            <h4 className="mt-3 font-heading text-base font-semibold">NavBar + BottomNav</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Below <Code>xl</Code>, primary navigation moves to a thumb-reachable tab bar.{' '}
              <Code>pb-bottom-nav</Code> reserves its height plus the home-indicator inset so the last card on
              every page clears it, and collapses to nothing from <Code>xl</Code> up.
            </p>
          </Panel>
          <Panel>
            <LayoutTemplate className="size-5 text-primary" aria-hidden />
            <h4 className="mt-3 font-heading text-base font-semibold">The fixed-height shell</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              From <Code>xl</Code> the shell is <Code>h-svh overflow-hidden</Code> and the content column
              scrolls instead. A dashboard therefore keeps a stable height and scrolls <em>inside its cards</em>;
              a long document scrolls the column. Anything that resets or measures scroll must handle{' '}
              <Code>#app-scroll</Code>, not just <Code>window</Code>.
            </p>
          </Panel>
        </div>
      </DocBlock>

      <DocBlock
        title="PageFrame, the one page frame"
        description="Every route renders exactly one PageFrame as its main element. WidgetPage is built on top of it, not beside it."
      >
        <Panel flush className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Owns', 'Value', 'Why'].map((h) => (
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
              {frameContract.map((r) => (
                <tr key={r.prop} className="border-b border-border align-top last:border-0">
                  <td className="px-5 py-3 font-medium text-foreground">{r.prop}</td>
                  <td className="px-5 py-3">
                    <Code>{r.value}</Code>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel className="mt-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            <strong className="font-semibold text-foreground">
              Why it is a component and not a convention.
            </strong>{' '}
            An alignment audit found every route hand-rolling its own <Code>main</Code> element: widths from{' '}
            <Code>max-w-3xl</Code> to <Code>max-w-7xl</Code>, padding from <Code>py-10</Code> to{' '}
            <Code>py-12</Code>, gaps from <Code>gap-6</Code> to <Code>gap-10</Code>, and half of them writing
            their own heading. The left edge of titles and cards moved by up to 256px between routes, and no two
            page titles sat at the same Y. If the frame needs a new capability it is added here, which is why{' '}
            <Code>fill</Code> exists instead of one page keeping a private <Code>main</Code>.
          </p>
        </Panel>
      </DocBlock>

      <DocBlock title="AuroraBackground" description="Mounted once, in the shell. Never per page.">
        <Panel>
          <Sparkles className="size-5 text-primary" aria-hidden />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A fixed, palette-tinted, slowly drifting aurora behind everything, derived from the palette tokens
            with a small per-field <Code>hue-rotate()</Code> so the fields stay analogous: blue fans to
            cyan/violet, orchid fans violet to orchid to pink to warm rose. The whole layer is dimmed to{' '}
            <Code>opacity-40</Code> in light and <Code>opacity-90</Code> in dark.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Two hard rules. A page must not add its own background glow: a per-page <Code>blur-3xl</Code>{' '}
            doubles up on this one and the two drift out of step. And nothing in the shell may create a
            containing block for <Code>position: fixed</Code>, so no <Code>transform</Code>,{' '}
            <Code>filter</Code> or <Code>contain</Code> on an ancestor, or the aurora silently starts scrolling
            with the content.
          </p>
        </Panel>
      </DocBlock>

      <DocBlock title="Do & Don't">
        <DoDont
          dos={[
            'Render exactly one PageFrame per route, as the page main element.',
            'Add a missing capability to PageFrame; every route then moves together.',
            'Use PageFrame’s fill prop for a dashboard that fills the scroll column.',
            'Reset and measure scroll on #app-scroll as well as window.',
            'Keep the glass material in the nav and control layer only.',
          ]}
          donts={[
            'Hand-roll a main element with your own max-width, padding or gap.',
            'Write a page h1 instead of passing title to the frame.',
            'Put a badge or breadcrumb above the title; use aside or toolbar.',
            'Add a per-page aura, glow or gradient backdrop.',
            'Put transform, filter or contain on anything wrapping the page.',
          ]}
        />
      </DocBlock>
    </DocSection>
  )
}
